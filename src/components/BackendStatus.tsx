// Componente para mostrar estado de conexión con el backend

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBackendStatus } from '../hooks/useApiConnection';

interface BackendStatusProps {
  showDetails?: boolean;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({ showDetails = false }) => {
  const { isOnline, message, lastCheck, refresh } = useBackendStatus();

  if (!showDetails) {
    // Versión compacta (solo indicador)
    return (
      <View style={styles.indicator}>
        <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
        <Text style={styles.indicatorText}>
          {isOnline ? 'En línea' : 'Local'}
        </Text>
      </View>
    );
  }

  // Versión completa con detalles
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons 
          name={isOnline ? 'cloud-done' : 'cloud-offline'} 
          size={20} 
          color={isOnline ? '#10B981' : '#F59E0B'} 
        />
        <View style={styles.info}>
          <Text style={styles.status}>
            {isOnline ? 'Conectado al servidor' : 'Modo sin conexión'}
          </Text>
          <Text style={styles.message}>{message}</Text>
          {lastCheck && (
            <Text style={styles.lastCheck}>
              Última verificación: {lastCheck.toLocaleTimeString()}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={refresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Versión compacta
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dotOnline: {
    backgroundColor: '#10B981',
  },
  dotOffline: {
    backgroundColor: '#F59E0B',
  },
  indicatorText: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // Versión completa
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  message: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  lastCheck: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
  },
});
