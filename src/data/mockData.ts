// Datos mock para desarrollo

import { Materia, Grupo, SesionClase } from '../types';
import { generarId } from '../utils/timeHelpers';

// Materias disponibles
export const MATERIAS_MOCK: Materia[] = [
  {
    id: '1',
    nombre: 'Ingeniería de Software',
    codigo: 'IS-401',
    creditos: 6,
    esObligatoria: true,
  },
  {
    id: '2',
    nombre: 'Bases de Datos',
    codigo: 'BD-301',
    creditos: 6,
    esObligatoria: true,
  },
  {
    id: '3',
    nombre: 'Redes de Computadoras',
    codigo: 'RC-401',
    creditos: 5,
    esObligatoria: true,
  },
  {
    id: '4',
    nombre: 'Inteligencia Artificial',
    codigo: 'IA-501',
    creditos: 6,
    esObligatoria: false,
  },
  {
    id: '5',
    nombre: 'Compiladores',
    codigo: 'CO-401',
    creditos: 5,
    esObligatoria: false,
  },
  {
    id: '6',
    nombre: 'Sistemas Operativos',
    codigo: 'SO-301',
    creditos: 6,
    esObligatoria: true,
  },
];

// Función helper para crear sesiones
const crearSesion = (
  grupoId: string,
  dia: SesionClase['dia'],
  horaInicio: number,
  horaFin: number,
  salon: string
): SesionClase => ({
  id: generarId(),
  grupoId,
  dia,
  horaInicio,
  horaFin,
  salon,
});

// Grupos por materia
export const GRUPOS_MOCK: Record<string, Grupo[]> = {
  // Ingeniería de Software
  '1': [
    {
      id: '1-G1',
      numero: '1IV1',
      materiaId: '1',
      profesor: 'Dr. García Hernández',
      cupoMaximo: 30,
      cupoDisponible: 12,
      esFijado: false,
      sesiones: [
        crearSesion('1-G1', 'Lunes', 420, 540, 'A-301'),      // 07:00-09:00
        crearSesion('1-G1', 'Miércoles', 420, 540, 'A-301'),  // 07:00-09:00
        crearSesion('1-G1', 'Viernes', 420, 540, 'A-301'),    // 07:00-09:00
      ],
    },
    {
      id: '1-G2',
      numero: '1IV2',
      materiaId: '1',
      profesor: 'Dra. López Martínez',
      cupoMaximo: 30,
      cupoDisponible: 5,
      esFijado: false,
      sesiones: [
        crearSesion('1-G2', 'Martes', 540, 660, 'B-201'),     // 09:00-11:00
        crearSesion('1-G2', 'Jueves', 540, 660, 'B-201'),     // 09:00-11:00
        crearSesion('1-G2', 'Viernes', 540, 660, 'B-201'),    // 09:00-11:00
      ],
    },
    {
      id: '1-G3',
      numero: '1IV3',
      materiaId: '1',
      profesor: 'Dr. García Hernández',
      cupoMaximo: 30,
      cupoDisponible: 20,
      esFijado: false,
      sesiones: [
        crearSesion('1-G3', 'Lunes', 660, 780, 'C-102'),      // 11:00-13:00
        crearSesion('1-G3', 'Miércoles', 660, 780, 'C-102'),  // 11:00-13:00
        crearSesion('1-G3', 'Viernes', 660, 780, 'C-102'),    // 11:00-13:00
      ],
    },
  ],
  
  // Bases de Datos
  '2': [
    {
      id: '2-G1',
      numero: '2BD1',
      materiaId: '2',
      profesor: 'Mtro. Pérez Sánchez',
      cupoMaximo: 28,
      cupoDisponible: 8,
      esFijado: false,
      sesiones: [
        crearSesion('2-G1', 'Lunes', 540, 660, 'C-105'),      // 09:00-11:00
        crearSesion('2-G1', 'Miércoles', 540, 660, 'C-105'),  // 09:00-11:00
        crearSesion('2-G1', 'Viernes', 540, 660, 'C-105'),    // 09:00-11:00
      ],
    },
    {
      id: '2-G2',
      numero: '2BD2',
      materiaId: '2',
      profesor: 'Dra. Ramírez Torres',
      cupoMaximo: 28,
      cupoDisponible: 15,
      esFijado: false,
      sesiones: [
        crearSesion('2-G2', 'Martes', 420, 540, 'D-201'),     // 07:00-09:00
        crearSesion('2-G2', 'Jueves', 420, 540, 'D-201'),     // 07:00-09:00
        crearSesion('2-G2', 'Sábado', 480, 600, 'D-201'),     // 08:00-10:00
      ],
    },
  ],
  
  // Redes de Computadoras
  '3': [
    {
      id: '3-G1',
      numero: '3RC1',
      materiaId: '3',
      profesor: 'Ing. Morales Vega',
      cupoMaximo: 25,
      cupoDisponible: 10,
      esFijado: false,
      sesiones: [
        crearSesion('3-G1', 'Martes', 660, 780, 'Lab-A'),     // 11:00-13:00
        crearSesion('3-G1', 'Jueves', 660, 780, 'Lab-A'),     // 11:00-13:00
      ],
    },
    {
      id: '3-G2',
      numero: '3RC2',
      materiaId: '3',
      profesor: 'Ing. Castillo Ruiz',
      cupoMaximo: 25,
      cupoDisponible: 3,
      esFijado: false,
      sesiones: [
        crearSesion('3-G2', 'Lunes', 780, 900, 'Lab-B'),      // 13:00-15:00
        crearSesion('3-G2', 'Miércoles', 780, 900, 'Lab-B'),  // 13:00-15:00
      ],
    },
  ],
  
  // Inteligencia Artificial
  '4': [
    {
      id: '4-G1',
      numero: '4IA1',
      materiaId: '4',
      profesor: 'Dr. Fernández Luna',
      cupoMaximo: 30,
      cupoDisponible: 18,
      esFijado: false,
      sesiones: [
        crearSesion('4-G1', 'Lunes', 900, 1020, 'E-301'),     // 15:00-17:00
        crearSesion('4-G1', 'Miércoles', 900, 1020, 'E-301'), // 15:00-17:00
        crearSesion('4-G1', 'Viernes', 900, 1020, 'E-301'),   // 15:00-17:00
      ],
    },
  ],
  
  // Compiladores
  '5': [
    {
      id: '5-G1',
      numero: '5CO1',
      materiaId: '5',
      profesor: 'Dr. Núñez Campos',
      cupoMaximo: 25,
      cupoDisponible: 22,
      esFijado: false,
      sesiones: [
        crearSesion('5-G1', 'Martes', 780, 900, 'F-102'),     // 13:00-15:00
        crearSesion('5-G1', 'Jueves', 780, 900, 'F-102'),     // 13:00-15:00
      ],
    },
    {
      id: '5-G2',
      numero: '5CO2',
      materiaId: '5',
      profesor: 'Mtra. Silva Ortega',
      cupoMaximo: 25,
      cupoDisponible: 7,
      esFijado: false,
      sesiones: [
        crearSesion('5-G2', 'Lunes', 1020, 1140, 'F-103'),    // 17:00-19:00
        crearSesion('5-G2', 'Miércoles', 1020, 1140, 'F-103'),// 17:00-19:00
      ],
    },
  ],
  
  // Sistemas Operativos
  '6': [
    {
      id: '6-G1',
      numero: '6SO1',
      materiaId: '6',
      profesor: 'Dr. Vargas Mendoza',
      cupoMaximo: 30,
      cupoDisponible: 14,
      esFijado: false,
      sesiones: [
        crearSesion('6-G1', 'Martes', 900, 1020, 'A-201'),    // 15:00-17:00
        crearSesion('6-G1', 'Jueves', 900, 1020, 'A-201'),    // 15:00-17:00
        crearSesion('6-G1', 'Viernes', 780, 900, 'A-201'),    // 13:00-15:00
      ],
    },
    {
      id: '6-G2',
      numero: '6SO2',
      materiaId: '6',
      profesor: 'Ing. Delgado Ríos',
      cupoMaximo: 30,
      cupoDisponible: 25,
      esFijado: false,
      sesiones: [
        crearSesion('6-G2', 'Lunes', 540, 660, 'B-102'),      // 09:00-11:00
        crearSesion('6-G2', 'Miércoles', 540, 660, 'B-102'),  // 09:00-11:00
        crearSesion('6-G2', 'Viernes', 420, 540, 'B-102'),    // 07:00-09:00
      ],
    },
  ],
};

/**
 * Obtiene todos los grupos de una materia
 */
export const obtenerGruposPorMateria = (materiaId: string): Grupo[] => {
  return GRUPOS_MOCK[materiaId] || [];
};

/**
 * Obtiene una materia por ID
 */
export const obtenerMateriaPorId = (id: string): Materia | undefined => {
  return MATERIAS_MOCK.find(m => m.id === id);
};

/**
 * Obtiene un grupo por ID
 */
export const obtenerGrupoPorId = (grupoId: string): Grupo | undefined => {
  for (const grupos of Object.values(GRUPOS_MOCK)) {
    const grupo = grupos.find(g => g.id === grupoId);
    if (grupo) return grupo;
  }
  return undefined;
};
