// Utilidades para manejo de tiempo

/**
 * Convierte hora en formato "HH:MM" a minutos desde medianoche
 */
export const horaAMinutos = (hora: string): number => {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Convierte minutos desde medianoche a formato "HH:MM"
 */
export const minutosAHora = (minutos: number): string => {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * Calcula duración en minutos entre dos horas
 */
export const calcularDuracion = (horaInicio: number, horaFin: number): number => {
  return horaFin - horaInicio;
};

/**
 * Formatea duración en minutos a texto legible
 */
export const formatearDuracion = (minutos: number): string => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  
  if (horas === 0) return `${mins} min`;
  if (mins === 0) return `${horas}h`;
  return `${horas}h ${mins}min`;
};

/**
 * Verifica si una hora está dentro de un rango
 */
export const estaEnRango = (hora: number, inicio: number, fin: number): boolean => {
  return hora >= inicio && hora <= fin;
};

/**
 * Genera un ID único
 */
export const generarId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
