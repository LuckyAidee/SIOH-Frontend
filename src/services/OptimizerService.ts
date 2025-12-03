// Servicio de optimización de horarios

import { Grupo, Horario, SesionClase } from '../types';
import { validarSinTraslapes, calcularHorasMuertas, contarDiasConClases, obtenerHoraMasTemprana } from '../utils/validators';
import { generarId } from '../utils/timeHelpers';
import { CONFIG } from '../constants/config';

interface OptimizerOptions {
  maximizarDiasLibres?: boolean;
  minimizarHorasMuertas?: boolean;
  horaInicioPreferida?: number;
  horaFinPreferida?: number;
}

/**
 * Genera todas las combinaciones posibles de grupos
 * y retorna los mejores horarios ordenados por puntuación
 */
export const generarHorarios = (
  gruposPorMateria: Grupo[][],
  gruposFijados: string[] = [],
  opciones: OptimizerOptions = {}
): Horario[] => {
  const {
    minimizarHorasMuertas = true,
    maximizarDiasLibres = true,
    horaInicioPreferida = CONFIG.HORA_INICIO_DIA,
    horaFinPreferida = CONFIG.HORA_FIN_DIA,
  } = opciones;

  // Si no hay materias, retornar vacío
  if (gruposPorMateria.length === 0) {
    return [];
  }

  // Filtrar grupos fijados
  const gruposFiltrados = gruposPorMateria.map(grupos => {
    const grupoFijado = grupos.find(g => gruposFijados.includes(g.id));
    return grupoFijado ? [grupoFijado] : grupos;
  });

  // Generar combinaciones
  const combinaciones = generarCombinaciones(gruposFiltrados);

  // Filtrar combinaciones sin traslapes y calcular puntuación
  const horariosValidos: Horario[] = [];

  for (const combinacion of combinaciones) {
    const todasSesiones = combinacion.flatMap(grupo => grupo.sesiones);
    
    // Verificar que no hay traslapes
    if (!validarSinTraslapes(todasSesiones)) {
      continue;
    }

    // Verificar horario preferido
    const horaTemprana = obtenerHoraMasTemprana(todasSesiones);
    if (horaTemprana < horaInicioPreferida) {
      // Penalizar pero no descartar
    }

    // Calcular métricas
    const horasMuertas = calcularHorasMuertas(todasSesiones);
    const diasConClases = contarDiasConClases(todasSesiones);
    
    // Calcular puntuación
    const puntuacion = calcularPuntuacion(
      horasMuertas,
      diasConClases,
      horaTemprana,
      { minimizarHorasMuertas, maximizarDiasLibres, horaInicioPreferida }
    );

    const horario: Horario = {
      id: generarId(),
      nombre: `Horario ${horariosValidos.length + 1}`,
      grupos: combinacion,
      sesiones: todasSesiones,
      horasMuertas,
      puntuacion,
      creadoEn: new Date(),
    };

    horariosValidos.push(horario);

    // Limitar cantidad para no sobrecargar
    if (horariosValidos.length >= CONFIG.MAX_HORARIOS_GENERADOS * 2) {
      break;
    }
  }

  // Ordenar por puntuación y seleccionar variedad
  const ordenados = horariosValidos.sort((a, b) => b.puntuacion - a.puntuacion);
  
  // Seleccionar horarios variados: algunos mejores, algunos medios, algunos bajos
  const maxHorarios = Math.min(10, ordenados.length);
  if (ordenados.length <= maxHorarios) {
    return ordenados;
  }
  
  // Tomar horarios distribuidos: 4 mejores, 3 medios, 3 peores
  const seleccionados: Horario[] = [];
  const mejores = Math.min(4, ordenados.length);
  const medios = Math.min(3, Math.floor((ordenados.length - mejores) / 2));
  const peores = Math.min(3, ordenados.length - mejores - medios);
  
  // Mejores
  for (let i = 0; i < mejores; i++) {
    seleccionados.push(ordenados[i]);
  }
  
  // Medios (del centro)
  const inicioMedios = Math.floor(ordenados.length / 3);
  for (let i = 0; i < medios && inicioMedios + i < ordenados.length; i++) {
    if (!seleccionados.includes(ordenados[inicioMedios + i])) {
      seleccionados.push(ordenados[inicioMedios + i]);
    }
  }
  
  // Peores (del final)
  for (let i = 0; i < peores; i++) {
    const idx = ordenados.length - 1 - i;
    if (idx >= 0 && !seleccionados.includes(ordenados[idx])) {
      seleccionados.push(ordenados[idx]);
    }
  }
  
  // Ordenar resultado final por puntuacion
  return seleccionados.sort((a, b) => b.puntuacion - a.puntuacion).slice(0, 10);
};

/**
 * Genera todas las combinaciones posibles de grupos
 * usando producto cartesiano
 */
const generarCombinaciones = (gruposPorMateria: Grupo[][]): Grupo[][] => {
  if (gruposPorMateria.length === 0) return [[]];
  
  const [primero, ...resto] = gruposPorMateria;
  const combinacionesResto = generarCombinaciones(resto);
  
  const resultado: Grupo[][] = [];
  
  for (const grupo of primero) {
    for (const combinacion of combinacionesResto) {
      resultado.push([grupo, ...combinacion]);
      
      // Limitar para evitar explosión combinatoria
      if (resultado.length >= 10000) {
        return resultado;
      }
    }
  }
  
  return resultado;
};

/**
 * Calcula puntuación de un horario
 * Mayor puntuación = mejor horario
 */
const calcularPuntuacion = (
  horasMuertas: number,
  diasConClases: number,
  horaTemprana: number,
  opciones: {
    minimizarHorasMuertas: boolean;
    maximizarDiasLibres: boolean;
    horaInicioPreferida: number;
  }
): number => {
  let puntuacion = 100; // Base

  // Penalizar horas muertas
  if (opciones.minimizarHorasMuertas) {
    puntuacion += (horasMuertas / 60) * CONFIG.PESO_HORAS_MUERTAS;
  }

  // Bonificar días libres (menos días con clases = mejor)
  if (opciones.maximizarDiasLibres) {
    const diasLibres = 6 - diasConClases;
    puntuacion += diasLibres * CONFIG.PESO_DIAS_LIBRES;
  }

  // Penalizar clases muy temprano
  if (horaTemprana < opciones.horaInicioPreferida) {
    const horasTemprano = (opciones.horaInicioPreferida - horaTemprana) / 60;
    puntuacion += horasTemprano * CONFIG.PESO_HORA_TEMPRANA;
  }

  return Math.round(puntuacion * 100) / 100;
};

/**
 * Obtiene estadísticas de un horario
 */
export const obtenerEstadisticasHorario = (horario: Horario) => {
  const { sesiones } = horario;
  
  return {
    totalMaterias: horario.grupos.length,
    totalCreditos: horario.grupos.reduce((sum, g) => sum + 6, 0), // TODO: obtener créditos reales
    diasConClases: contarDiasConClases(sesiones),
    horasMuertas: horario.horasMuertas,
    horaInicio: obtenerHoraMasTemprana(sesiones),
    puntuacion: horario.puntuacion,
  };
};
