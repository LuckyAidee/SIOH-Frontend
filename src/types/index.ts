// Tipos principales del sistema SIOH

// ============== USUARIO Y AUTENTICACIÓN ==============

export interface User {
  id: string;
  nombre: string;
  email: string;
  carrera: CarreraId;
  creadoEn: Date;
}

// ============== CONFIGURACIÓN UPIIT ==============

export type CarreraId = 
  | 'biotecnologia' 
  | 'ciencia_de_datos' 
  | 'inteligencia_artificial' 
  | 'sistemas_automotrices' 
  | 'ingenieria_transporte'
  | 'ingenieria_industrial';

export type Turno = 'matutino' | 'vespertino';

export type TipoEstudiante = 'regular' | 'irregular';

export interface Carrera {
  id: CarreraId;
  nombre: string;
  abreviatura: string;
}

export const CARRERAS: Carrera[] = [
  { id: 'biotecnologia', nombre: 'Ingeniería Biotecnológica', abreviatura: 'IBT' },
  { id: 'ciencia_de_datos', nombre: 'Licenciatura en Ciencia de Datos', abreviatura: 'LCD' },
  { id: 'inteligencia_artificial', nombre: 'Ingeniería en Inteligencia Artificial', abreviatura: 'IIA' },
  { id: 'sistemas_automotrices', nombre: 'Ingeniería en Sistemas Automotrices', abreviatura: 'ISA' },
  { id: 'ingenieria_transporte', nombre: 'Ingeniería en Transporte', abreviatura: 'IT' },
  { id: 'ingenieria_industrial', nombre: 'Ingeniería Industrial', abreviatura: 'II' },
];

export const SEMESTRES = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type Semestre = typeof SEMESTRES[number];

export const MAX_SEMESTRES_IRREGULAR = 3;
export const MAX_SEMESTRES_REGULAR = 2;

// Semestres seleccionados por turno
export interface SemestresPorTurno {
  matutino: Semestre[];
  vespertino: Semestre[];
}

export interface ConfiguracionUsuario {
  carrera: CarreraId | null;
  turno: Turno | null;
  turnos: Turno[]; // Para selección de ambos turnos
  permitirAmbosTurnos: boolean;
  tipoEstudiante: TipoEstudiante;
  semestresSeleccionados: Semestre[]; // Para modo turno único
  semestresPorTurno: SemestresPorTurno; // Para modo ambos turnos
}

// ============== DATOS DE HORARIOS JSON ==============

// Formato del JSON de horarios
export interface ClaseJSON {
  grupo: string;
  asignatura: string;
  profesor: string;
  edificio: string;
  salon: string;
  horarios: Record<string, string | string[]>; // "lun": "07:00-08:30" o "vie": ["11:30-13:00", "17:30-19:00"]
}

export interface HorariosJSON {
  horarios: Record<CarreraId, Record<string, ClaseJSON[]>>;
}

// ============== MODELOS INTERNOS ==============

export interface Materia {
  id: string;
  nombre: string;
  codigo: string;
  semestre: Semestre;
  turno: Turno;
}

export interface SesionClase {
  id: string;
  grupoId: string;
  dia: DiaSemana;
  horaInicio: number; // Minutos desde medianoche (ej: 420 = 07:00)
  horaFin: number;    // Minutos desde medianoche (ej: 540 = 09:00)
  salon: string;
  edificio: string;
}

export interface Grupo {
  id: string;
  numero: string;
  materiaId: string;
  materiaNombre: string;
  profesor: string;
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
  configuracion?: ConfiguracionUsuario;
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

// Mapeo de abreviaturas de día a DiaSemana
export const DIA_MAP: Record<string, DiaSemana> = {
  'lun': 'Lunes',
  'mar': 'Martes',
  'mie': 'Miércoles',
  'jue': 'Jueves',
  'vie': 'Viernes',
  'sab': 'Sábado',
};
