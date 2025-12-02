// Store para manejar horarios generados y guardados

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Horario } from '../types';

interface HorariosState {
  // Horarios generados (temporales)
  horariosGenerados: Horario[];
  
  // Horarios guardados por el usuario
  horariosGuardados: Horario[];
  
  // Estado
  isGenerando: boolean;
  horarioActual: Horario | null;
  
  // Acciones
  setHorariosGenerados: (horarios: Horario[]) => void;
  guardarHorario: (horario: Horario) => void;
  eliminarHorario: (horarioId: string) => void;
  setHorarioActual: (horario: Horario | null) => void;
  setIsGenerando: (value: boolean) => void;
  limpiarGenerados: () => void;
  
  // Getters
  obtenerHorarioPorId: (id: string) => Horario | undefined;
  hayHorariosGenerados: () => boolean;
  hayHorariosGuardados: () => boolean;
}

export const useHorariosStore = create<HorariosState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      horariosGenerados: [],
      horariosGuardados: [],
      isGenerando: false,
      horarioActual: null,
      
      // Establecer horarios generados
      setHorariosGenerados: (horarios) => {
        set({ horariosGenerados: horarios, isGenerando: false });
      },
      
      // Guardar un horario (mover de generados a guardados)
      guardarHorario: (horario) => {
        const { horariosGuardados } = get();
        
        // Verificar si ya está guardado
        if (horariosGuardados.some(h => h.id === horario.id)) {
          return;
        }
        
        const horarioConFecha = {
          ...horario,
          creadoEn: new Date(),
        };
        
        set({
          horariosGuardados: [...horariosGuardados, horarioConFecha],
        });
      },
      
      // Eliminar horario guardado
      eliminarHorario: (horarioId) => {
        const { horariosGuardados, horarioActual } = get();
        
        set({
          horariosGuardados: horariosGuardados.filter(h => h.id !== horarioId),
          horarioActual: horarioActual?.id === horarioId ? null : horarioActual,
        });
      },
      
      // Establecer horario actual (para ver detalle)
      setHorarioActual: (horario) => {
        set({ horarioActual: horario });
      },
      
      // Establecer estado de generación
      setIsGenerando: (value) => {
        set({ isGenerando: value });
      },
      
      // Limpiar horarios generados
      limpiarGenerados: () => {
        set({ horariosGenerados: [], horarioActual: null });
      },
      
      // Obtener horario por ID (busca en generados y guardados)
      obtenerHorarioPorId: (id) => {
        const { horariosGenerados, horariosGuardados } = get();
        return (
          horariosGenerados.find(h => h.id === id) ||
          horariosGuardados.find(h => h.id === id)
        );
      },
      
      // Verificar si hay horarios generados
      hayHorariosGenerados: () => {
        return get().horariosGenerados.length > 0;
      },
      
      // Verificar si hay horarios guardados
      hayHorariosGuardados: () => {
        return get().horariosGuardados.length > 0;
      },
    }),
    {
      name: 'sioh-horarios-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        horariosGuardados: state.horariosGuardados,
      }),
    }
  )
);
