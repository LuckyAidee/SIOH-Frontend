// Pantalla de detalle de un horario

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { useHorariosStore } from '@/src/stores/useHorariosStore';
import { DIAS_SEMANA, SesionClase } from '@/src/types';
import { minutosAHora, formatearDuracion } from '@/src/utils/timeHelpers';
import { obtenerEstadisticasHorario } from '@/src/services/OptimizerService';

export default function DetalleHorarioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { obtenerHorarioPorId, guardarHorario, eliminarHorario, horariosGuardados } = useHorariosStore();

  const horario = obtenerHorarioPorId(id!);
  const estaGuardado = horariosGuardados.some(h => h.id === id);

  const estadisticas = useMemo(() => {
    if (!horario) return null;
    return obtenerEstadisticasHorario(horario);
  }, [horario]);

  if (!horario) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.light.error} />
          <Text style={styles.errorText}>Horario no encontrado</Text>
          <TouchableOpacity
            style={styles.volverBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.volverBtnText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Agrupar sesiones por día
  const sesionesPorDia = useMemo(() => {
    const agrupadas: Record<string, SesionClase[]> = {};
    
    DIAS_SEMANA.forEach(dia => {
      const sesiones = horario.sesiones
        .filter(s => s.dia === dia)
        .sort((a, b) => a.horaInicio - b.horaInicio);
      
      if (sesiones.length > 0) {
        agrupadas[dia] = sesiones;
      }
    });
    
    return agrupadas;
  }, [horario]);

  const handleGuardar = () => {
    guardarHorario(horario);
    Alert.alert('¡Guardado!', 'El horario se ha guardado correctamente');
  };

  const handleEliminar = () => {
    Alert.alert(
      'Eliminar horario',
      '¿Estás seguro de que deseas eliminar este horario guardado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminarHorario(horario.id);
            router.back();
          },
        },
      ]
    );
  };

  // Obtener nombre de materia del grupo
  const obtenerNombreMateria = (grupoId: string) => {
    const grupo = horario.grupos.find(g => g.id === grupoId);
    // Por ahora retornar el ID simplificado
    return grupo ? `Materia ${grupo.materiaId}` : 'Desconocida';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color={Colors.light.secondary} />
            <Text style={styles.statValor}>{horario.puntuacion.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Puntuación</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={Colors.light.warning} />
            <Text style={styles.statValor}>{formatearDuracion(horario.horasMuertas)}</Text>
            <Text style={styles.statLabel}>Horas muertas</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color={Colors.light.info} />
            <Text style={styles.statValor}>{6 - (estadisticas?.diasConClases || 0)}</Text>
            <Text style={styles.statLabel}>Días libres</Text>
          </View>
        </View>

        {/* Horario por día */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horario semanal</Text>

          {DIAS_SEMANA.map(dia => {
            const sesiones = sesionesPorDia[dia];
            if (!sesiones) return null;

            return (
              <View key={dia} style={styles.diaContainer}>
                <View style={[styles.diaHeader, { backgroundColor: Colors.light.dias[dia] }]}>
                  <Text style={styles.diaNombre}>{dia}</Text>
                  <Text style={styles.diaCantidad}>{sesiones.length} clases</Text>
                </View>

                {sesiones.map((sesion, idx) => (
                  <View key={sesion.id || idx} style={styles.sesionCard}>
                    <View style={styles.sesionHora}>
                      <Text style={styles.horaInicio}>{minutosAHora(sesion.horaInicio)}</Text>
                      <Text style={styles.horaFin}>{minutosAHora(sesion.horaFin)}</Text>
                    </View>
                    
                    <View style={styles.sesionInfo}>
                      <Text style={styles.sesionMateria}>
                        {obtenerNombreMateria(sesion.grupoId)}
                      </Text>
                      <View style={styles.sesionDetalles}>
                        <Ionicons name="location-outline" size={12} color={Colors.light.textSecondary} />
                        <Text style={styles.sesionSalon}>{sesion.salon}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </View>

        {/* Materias incluidas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grupos seleccionados</Text>
          
          {horario.grupos.map(grupo => (
            <View key={grupo.id} style={styles.grupoCard}>
              <View style={styles.grupoInfo}>
                <Text style={styles.grupoNumero}>Grupo {grupo.numero}</Text>
                <Text style={styles.grupoProfesor}>{grupo.profesor}</Text>
              </View>
              <View style={styles.grupoCupo}>
                <Text style={styles.cupoNumero}>{grupo.cupoDisponible}</Text>
                <Text style={styles.cupoLabel}>cupos</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Espacio para el footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer con acciones */}
      <View style={styles.footer}>
        {estaGuardado ? (
          <TouchableOpacity style={styles.eliminarBtn} onPress={handleEliminar}>
            <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
            <Text style={styles.eliminarBtnText}>Eliminar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.guardarBtn} onPress={handleGuardar}>
            <Ionicons name="bookmark-outline" size={20} color="#FFF" />
            <Text style={styles.guardarBtnText}>Guardar Horario</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scroll: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 24,
  },
  volverBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  volverBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statValor: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 16,
  },
  diaContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  diaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  diaNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  diaCantidad: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  sesionCard: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sesionHora: {
    width: 60,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.light.border,
    marginRight: 12,
  },
  horaInicio: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  horaFin: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  sesionInfo: {
    flex: 1,
  },
  sesionMateria: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 4,
  },
  sesionDetalles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sesionSalon: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  grupoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  grupoInfo: {
    flex: 1,
  },
  grupoNumero: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  grupoProfesor: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  grupoCupo: {
    alignItems: 'center',
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cupoNumero: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  cupoLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
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
  guardarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  guardarBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  eliminarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  eliminarBtnText: {
    color: Colors.light.error,
    fontSize: 16,
    fontWeight: '600',
  },
});
