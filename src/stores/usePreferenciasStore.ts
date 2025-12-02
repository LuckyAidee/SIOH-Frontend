// Store para preferencias del usuario

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Preferencias } from '../types';
import { CONFIG } from '../constants/config';

interface PreferenciasState extends Preferencias {
  // Acciones
  setHoraInicioPreferida: (hora: number) => void;
  setHoraFinPreferida: (hora: number) => void;
  setMinimizarHorasMuertas: (valor: boolean) => void;
  setNotificacionesActivas: (valor: boolean) => void;
  resetearPreferencias: () => void;
}

const PREFERENCIAS_DEFAULT: Preferencias = {
  materiasSeleccionadasIds: [],
  gruposFijadosIds: [],
  horaInicioPreferida: CONFIG.HORA_INICIO_DIA,
  horaFinPreferida: CONFIG.HORA_FIN_DIA,
  minimizarHorasMuertas: true,
  notificacionesActivas: true,
};

export const usePreferenciasStore = create<PreferenciasState>()(
  persist(
    (set) => ({
      ...PREFERENCIAS_DEFAULT,
      
      setHoraInicioPreferida: (hora) => {
        set({ horaInicioPreferida: hora });
      },
      
      setHoraFinPreferida: (hora) => {
        set({ horaFinPreferida: hora });
      },
      
      setMinimizarHorasMuertas: (valor) => {
        set({ minimizarHorasMuertas: valor });
      },
      
      setNotificacionesActivas: (valor) => {
        set({ notificacionesActivas: valor });
      },
      
      resetearPreferencias: () => {
        set(PREFERENCIAS_DEFAULT);
      },
    }),
    {
      name: 'sioh-preferencias-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
