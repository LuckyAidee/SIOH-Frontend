// Componente indicador de carga

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface LoadingIndicatorProps {
  mensaje?: string;
  tamaño?: 'small' | 'large';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  mensaje = 'Cargando...',
  tamaño = 'large',
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={tamaño} color={Colors.light.primary} />
      {mensaje && <Text style={styles.mensaje}>{mensaje}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mensaje: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
});
