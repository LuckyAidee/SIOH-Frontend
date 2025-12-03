// Parser para convertir Horarios.json a estructuras internas

import {
  CarreraId,
  Turno,
  Semestre,
  Materia,
  Grupo,
  SesionClase,
  ClaseJSON,
  DIA_MAP,
  DiaSemana,
} from '../types';
import horariosData from './horarios.json';
import { generarId } from '../utils/timeHelpers';

/**
 * Parsea una hora en formato "HH:MM" a minutos desde medianoche
 */
const horaAMinutos = (hora: string): number => {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
};

/**
 * Parsea un rango de hora "07:00-08:30" a { inicio, fin }
 */
const parsearRangoHora = (rango: string): { inicio: number; fin: number } | null => {
  const partes = rango.split('-');
  if (partes.length !== 2) return null;
  
  const inicio = horaAMinutos(partes[0]);
  const fin = horaAMinutos(partes[1]);
  
  if (isNaN(inicio) || isNaN(fin)) return null;
  
  return { inicio, fin };
};

/**
 * Extrae turno y semestre de la clave del JSON
 * Ejemplo: "turno_matutino_semestre_1" -> { turno: 'matutino', semestre: 1 }
 */
const parsearClaveSemestre = (clave: string): { turno: Turno; semestre: Semestre } | null => {
  const match = clave.match(/turno_(matutino|vespertino)_semestre_(\d+)/);
  if (!match) return null;
  
  return {
    turno: match[1] as Turno,
    semestre: parseInt(match[2]) as Semestre,
  };
};

/**
 * Convierte una ClaseJSON a Grupo con sus SesionClase
 */
const claseJSONAGrupo = (
  clase: ClaseJSON,
  materiaId: string,
  materiaNombre: string
): Grupo => {
  const grupoId = generarId();
  const sesiones: SesionClase[] = [];
  
  // Iterar sobre los días y horarios
  Object.entries(clase.horarios).forEach(([diaAbrev, horarioValue]) => {
    const dia = DIA_MAP[diaAbrev];
    if (!dia) return;
    
    // Manejar tanto string como array
    const horarios = Array.isArray(horarioValue) ? horarioValue : [horarioValue];
    
    horarios.forEach((rangoHora) => {
      const rango = parsearRangoHora(rangoHora);
      if (!rango) return;
      
      sesiones.push({
        id: generarId(),
        grupoId,
        dia,
        horaInicio: rango.inicio,
        horaFin: rango.fin,
        salon: clase.salon,
        edificio: clase.edificio,
      });
    });
  });
  
  return {
    id: grupoId,
    numero: clase.grupo,
    materiaId,
    materiaNombre,
    profesor: clase.profesor,
    sesiones,
    esFijado: false,
  };
};

/**
 * Obtiene las materias disponibles para una configuración específica
 */
export const obtenerMateriasDisponibles = (
  carrera: CarreraId,
  turno: Turno,
  semestres: Semestre[]
): Materia[] => {
  const materias: Materia[] = [];
  const materiasVistas = new Set<string>();
  
  const carreraData = (horariosData.horarios as any)[carrera];
  if (!carreraData) return [];
  
  // Iterar sobre las claves de semestre
  Object.keys(carreraData).forEach((claveSemestre) => {
    const parsed = parsearClaveSemestre(claveSemestre);
    if (!parsed) return;
    
    // Filtrar por turno y semestres seleccionados
    if (parsed.turno !== turno) return;
    if (!semestres.includes(parsed.semestre)) return;
    
    const clases: ClaseJSON[] = carreraData[claveSemestre];
    
    clases.forEach((clase) => {
      // Crear ID único basado en asignatura + semestre
      const materiaKey = `${clase.asignatura}-${parsed.semestre}`;
      
      if (!materiasVistas.has(materiaKey)) {
        materiasVistas.add(materiaKey);
        
        materias.push({
          id: materiaKey,
          nombre: clase.asignatura,
          codigo: clase.grupo.substring(0, 2), // Primeros 2 caracteres del grupo
          semestre: parsed.semestre,
          turno: parsed.turno,
        });
      }
    });
  });
  
  // Ordenar por semestre y nombre
  return materias.sort((a, b) => {
    if (a.semestre !== b.semestre) return a.semestre - b.semestre;
    return a.nombre.localeCompare(b.nombre);
  });
};

/**
 * Obtiene los grupos disponibles para una materia específica
 */
export const obtenerGruposDeMateria = (
  carrera: CarreraId,
  turno: Turno,
  materia: Materia
): Grupo[] => {
  const grupos: Grupo[] = [];
  
  const carreraData = (horariosData.horarios as any)[carrera];
  if (!carreraData) return [];
  
  // Buscar en el semestre de la materia
  const claveSemestre = `turno_${turno}_semestre_${materia.semestre}`;
  const clases: ClaseJSON[] = carreraData[claveSemestre] || [];
  
  // Filtrar clases de esta asignatura
  clases
    .filter((clase) => clase.asignatura === materia.nombre)
    .forEach((clase) => {
      grupos.push(claseJSONAGrupo(clase, materia.id, materia.nombre));
    });
  
  return grupos;
};

/**
 * Obtiene todos los grupos organizados por materia
 */
export const obtenerTodosLosGrupos = (
  carrera: CarreraId,
  turno: Turno,
  semestres: Semestre[]
): Record<string, Grupo[]> => {
  const gruposPorMateria: Record<string, Grupo[]> = {};
  
  const materias = obtenerMateriasDisponibles(carrera, turno, semestres);
  
  materias.forEach((materia) => {
    gruposPorMateria[materia.id] = obtenerGruposDeMateria(carrera, turno, materia);
  });
  
  return gruposPorMateria;
};

/**
 * Obtiene los semestres disponibles para una carrera y turno
 */
export const obtenerSemestresDisponibles = (
  carrera: CarreraId,
  turno: Turno
): Semestre[] => {
  const semestresDisponibles = new Set<Semestre>();
  
  const carreraData = (horariosData.horarios as any)[carrera];
  if (!carreraData) return [];
  
  Object.keys(carreraData).forEach((claveSemestre) => {
    const parsed = parsearClaveSemestre(claveSemestre);
    if (parsed && parsed.turno === turno) {
      semestresDisponibles.add(parsed.semestre);
    }
  });
  
  return Array.from(semestresDisponibles).sort((a, b) => a - b);
};

/**
 * Obtiene los semestres disponibles para múltiples turnos (ambos turnos)
 */
export const obtenerSemestresDisponiblesMultiTurno = (
  carrera: CarreraId,
  turnos: Turno[]
): Semestre[] => {
  const semestresDisponibles = new Set<Semestre>();
  
  const carreraData = (horariosData.horarios as any)[carrera];
  if (!carreraData) return [];
  
  Object.keys(carreraData).forEach((claveSemestre) => {
    const parsed = parsearClaveSemestre(claveSemestre);
    if (parsed && turnos.includes(parsed.turno)) {
      semestresDisponibles.add(parsed.semestre);
    }
  });
  
  return Array.from(semestresDisponibles).sort((a, b) => a - b);
};

/**
 * Obtiene materias disponibles para múltiples turnos
 */
export const obtenerMateriasDisponiblesMultiTurno = (
  carrera: CarreraId,
  turnos: Turno[],
  semestres: Semestre[]
): Materia[] => {
  const materias: Materia[] = [];
  const materiasVistas = new Set<string>();
  
  const carreraData = (horariosData.horarios as any)[carrera];
  if (!carreraData) return [];
  
  // Iterar sobre las claves de semestre
  Object.keys(carreraData).forEach((claveSemestre) => {
    const parsed = parsearClaveSemestre(claveSemestre);
    if (!parsed) return;
    
    // Filtrar por turnos y semestres seleccionados
    if (!turnos.includes(parsed.turno)) return;
    if (!semestres.includes(parsed.semestre)) return;
    
    const clases: ClaseJSON[] = carreraData[claveSemestre];
    
    clases.forEach((clase) => {
      // Crear ID único basado en asignatura + semestre + turno
      const materiaKey = `${clase.asignatura}-${parsed.semestre}-${parsed.turno}`;
      
      if (!materiasVistas.has(materiaKey)) {
        materiasVistas.add(materiaKey);
        
        materias.push({
          id: materiaKey,
          nombre: clase.asignatura,
          codigo: clase.grupo.substring(0, 2),
          semestre: parsed.semestre,
          turno: parsed.turno,
        });
      }
    });
  });
  
  // Ordenar por semestre, turno y nombre
  return materias.sort((a, b) => {
    if (a.semestre !== b.semestre) return a.semestre - b.semestre;
    if (a.turno !== b.turno) return a.turno.localeCompare(b.turno);
    return a.nombre.localeCompare(b.nombre);
  });
};

/**
 * Obtiene todos los grupos para múltiples turnos
 */
export const obtenerTodosLosGruposMultiTurno = (
  carrera: CarreraId,
  turnos: Turno[],
  semestres: Semestre[]
): Record<string, Grupo[]> => {
  const gruposPorMateria: Record<string, Grupo[]> = {};
  
  const materias = obtenerMateriasDisponiblesMultiTurno(carrera, turnos, semestres);
  
  materias.forEach((materia) => {
    gruposPorMateria[materia.id] = obtenerGruposDeMateria(carrera, materia.turno, materia);
  });
  
  return gruposPorMateria;
};

/**
 * Verifica si hay datos disponibles para una carrera y turno
 */
export const hayDatosDisponibles = (
  carrera: CarreraId,
  turno: Turno
): boolean => {
  const semestres = obtenerSemestresDisponibles(carrera, turno);
  return semestres.length > 0;
};
