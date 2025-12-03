// Store para configuración del usuario (carrera, turno, semestre, tipo estudiante)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  CarreraId, 
  Turno, 
  TipoEstudiante, 
  Semestre, 
  ConfiguracionUsuario,
  SemestresPorTurno,
  MAX_SEMESTRES_IRREGULAR,
  MAX_SEMESTRES_REGULAR,
  CARRERAS,
} from '../types';
import { obtenerSemestresDisponibles, obtenerSemestresDisponiblesMultiTurno } from '../data/horariosParser';

interface ConfigState extends ConfiguracionUsuario {
  // Acciones
  setCarrera: (carrera: CarreraId) => void;
  setTurno: (turno: Turno) => void;
  toggleTurno: (turno: Turno) => void;
  setPermitirAmbosTurnos: (permitir: boolean) => void;
  setTipoEstudiante: (tipo: TipoEstudiante) => void;
  toggleSemestre: (semestre: Semestre) => void;
  toggleSemestrePorTurno: (turno: Turno, semestre: Semestre) => void;
  setSemestresSeleccionados: (semestres: Semestre[]) => void;
  limpiarConfiguracion: () => void;
  resetearSeleccion: () => void; // Resetea turnos y semestres, mantiene carrera
  
  // Getters
  obtenerCarreraNombre: () => string;
  obtenerSemestresDisponibles: () => Semestre[];
  obtenerSemestresDisponiblesPorTurno: (turno: Turno) => Semestre[];
  obtenerTurnosActivos: () => Turno[];
  obtenerTotalSemestresSeleccionados: () => number;
  obtenerTodosSemestresSeleccionados: () => Semestre[];
  esConfiguracionValida: () => boolean;
  puedeAgregarSemestre: () => boolean;
  puedeAgregarSemestreEnTurno: (turno: Turno) => boolean;
}

const configuracionInicial: ConfiguracionUsuario = {
  carrera: null,
  turno: null,
  turnos: [],
  permitirAmbosTurnos: false,
  tipoEstudiante: 'regular',
  semestresSeleccionados: [],
  semestresPorTurno: { matutino: [], vespertino: [] },
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      ...configuracionInicial,
      
      // Establecer carrera
      setCarrera: (carrera) => {
        set({ 
          carrera,
          // Resetear semestres al cambiar carrera
          semestresSeleccionados: [],
          semestresPorTurno: { matutino: [], vespertino: [] },
        });
      },
      
      // Establecer turno único (para compatibilidad)
      setTurno: (turno) => {
        const { permitirAmbosTurnos } = get();
        set({ 
          turno,
          turnos: permitirAmbosTurnos ? get().turnos : [turno],
          // Resetear semestres al cambiar turno
          semestresSeleccionados: [],
          semestresPorTurno: { matutino: [], vespertino: [] },
        });
      },
      
      // Toggle turno para multi-selección
      toggleTurno: (turno) => {
        const { turnos, permitirAmbosTurnos, semestresPorTurno } = get();
        
        if (!permitirAmbosTurnos) {
          // Si no permite ambos, funciona como setTurno
          set({
            turno,
            turnos: [turno],
            semestresSeleccionados: [],
            semestresPorTurno: { matutino: [], vespertino: [] },
          });
        } else {
          // Permite múltiples turnos
          if (turnos.includes(turno)) {
            // No permitir quitar si solo queda uno
            if (turnos.length > 1) {
              const nuevosTurnos = turnos.filter(t => t !== turno);
              // Limpiar semestres del turno que se quita
              const nuevosSemestresPorTurno = { ...semestresPorTurno };
              nuevosSemestresPorTurno[turno] = [];
              set({
                turnos: nuevosTurnos,
                turno: nuevosTurnos[0],
                semestresPorTurno: nuevosSemestresPorTurno,
              });
            }
          } else {
            set({
              turnos: [...turnos, turno].sort(),
              turno: turno,
            });
          }
        }
      },
      
      // Activar/desactivar opción de ambos turnos
      setPermitirAmbosTurnos: (permitir) => {
        const { turno, turnos } = get();
        
        if (permitir) {
          // Al activar, mantener el turno actual seleccionado
          set({
            permitirAmbosTurnos: true,
            turnos: turno ? [turno] : [],
            semestresSeleccionados: [],
            semestresPorTurno: { matutino: [], vespertino: [] },
          });
        } else {
          // Al desactivar, mantener solo el primer turno
          set({
            permitirAmbosTurnos: false,
            turnos: turnos.length > 0 ? [turnos[0]] : [],
            turno: turnos.length > 0 ? turnos[0] : null,
            semestresSeleccionados: [],
            semestresPorTurno: { matutino: [], vespertino: [] },
          });
        }
      },
      
      // Establecer tipo de estudiante
      setTipoEstudiante: (tipo) => {
        const { semestresSeleccionados, semestresPorTurno, permitirAmbosTurnos } = get();
        
        if (tipo === 'regular') {
          // Regular: hasta 2 semestres consecutivos hacia adelante
          if (permitirAmbosTurnos) {
            // Mantener solo los primeros 2 semestres consecutivos (pueden estar en diferentes turnos)
            const todosOrdenados: { turno: Turno; semestre: Semestre }[] = [];
            semestresPorTurno.matutino.forEach(s => todosOrdenados.push({ turno: 'matutino', semestre: s }));
            semestresPorTurno.vespertino.forEach(s => todosOrdenados.push({ turno: 'vespertino', semestre: s }));
            todosOrdenados.sort((a, b) => a.semestre - b.semestre);
            
            const nuevosPorTurno: SemestresPorTurno = { matutino: [], vespertino: [] };
            todosOrdenados.slice(0, MAX_SEMESTRES_REGULAR).forEach(item => {
              nuevosPorTurno[item.turno].push(item.semestre);
            });
            
            set({
              tipoEstudiante: tipo,
              semestresPorTurno: nuevosPorTurno,
            });
          } else if (semestresSeleccionados.length > MAX_SEMESTRES_REGULAR) {
            // Mantener solo los primeros 2 consecutivos
            const sorted = [...semestresSeleccionados].sort((a, b) => a - b);
            set({
              tipoEstudiante: tipo,
              semestresSeleccionados: sorted.slice(0, MAX_SEMESTRES_REGULAR),
            });
          } else {
            set({ tipoEstudiante: tipo });
          }
        } else {
          set({ tipoEstudiante: tipo });
        }
      },
      
      // Toggle semestre (agregar/quitar)
      toggleSemestre: (semestre) => {
        const { semestresSeleccionados, tipoEstudiante } = get();
        
        if (semestresSeleccionados.includes(semestre)) {
          // Quitar semestre
          set({
            semestresSeleccionados: semestresSeleccionados.filter(s => s !== semestre),
          });
        } else {
          // Agregar semestre
          if (tipoEstudiante === 'regular') {
            // Regular: hasta 2 semestres consecutivos hacia adelante
            if (semestresSeleccionados.length === 0) {
              // Primer semestre: se puede agregar cualquiera
              set({ semestresSeleccionados: [semestre] });
            } else if (semestresSeleccionados.length < MAX_SEMESTRES_REGULAR) {
              // Segundo semestre: solo si es consecutivo hacia adelante
              const semestreBase = Math.min(...semestresSeleccionados);
              // Solo permitir semestres que sean el siguiente o el subsiguiente del base
              if (semestre === semestreBase + 1 || semestre === semestreBase + 2) {
                set({
                  semestresSeleccionados: [...semestresSeleccionados, semestre].sort((a, b) => a - b),
                });
              }
            }
          } else {
            // Irregular: máximo 3 semestres
            if (semestresSeleccionados.length < MAX_SEMESTRES_IRREGULAR) {
              set({
                semestresSeleccionados: [...semestresSeleccionados, semestre].sort((a, b) => a - b),
              });
            }
          }
        }
      },
      
      // Toggle semestre por turno específico (para modo ambos turnos)
      toggleSemestrePorTurno: (turno, semestre) => {
        const { semestresPorTurno, tipoEstudiante } = get();
        const semestresDelTurno = semestresPorTurno[turno];
        const totalActual = semestresPorTurno.matutino.length + semestresPorTurno.vespertino.length;
        
        if (semestresDelTurno.includes(semestre)) {
          // Quitar semestre
          set({
            semestresPorTurno: {
              ...semestresPorTurno,
              [turno]: semestresDelTurno.filter(s => s !== semestre),
            },
          });
        } else {
          // Agregar semestre
          if (tipoEstudiante === 'regular') {
            // Regular: hasta 2 semestres consecutivos hacia adelante
            // PUEDE ser en diferentes turnos (ej: 5º matutino + 6º vespertino)
            if (totalActual === 0) {
              // Primer semestre: se puede agregar cualquiera en cualquier turno
              set({
                semestresPorTurno: {
                  ...semestresPorTurno,
                  [turno]: [semestre],
                },
              });
            } else if (totalActual < MAX_SEMESTRES_REGULAR) {
              // Segundo semestre: debe ser consecutivo hacia adelante (puede ser en otro turno)
              const todosSeleccionados = [...semestresPorTurno.matutino, ...semestresPorTurno.vespertino];
              const semestreBase = Math.min(...todosSeleccionados);
              // Permitir semestres que sean el siguiente o subsiguiente del base
              if (semestre === semestreBase + 1 || semestre === semestreBase + 2) {
                set({
                  semestresPorTurno: {
                    ...semestresPorTurno,
                    [turno]: [...semestresDelTurno, semestre].sort((a, b) => a - b),
                  },
                });
              }
            }
          } else {
            // Irregular: máximo 3 semestres totales
            if (totalActual < MAX_SEMESTRES_IRREGULAR) {
              set({
                semestresPorTurno: {
                  ...semestresPorTurno,
                  [turno]: [...semestresDelTurno, semestre].sort((a, b) => a - b),
                },
              });
            }
          }
        }
      },
      
      // Establecer semestres directamente
      setSemestresSeleccionados: (semestres) => {
        const { tipoEstudiante } = get();
        
        if (tipoEstudiante === 'regular') {
          set({ semestresSeleccionados: semestres.slice(0, MAX_SEMESTRES_REGULAR) });
        } else {
          set({ semestresSeleccionados: semestres.slice(0, MAX_SEMESTRES_IRREGULAR) });
        }
      },
      
      // Limpiar toda la configuración
      limpiarConfiguracion: () => {
        set(configuracionInicial);
      },
      
      // Resetear solo turnos y semestres (mantiene carrera y tipo estudiante)
      resetearSeleccion: () => {
        set({
          turno: null,
          turnos: [],
          permitirAmbosTurnos: false,
          semestresSeleccionados: [],
          semestresPorTurno: { matutino: [], vespertino: [] },
        });
      },
      
      // Obtener nombre de la carrera
      obtenerCarreraNombre: () => {
        const { carrera } = get();
        if (!carrera) return '';
        return CARRERAS.find(c => c.id === carrera)?.nombre || '';
      },
      
      // Obtener semestres disponibles para la configuración actual
      obtenerSemestresDisponibles: () => {
        const { carrera, turnos, permitirAmbosTurnos, turno } = get();
        if (!carrera) return [];
        
        if (permitirAmbosTurnos && turnos.length > 0) {
          return obtenerSemestresDisponiblesMultiTurno(carrera, turnos);
        } else if (turno) {
          return obtenerSemestresDisponibles(carrera, turno);
        }
        return [];
      },
      
      // Obtener semestres disponibles para un turno específico
      obtenerSemestresDisponiblesPorTurno: (turnoParam) => {
        const { carrera } = get();
        if (!carrera) return [];
        return obtenerSemestresDisponibles(carrera, turnoParam);
      },
      
      // Obtener turnos activos
      obtenerTurnosActivos: () => {
        const { permitirAmbosTurnos, turnos, turno } = get();
        if (permitirAmbosTurnos) {
          return turnos;
        }
        return turno ? [turno] : [];
      },
      
      // Obtener total de semestres seleccionados (ambos turnos)
      obtenerTotalSemestresSeleccionados: () => {
        const { permitirAmbosTurnos, semestresSeleccionados, semestresPorTurno } = get();
        if (permitirAmbosTurnos) {
          return semestresPorTurno.matutino.length + semestresPorTurno.vespertino.length;
        }
        return semestresSeleccionados.length;
      },
      
      // Obtener todos los semestres seleccionados (combina ambos modos)
      obtenerTodosSemestresSeleccionados: () => {
        const { permitirAmbosTurnos, semestresSeleccionados, semestresPorTurno } = get();
        if (permitirAmbosTurnos) {
          const todos = [...semestresPorTurno.matutino, ...semestresPorTurno.vespertino];
          return [...new Set(todos)].sort((a, b) => a - b);
        }
        return semestresSeleccionados;
      },
      
      // Verificar si la configuración es válida
      esConfiguracionValida: () => {
        const { carrera, turno, turnos, permitirAmbosTurnos, semestresSeleccionados, semestresPorTurno } = get();
        const tieneTurno = permitirAmbosTurnos ? turnos.length > 0 : turno !== null;
        
        let tieneSemestres = false;
        if (permitirAmbosTurnos) {
          tieneSemestres = semestresPorTurno.matutino.length > 0 || semestresPorTurno.vespertino.length > 0;
        } else {
          tieneSemestres = semestresSeleccionados.length > 0;
        }
        
        return carrera !== null && tieneTurno && tieneSemestres;
      },
      
      // Verificar si puede agregar más semestres
      puedeAgregarSemestre: () => {
        const { tipoEstudiante, semestresSeleccionados, permitirAmbosTurnos, semestresPorTurno } = get();
        const maxSemestres = tipoEstudiante === 'regular' ? MAX_SEMESTRES_REGULAR : MAX_SEMESTRES_IRREGULAR;
        if (permitirAmbosTurnos) {
          const total = semestresPorTurno.matutino.length + semestresPorTurno.vespertino.length;
          return total < maxSemestres;
        }
        return semestresSeleccionados.length < maxSemestres;
      },
      
      // Verificar si puede agregar semestre en un turno específico
      puedeAgregarSemestreEnTurno: (turnoParam) => {
        const { tipoEstudiante, semestresPorTurno } = get();
        const total = semestresPorTurno.matutino.length + semestresPorTurno.vespertino.length;
        const maxSemestres = tipoEstudiante === 'regular' ? MAX_SEMESTRES_REGULAR : MAX_SEMESTRES_IRREGULAR;
        return total < maxSemestres;
      },
    }),
    {
      name: 'sioh-config-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
