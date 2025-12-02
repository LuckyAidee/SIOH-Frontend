// Servicio de almacenamiento persistente

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../constants/config';

const { STORAGE_KEYS } = CONFIG;

/**
 * Guarda datos en AsyncStorage
 */
export const guardarDatos = async <T>(key: string, data: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error('Error guardando datos:', error);
    throw error;
  }
};

/**
 * Obtiene datos de AsyncStorage
 */
export const obtenerDatos = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('Error obteniendo datos:', error);
    return null;
  }
};

/**
 * Elimina datos de AsyncStorage
 */
export const eliminarDatos = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error eliminando datos:', error);
    throw error;
  }
};

/**
 * Limpia todo el almacenamiento de la app
 */
export const limpiarTodo = async (): Promise<void> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error limpiando almacenamiento:', error);
    throw error;
  }
};

/**
 * Verifica si existe una clave
 */
export const existeClave = async (key: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    return false;
  }
};
