// Validadores para horarios - RF-03

import { SesionClase, DiaSemana, DIAS_SEMANA } from '../types';

/**
 * Verifica si dos sesiones se traslapan
 */
export const hayTraslape = (sesion1: SesionClase, sesion2: SesionClase): boolean => {
  // Solo pueden traslaparse si son el mismo día
  if (sesion1.dia !== sesion2.dia) return false;
  
  // No hay traslape si una termina antes de que empiece la otra
  return !(sesion1.horaFin <= sesion2.horaInicio || sesion2.horaFin <= sesion1.horaInicio);
};

/**
 * Valida que un conjunto de sesiones no tenga traslapes
 * Algoritmo optimizado O(n log n) ordenando por hora de inicio
 */
export const validarSinTraslapes = (sesiones: SesionClase[]): boolean => {
  // Agrupar por día
  const sesionesPorDia: Record<DiaSemana, SesionClase[]> = {
    'Lunes': [],
    'Martes': [],
    'Miércoles': [],
    'Jueves': [],
    'Viernes': [],
    'Sábado': [],
  };
  
  sesiones.forEach(sesion => {
    sesionesPorDia[sesion.dia].push(sesion);
  });
  
  // Verificar traslapes en cada día (ordenando primero)
  for (const dia of DIAS_SEMANA) {
    const sesionesDia = sesionesPorDia[dia];
    
    if (sesionesDia.length < 2) continue;
    
    // Ordenar por hora de inicio
    const ordenadas = [...sesionesDia].sort((a, b) => a.horaInicio - b.horaInicio);
    
    // Verificar traslapes secuencialmente
    for (let i = 1; i < ordenadas.length; i++) {
      if (ordenadas[i].horaInicio < ordenadas[i - 1].horaFin) {
        return false; // Hay traslape
      }
    }
  }
  
  return true; // Sin traslapes
};

/**
 * Encuentra todas las sesiones que se traslapan con una sesión dada
 */
export const encontrarTraslapes = (sesion: SesionClase, sesiones: SesionClase[]): SesionClase[] => {
  return sesiones.filter(s => s.id !== sesion.id && hayTraslape(sesion, s));
};

/**
 * Calcula las horas muertas (huecos) en un conjunto de sesiones
 * RF-04: Minimizar horas muertas
 */
export const calcularHorasMuertas = (sesiones: SesionClase[]): number => {
  let horasMuertasTotal = 0;
  
  // Agrupar por día
  const sesionesPorDia: Record<DiaSemana, SesionClase[]> = {
    'Lunes': [],
    'Martes': [],
    'Miércoles': [],
    'Jueves': [],
    'Viernes': [],
    'Sábado': [],
  };
  
  sesiones.forEach(sesion => {
    sesionesPorDia[sesion.dia].push(sesion);
  });
  
  // Calcular huecos por día
  for (const dia of DIAS_SEMANA) {
    const sesionesDia = sesionesPorDia[dia];
    
    if (sesionesDia.length < 2) continue;
    
    // Ordenar por hora de inicio
    const ordenadas = [...sesionesDia].sort((a, b) => a.horaInicio - b.horaInicio);
    
    // Sumar huecos entre clases
    for (let i = 1; i < ordenadas.length; i++) {
      const hueco = ordenadas[i].horaInicio - ordenadas[i - 1].horaFin;
      if (hueco > 0) {
        horasMuertasTotal += hueco;
      }
    }
  }
  
  return horasMuertasTotal;
};

/**
 * Cuenta días con clases
 */
export const contarDiasConClases = (sesiones: SesionClase[]): number => {
  const diasConClases = new Set(sesiones.map(s => s.dia));
  return diasConClases.size;
};

/**
 * Obtiene la hora más temprana de inicio
 */
export const obtenerHoraMasTemprana = (sesiones: SesionClase[]): number => {
  if (sesiones.length === 0) return 0;
  return Math.min(...sesiones.map(s => s.horaInicio));
};

/**
 * Obtiene la hora más tardía de fin
 */
export const obtenerHoraMasTardia = (sesiones: SesionClase[]): number => {
  if (sesiones.length === 0) return 0;
  return Math.max(...sesiones.map(s => s.horaFin));
};
