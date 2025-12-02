// Configuración global de la aplicación SIOH

export const CONFIG = {
  // Límite máximo de horarios a generar
  MAX_HORARIOS_GENERADOS: 100,
  
  // Horarios por defecto (en minutos desde medianoche)
  HORA_INICIO_DIA: 420,  // 07:00
  HORA_FIN_DIA: 1320,    // 22:00
  
  // Duración mínima de clase (minutos)
  DURACION_MINIMA_CLASE: 50,
  
  // Peso para cálculo de puntuación
  PESO_HORAS_MUERTAS: -10,
  PESO_HORA_TEMPRANA: -5,
  PESO_DIAS_LIBRES: 20,
  
  // Storage keys
  STORAGE_KEYS: {
    PREFERENCIAS: '@sioh/preferencias',
    HORARIOS_GUARDADOS: '@sioh/horarios',
    MATERIAS_SELECCIONADAS: '@sioh/materias',
  },
  
  // App info
  APP_NAME: 'SIOH',
  APP_VERSION: '1.0.0',
  APP_SCHEME: 'sioh',
} as const;
