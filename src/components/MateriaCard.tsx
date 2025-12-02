// Componente Card para mostrar una materia

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Materia } from '../types';
import { Colors } from '../constants/colors';

interface MateriaCardProps {
  materia: Materia;
  seleccionada: boolean;
  onPress: () => void;
  onVerGrupos?: () => void;
}

export const MateriaCard: React.FC<MateriaCardProps> = ({
  materia,
  seleccionada,
  onPress,
  onVerGrupos,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        seleccionada && styles.containerSeleccionado,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.checkboxContainer}>
        <View style={[styles.checkbox, seleccionada && styles.checkboxSeleccionado]}>
          {seleccionada && (
            <Ionicons name="checkmark" size={16} color="#FFF" />
          )}
        </View>
      </View>
      
      <View style={styles.contenido}>
        <View style={styles.header}>
          <Text style={styles.codigo}>{materia.codigo}</Text>
          {materia.esObligatoria && (
            <View style={styles.badgeObligatoria}>
              <Text style={styles.badgeTexto}>Obligatoria</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.nombre}>{materia.nombre}</Text>
        
        <View style={styles.footer}>
          <View style={styles.creditosContainer}>
            <Ionicons name="school-outline" size={14} color={Colors.light.textSecondary} />
            <Text style={styles.creditos}>{materia.creditos} créditos</Text>
          </View>
          
          {onVerGrupos && (
            <TouchableOpacity onPress={onVerGrupos} style={styles.verGruposBtn}>
              <Text style={styles.verGruposTexto}>Ver grupos</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.light.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  containerSeleccionado: {
    borderColor: Colors.light.primary,
    backgroundColor: '#EFF6FF',
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSeleccionado: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  contenido: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  codigo: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginRight: 8,
  },
  badgeObligatoria: {
    backgroundColor: Colors.light.warning,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTexto: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  nombre: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  creditosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creditos: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  verGruposBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verGruposTexto: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '500',
  },
});
