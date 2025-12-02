// Servicio de notificaciones

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar handler de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Solicita permisos de notificación
 */
export const solicitarPermisos = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
};

/**
 * Programa una notificación local
 */
export const programarNotificacion = async (
  titulo: string,
  cuerpo: string,
  segundos: number = 5
): Promise<string> => {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: cuerpo,
      sound: true,
    },
    trigger: {
      seconds: segundos,
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    },
  });

  return id;
};

/**
 * Cancela una notificación programada
 */
export const cancelarNotificacion = async (id: string): Promise<void> => {
  await Notifications.cancelScheduledNotificationAsync(id);
};

/**
 * Cancela todas las notificaciones
 */
export const cancelarTodasNotificaciones = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

/**
 * Envía notificación inmediata
 */
export const enviarNotificacionInmediata = async (
  titulo: string,
  cuerpo: string
): Promise<void> => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: titulo,
      body: cuerpo,
      sound: true,
    },
    trigger: null, // Inmediato
  });
};

/**
 * Obtiene token para push notifications (si se necesita en futuro)
 */
export const obtenerPushToken = async (): Promise<string | null> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  } catch (error) {
    console.log('Error obteniendo push token:', error);
    return null;
  }
};
