// Pantalla de lista de horarios generados

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { useHorariosStore } from '@/src/stores/useHorariosStore';
import { HorarioCard } from '@/src/components/HorarioCard';
import { Horario } from '@/src/types';

type TabType = 'generados' | 'guardados';

export default function HorariosScreen() {
  const [tabActivo, setTabActivo] = useState<TabType>('generados');

  const {
    horariosGenerados,
    horariosGuardados,
    guardarHorario,
    setHorarioActual,
  } = useHorariosStore();

  const horariosActuales = tabActivo === 'generados' ? horariosGenerados : horariosGuardados;

  const handleVerDetalle = (horario: Horario) => {
    setHorarioActual(horario);
    router.push(`/horarios/${horario.id}`);
  };

  const handleGuardarHorario = (horario: Horario) => {
    guardarHorario(horario);
  };

  const esHorarioGuardado = (horarioId: string) => {
    return horariosGuardados.some(h => h.id === horarioId);
  };

  const renderHorario = ({ item, index }: { item: Horario; index: number }) => (
    <HorarioCard
      horario={item}
      indice={index}
      onPress={() => handleVerDetalle(item)}
      onGuardar={tabActivo === 'generados' ? () => handleGuardarHorario(item) : undefined}
      guardado={esHorarioGuardado(item.id)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={tabActivo === 'generados' ? 'calendar-outline' : 'bookmark-outline'}
        size={64}
        color={Colors.light.textMuted}
      />
      <Text style={styles.emptyTitle}>
        {tabActivo === 'generados'
          ? 'No hay horarios generados'
          : 'No hay horarios guardados'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {tabActivo === 'generados'
          ? 'Selecciona materias para generar opciones'
          : 'Guarda horarios que te gusten para verlos aquí'}
      </Text>
      {tabActivo === 'generados' && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push('/select-materias')}
        >
          <Text style={styles.emptyButtonText}>Seleccionar Materias</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, tabActivo === 'generados' && styles.tabActivo]}
          onPress={() => setTabActivo('generados')}
        >
          <Ionicons
            name="flash-outline"
            size={18}
            color={tabActivo === 'generados' ? Colors.light.primary : Colors.light.textSecondary}
          />
          <Text style={[styles.tabTexto, tabActivo === 'generados' && styles.tabTextoActivo]}>
            Generados ({horariosGenerados.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tabActivo === 'guardados' && styles.tabActivo]}
          onPress={() => setTabActivo('guardados')}
        >
          <Ionicons
            name="bookmark-outline"
            size={18}
            color={tabActivo === 'guardados' ? Colors.light.primary : Colors.light.textSecondary}
          />
          <Text style={[styles.tabTexto, tabActivo === 'guardados' && styles.tabTextoActivo]}>
            Guardados ({horariosGuardados.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      {tabActivo === 'generados' && horariosGenerados.length > 0 && (
        <View style={styles.infoBar}>
          <Ionicons name="information-circle-outline" size={16} color={Colors.light.info} />
          <Text style={styles.infoText}>
            Ordenados por puntuación (mejor primero)
          </Text>
        </View>
      )}

      {/* Lista */}
      <FlatList
        data={horariosActuales}
        keyExtractor={(item) => item.id}
        renderItem={renderHorario}
        contentContainerStyle={[
          styles.lista,
          horariosActuales.length === 0 && styles.listaVacia,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    backgroundColor: Colors.light.background,
  },
  tabActivo: {
    backgroundColor: '#EFF6FF',
  },
  tabTexto: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  tabTextoActivo: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: Colors.light.info,
  },
  lista: {
    padding: 16,
  },
  listaVacia: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
