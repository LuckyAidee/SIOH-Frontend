// Pantalla de selección de materias

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { useMateriasStore } from '@/src/stores/useMateriasStore';
import { useHorariosStore } from '@/src/stores/useHorariosStore';
import { MateriaCard } from '@/src/components/MateriaCard';
import { GrupoSelector } from '@/src/components/GrupoSelector';
import { LoadingIndicator } from '@/src/components/LoadingIndicator';
import { generarHorarios } from '@/src/services/OptimizerService';
import { Materia, Grupo } from '@/src/types';

export default function SelectMateriasScreen() {
  const [materiaGrupos, setMateriaGrupos] = useState<Materia | null>(null);
  const [isGenerando, setIsGenerando] = useState(false);

  const {
    materias,
    materiasSeleccionadasIds,
    gruposFijadosIds,
    toggleMateria,
    esMateriaSeleccionada,
    esGrupoFijado,
    fijarGrupo,
    desfijarGrupo,
    obtenerGruposDeMateria,
    obtenerMateriasSeleccionadas,
  } = useMateriasStore();

  const { setHorariosGenerados } = useHorariosStore();

  const materiasSeleccionadas = useMemo(() => 
    obtenerMateriasSeleccionadas(),
    [materiasSeleccionadasIds, materias]
  );

  const handleGenerarHorarios = async () => {
    if (materiasSeleccionadas.length === 0) {
      alert('Selecciona al menos una materia');
      return;
    }

    setIsGenerando(true);

    // Simular delay para UX
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Obtener grupos de cada materia seleccionada
      const gruposPorMateria = materiasSeleccionadas.map(m => 
        obtenerGruposDeMateria(m.id)
      );

      // Generar horarios optimizados
      const horarios = generarHorarios(gruposPorMateria, gruposFijadosIds);

      if (horarios.length === 0) {
        alert('No se encontraron horarios válidos sin traslapes. Intenta con otras materias o fija menos grupos.');
        setIsGenerando(false);
        return;
      }

      setHorariosGenerados(horarios);
      router.push('/horarios');
    } catch (error) {
      console.error('Error generando horarios:', error);
      alert('Ocurrió un error al generar horarios');
    } finally {
      setIsGenerando(false);
    }
  };

  const handleToggleGrupo = (grupoId: string) => {
    if (esGrupoFijado(grupoId)) {
      desfijarGrupo(grupoId);
    } else {
      fijarGrupo(grupoId);
    }
  };

  const renderMateria = ({ item }: { item: Materia }) => (
    <MateriaCard
      materia={item}
      seleccionada={esMateriaSeleccionada(item.id)}
      onPress={() => toggleMateria(item.id)}
      onVerGrupos={() => setMateriaGrupos(item)}
    />
  );

  const gruposDeMateria = materiaGrupos ? obtenerGruposDeMateria(materiaGrupos.id) : [];

  if (isGenerando) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingIndicator mensaje="Generando horarios óptimos..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header con contador */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Selecciona tus materias</Text>
        <View style={styles.contador}>
          <Text style={styles.contadorTexto}>
            {materiasSeleccionadas.length} seleccionadas
          </Text>
        </View>
      </View>

      {/* Lista de materias */}
      <FlatList
        data={materias}
        keyExtractor={(item) => item.id}
        renderItem={renderMateria}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón generar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.generarBtn,
            materiasSeleccionadas.length === 0 && styles.generarBtnDisabled,
          ]}
          onPress={handleGenerarHorarios}
          disabled={materiasSeleccionadas.length === 0}
        >
          <Ionicons name="flash" size={20} color="#FFF" />
          <Text style={styles.generarBtnTexto}>
            Generar Horarios ({materiasSeleccionadas.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal para ver/fijar grupos */}
      <Modal
        visible={materiaGrupos !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMateriaGrupos(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitulo}>{materiaGrupos?.nombre}</Text>
              <Text style={styles.modalSubtitulo}>
                Fija un grupo si tienes preferencia
              </Text>
            </View>
            <TouchableOpacity onPress={() => setMateriaGrupos(null)}>
              <Ionicons name="close-circle" size={32} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={gruposDeMateria}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <GrupoSelector
                grupo={item}
                fijado={esGrupoFijado(item.id)}
                onFijar={() => handleToggleGrupo(item.id)}
              />
            )}
            contentContainerStyle={styles.modalLista}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  contador: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  contadorTexto: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  lista: {
    padding: 16,
    paddingBottom: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  generarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  generarBtnDisabled: {
    backgroundColor: Colors.light.textMuted,
  },
  generarBtnTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modalSubtitulo: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  modalLista: {
    padding: 16,
  },
});
