// Componente para seleccionar/fijar un grupo

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Grupo } from '../types';
import { Colors } from '../constants/colors';
import { minutosAHora } from '../utils/timeHelpers';

interface GrupoSelectorProps {
  grupo: Grupo;
  fijado: boolean;
  onFijar: () => void;
}

export const GrupoSelector: React.FC<GrupoSelectorProps> = ({
  grupo,
  fijado,
  onFijar,
}) => {
  // Agrupar sesiones por horario para mostrar resumen
  const resumenHorario = grupo.sesiones.map(s => 
    `${s.dia.substring(0, 3)} ${minutosAHora(s.horaInicio)}-${minutosAHora(s.horaFin)}`
  ).join(' | ');

  // Obtener salones únicos con edificio
  const salones = [...new Set(grupo.sesiones.map(s => `Edif. ${s.edificio}, ${s.salon}`))];

  return (
    <View style={[styles.container, fijado && styles.containerFijado]}>
      <View style={styles.contenido}>
        <View style={styles.header}>
          <Text style={styles.numero}>Grupo {grupo.numero}</Text>
        </View>

        <View style={styles.profesorRow}>
          <Ionicons name="person-outline" size={14} color={Colors.light.textSecondary} />
          <Text style={styles.profesor} numberOfLines={1}>{grupo.profesor}</Text>
        </View>

        <View style={styles.horarioRow}>
          <Ionicons name="time-outline" size={14} color={Colors.light.textSecondary} />
          <Text style={styles.horario} numberOfLines={2}>{resumenHorario}</Text>
        </View>

        {/* Mostrar salones */}
        <View style={styles.salonesRow}>
          <Ionicons name="location-outline" size={14} color={Colors.light.textSecondary} />
          <Text style={styles.salones} numberOfLines={1}>
            {salones.join(' • ')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.fijarBtn, fijado && styles.fijarBtnActivo]}
        onPress={onFijar}
      >
        <Ionicons
          name={fijado ? 'lock-closed' : 'lock-open-outline'}
          size={20}
          color={fijado ? '#FFF' : Colors.light.primary}
        />
        <Text style={[styles.fijarTexto, fijado && styles.fijarTextoActivo]}>
          {fijado ? 'Fijado' : 'Fijar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  containerFijado: {
    borderColor: Colors.light.primary,
    backgroundColor: '#EFF6FF',
  },
  contenido: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  numero: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginRight: 8,
  },
  profesorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profesor: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  horarioRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  horario: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  salonesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  salones: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  fijarBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    marginLeft: 12,
  },
  fijarBtnActivo: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  fijarTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
    marginTop: 2,
  },
  fijarTextoActivo: {
    color: '#FFF',
  },
});
