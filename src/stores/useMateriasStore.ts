// Store para manejar materias seleccionadas

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Materia, Grupo } from '../types';
import { MATERIAS_MOCK, GRUPOS_MOCK } from '../data/mockData';

interface MateriasState {
  // Datos
  materias: Materia[];
  gruposPorMateria: Record<string, Grupo[]>;
  
  // Selección del usuario
  materiasSeleccionadasIds: string[];
  gruposFijadosIds: string[];
  
  // Acciones
  cargarMaterias: () => void;
  seleccionarMateria: (materiaId: string) => void;
  deseleccionarMateria: (materiaId: string) => void;
  toggleMateria: (materiaId: string) => void;
  fijarGrupo: (grupoId: string) => void;
  desfijarGrupo: (grupoId: string) => void;
  limpiarSeleccion: () => void;
  
  // Getters
  obtenerMateriasSeleccionadas: () => Materia[];
  obtenerGruposDeMateria: (materiaId: string) => Grupo[];
  esMateriaSeleccionada: (materiaId: string) => boolean;
  esGrupoFijado: (grupoId: string) => boolean;
  hayMateriasSeleccionadas: () => boolean;
}

export const useMateriasStore = create<MateriasState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      materias: [],
      gruposPorMateria: {},
      materiasSeleccionadasIds: [],
      gruposFijadosIds: [],
      
      // Cargar datos mock
      cargarMaterias: () => {
        set({
          materias: MATERIAS_MOCK,
          gruposPorMateria: GRUPOS_MOCK,
        });
      },
      
      // Seleccionar materia
      seleccionarMateria: (materiaId) => {
        const { materiasSeleccionadasIds } = get();
        if (!materiasSeleccionadasIds.includes(materiaId)) {
          set({
            materiasSeleccionadasIds: [...materiasSeleccionadasIds, materiaId],
          });
        }
      },
      
      // Deseleccionar materia
      deseleccionarMateria: (materiaId) => {
        const { materiasSeleccionadasIds, gruposFijadosIds, gruposPorMateria } = get();
        
        // También remover grupos fijados de esta materia
        const gruposDeMateria = gruposPorMateria[materiaId] || [];
        const gruposIds = gruposDeMateria.map(g => g.id);
        
        set({
          materiasSeleccionadasIds: materiasSeleccionadasIds.filter(id => id !== materiaId),
          gruposFijadosIds: gruposFijadosIds.filter(id => !gruposIds.includes(id)),
        });
      },
      
      // Toggle materia
      toggleMateria: (materiaId) => {
        const { esMateriaSeleccionada, seleccionarMateria, deseleccionarMateria } = get();
        if (esMateriaSeleccionada(materiaId)) {
          deseleccionarMateria(materiaId);
        } else {
          seleccionarMateria(materiaId);
        }
      },
      
      // Fijar grupo específico
      fijarGrupo: (grupoId) => {
        const { gruposFijadosIds } = get();
        if (!gruposFijadosIds.includes(grupoId)) {
          set({
            gruposFijadosIds: [...gruposFijadosIds, grupoId],
          });
        }
      },
      
      // Desfijar grupo
      desfijarGrupo: (grupoId) => {
        const { gruposFijadosIds } = get();
        set({
          gruposFijadosIds: gruposFijadosIds.filter(id => id !== grupoId),
        });
      },
      
      // Limpiar toda la selección
      limpiarSeleccion: () => {
        set({
          materiasSeleccionadasIds: [],
          gruposFijadosIds: [],
        });
      },
      
      // Obtener materias seleccionadas completas
      obtenerMateriasSeleccionadas: () => {
        const { materias, materiasSeleccionadasIds } = get();
        return materias.filter(m => materiasSeleccionadasIds.includes(m.id));
      },
      
      // Obtener grupos de una materia
      obtenerGruposDeMateria: (materiaId) => {
        const { gruposPorMateria } = get();
        return gruposPorMateria[materiaId] || [];
      },
      
      // Verificar si materia está seleccionada
      esMateriaSeleccionada: (materiaId) => {
        return get().materiasSeleccionadasIds.includes(materiaId);
      },
      
      // Verificar si grupo está fijado
      esGrupoFijado: (grupoId) => {
        return get().gruposFijadosIds.includes(grupoId);
      },
      
      // Verificar si hay materias seleccionadas
      hayMateriasSeleccionadas: () => {
        return get().materiasSeleccionadasIds.length > 0;
      },
    }),
    {
      name: 'sioh-materias-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        materiasSeleccionadasIds: state.materiasSeleccionadasIds,
        gruposFijadosIds: state.gruposFijadosIds,
      }),
    }
  )
);
