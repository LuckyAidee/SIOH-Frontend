// Tipos principales del sistema SIOH

export interface Materia {
  id: string;
  nombre: string;
  codigo: string;
  creditos: number;
  esObligatoria: boolean;
}

export interface SesionClase {
  id: string;
  grupoId: string;
  dia: DiaSemana;
  horaInicio: number; // Minutos desde medianoche (ej: 420 = 07:00)
  horaFin: number;    // Minutos desde medianoche (ej: 540 = 09:00)
  salon: string;
}

export interface Grupo {
  id: string;
  numero: string;
  materiaId: string;
  profesor: string;
  cupoMaximo: number;
  cupoDisponible: number;
  sesiones: SesionClase[];
  esFijado: boolean;
}

export interface Horario {
  id: string;
  nombre: string;
  grupos: Grupo[];
  sesiones: SesionClase[];
  horasMuertas: number;
  puntuacion: number;
  creadoEn: Date;
}

export interface Preferencias {
  materiasSeleccionadasIds: string[];
  gruposFijadosIds: string[];
  horaInicioPreferida: number;
  horaFinPreferida: number;
  minimizarHorasMuertas: boolean;
  notificacionesActivas: boolean;
}

export type DiaSemana = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';

export const DIAS_SEMANA: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
