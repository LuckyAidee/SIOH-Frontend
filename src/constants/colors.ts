// Paleta de colores para SIOH

export const Colors = {
  light: {
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    primaryDark: '#1D4ED8',
    
    secondary: '#10B981',
    secondaryLight: '#34D399',
    
    background: '#F8FAFC',
    surface: '#FFFFFF',
    
    text: '#1E293B',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    
    border: '#E2E8F0',
    divider: '#CBD5E1',
    
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Colores para días de la semana
    dias: {
      Lunes: '#3B82F6',
      Martes: '#10B981',
      Miércoles: '#F59E0B',
      Jueves: '#8B5CF6',
      Viernes: '#EC4899',
      Sábado: '#6366F1',
    },
  },
  dark: {
    primary: '#3B82F6',
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    
    secondary: '#34D399',
    secondaryLight: '#6EE7B7',
    
    background: '#0F172A',
    surface: '#1E293B',
    
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    
    border: '#334155',
    divider: '#475569',
    
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    dias: {
      Lunes: '#60A5FA',
      Martes: '#34D399',
      Miércoles: '#FBBF24',
      Jueves: '#A78BFA',
      Viernes: '#F472B6',
      Sábado: '#818CF8',
    },
  },
};

export type ColorScheme = keyof typeof Colors;
