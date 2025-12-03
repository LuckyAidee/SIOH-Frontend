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
  SectionList,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { useMateriasStore } from '@/src/stores/useMateriasStore';
import { useConfigStore } from '@/src/stores/useConfigStore';
import { useHorariosStore } from '@/src/stores/useHorariosStore';
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

  const { obtenerCarreraNombre, turno, semestresSeleccionados, tipoEstudiante } = useConfigStore();

  const { setHorariosGenerados } = useHorariosStore();

  const materiasSeleccionadas = useMemo(() => 
    obtenerMateriasSeleccionadas(),
    [materiasSeleccionadasIds, materias]
  );

  // Agrupar materias por semestre para SectionList
  const secciones = useMemo(() => {
    const porSemestre: Record<number, Materia[]> = {};
    
    materias.forEach(materia => {
      if (!porSemestre[materia.semestre]) {
        porSemestre[materia.semestre] = [];
      }
      porSemestre[materia.semestre].push(materia);
    });
    
    return Object.entries(porSemestre)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([semestre, data]) => ({
        title: `Semestre ${semestre}`,
        data,
      }));
  }, [materias]);

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
        alert('No se encontraron horarios válidos. Esto puede ocurrir porque:\n\n• Solo hay un grupo por materia y tienen horarios que se traslapan\n• Los datos de horarios están incompletos\n\nIntenta seleccionar menos materias o materias de diferentes semestres.');
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

  const renderMateria = ({ item }: { item: Materia }) => {
    const seleccionada = esMateriaSeleccionada(item.id);
    const grupos = obtenerGruposDeMateria(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.materiaCard, seleccionada && styles.materiaCardSelected]}
        onPress={() => toggleMateria(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.materiaContent}>
          <View style={styles.materiaInfo}>
            <Text style={[styles.materiaNombre, seleccionada && styles.materiaNombreSelected]} numberOfLines={2}>
              {item.nombre}
            </Text>
            <Text style={styles.materiaGrupos}>
              {grupos.length} grupo{grupos.length !== 1 ? 's' : ''} disponible{grupos.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <View style={styles.materiaActions}>
            {seleccionada && (
              <TouchableOpacity
                style={styles.verGruposBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  setMateriaGrupos(item);
                }}
              >
                <Ionicons name="list-outline" size={16} color={Colors.light.primary} />
                <Text style={styles.verGruposText}>Ver grupos</Text>
              </TouchableOpacity>
            )}
            
            <View style={[styles.checkbox, seleccionada && styles.checkboxSelected]}>
              {seleccionada && <Ionicons name="checkmark" size={16} color="#FFF" />}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
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
      {/* Header con info de configuración */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerCarrera} numberOfLines={1}>
            {obtenerCarreraNombre()}
          </Text>
          <View style={styles.headerTags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {turno === 'matutino' ? 'Matutino' : 'Vespertino'}
              </Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                {tipoEstudiante === 'regular' ? 'Regular' : 'Irregular'}
              </Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                Sem. {semestresSeleccionados.join(', ')}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.contador}>
          <Text style={styles.contadorTexto}>
            {materiasSeleccionadas.length} / {materias.length}
          </Text>
        </View>
      </View>

      {/* Lista de materias por semestre */}
      <SectionList
        sections={secciones}
        keyExtractor={(item) => item.id}
        renderItem={renderMateria}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
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
            <View style={styles.modalHeaderInfo}>
              <Text style={styles.modalTitulo} numberOfLines={2}>{materiaGrupos?.nombre}</Text>
              <Text style={styles.modalSubtitulo}>
                Fija un grupo si tienes preferencia por un profesor
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  headerInfo: {
    flex: 1,
    marginRight: 12,
  },
  headerCarrera: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
  },
  headerTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: Colors.light.primary,
    fontWeight: '500',
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
  sectionHeader: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  lista: {
    paddingBottom: 100,
  },
  materiaCard: {
    backgroundColor: Colors.light.surface,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  materiaCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#F0F7FF',
  },
  materiaContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materiaInfo: {
    flex: 1,
  },
  materiaNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  materiaNombreSelected: {
    color: Colors.light.primary,
  },
  materiaGrupos: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  materiaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  verGruposBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  verGruposText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
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
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  modalHeaderInfo: {
    flex: 1,
    marginRight: 12,
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modalSubtitulo: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  modalLista: {
    padding: 16,
  },
});
