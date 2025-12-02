// Componente Card para mostrar un horario generado

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Horario, DIAS_SEMANA } from '../types';
import { Colors } from '../constants/colors';
import { formatearDuracion, minutosAHora } from '../utils/timeHelpers';
import { contarDiasConClases } from '../utils/validators';

interface HorarioCardProps {
  horario: Horario;
  indice: number;
  onPress: () => void;
  onGuardar?: () => void;
  guardado?: boolean;
}

export const HorarioCard: React.FC<HorarioCardProps> = ({
  horario,
  indice,
  onPress,
  onGuardar,
  guardado = false,
}) => {
  const diasConClases = contarDiasConClases(horario.sesiones);
  const diasLibres = 6 - diasConClases;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.titulo}>Opción {indice + 1}</Text>
          <View style={styles.puntuacionBadge}>
            <Ionicons name="star" size={12} color="#FFF" />
            <Text style={styles.puntuacionTexto}>{horario.puntuacion.toFixed(0)}</Text>
          </View>
        </View>
        
        {onGuardar && (
          <TouchableOpacity onPress={onGuardar} style={styles.guardarBtn}>
            <Ionicons
              name={guardado ? 'bookmark' : 'bookmark-outline'}
              size={24}
              color={guardado ? Colors.light.primary : Colors.light.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Mini vista de días */}
      <View style={styles.diasContainer}>
        {DIAS_SEMANA.map((dia) => {
          const tieneSesion = horario.sesiones.some(s => s.dia === dia);
          return (
            <View
              key={dia}
              style={[
                styles.diaIndicador,
                tieneSesion && { backgroundColor: Colors.light.dias[dia] },
              ]}
            >
              <Text style={[styles.diaTexto, tieneSesion && styles.diaTextoActivo]}>
                {dia.charAt(0)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Estadísticas */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={16} color={Colors.light.textSecondary} />
          <Text style={styles.statTexto}>
            {formatearDuracion(horario.horasMuertas)} muertas
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="calendar-outline" size={16} color={Colors.light.textSecondary} />
          <Text style={styles.statTexto}>
            {diasLibres} {diasLibres === 1 ? 'día libre' : 'días libres'}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="layers-outline" size={16} color={Colors.light.textSecondary} />
          <Text style={styles.statTexto}>
            {horario.grupos.length} materias
          </Text>
        </View>
      </View>

      {/* Ver detalle */}
      <View style={styles.footer}>
        <Text style={styles.verDetalleTexto}>Ver detalle</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.light.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginRight: 8,
  },
  puntuacionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  puntuacionTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
    marginLeft: 4,
  },
  guardarBtn: {
    padding: 4,
  },
  diasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  diaIndicador: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  diaTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textMuted,
  },
  diaTextoActivo: {
    color: '#FFF',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTexto: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 12,
  },
  verDetalleTexto: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
});
