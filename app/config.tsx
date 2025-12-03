// Pantalla de configuración - Carrera, Turno, Tipo de Estudiante, Semestres

import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { useConfigStore } from '@/src/stores/useConfigStore';
import { useMateriasStore } from '@/src/stores/useMateriasStore';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { 
  CARRERAS, 
  CarreraId, 
  Turno, 
  TipoEstudiante,
  Semestre,
  MAX_SEMESTRES_IRREGULAR,
  MAX_SEMESTRES_REGULAR,
} from '@/src/types';

export default function ConfigScreen() {
  const { user } = useAuthStore();
  
  const {
    carrera,
    turno,
    turnos,
    permitirAmbosTurnos,
    tipoEstudiante,
    semestresSeleccionados,
    semestresPorTurno,
    setCarrera,
    setTurno,
    toggleTurno,
    setPermitirAmbosTurnos,
    setTipoEstudiante,
    toggleSemestre,
    toggleSemestrePorTurno,
    obtenerSemestresDisponibles,
    obtenerSemestresDisponiblesPorTurno,
    obtenerTurnosActivos,
    obtenerTotalSemestresSeleccionados,
    esConfiguracionValida,
    puedeAgregarSemestre,
    puedeAgregarSemestreEnTurno,
    resetearSeleccion,
  } = useConfigStore();

  // Limpiar selección al entrar a la pantalla (pero mantener carrera del usuario)
  useEffect(() => {
    resetearSeleccion();
    if (user?.carrera) {
      setCarrera(user.carrera);
    }
  }, []);

  const { cargarMaterias, cargarMateriasMultiTurno } = useMateriasStore();

  // Usar carrera del usuario si está logueado
  const carreraActual = user?.carrera || carrera;
  const semestresDisponibles = obtenerSemestresDisponibles();
  const turnosActivos = obtenerTurnosActivos();

  const handleContinuar = () => {
    if (!esConfiguracionValida()) {
      Alert.alert(
        'Configuración incompleta',
        'Selecciona turno y al menos un semestre'
      );
      return;
    }

    const carreraFinal = user?.carrera || carrera;
    if (!carreraFinal) {
      Alert.alert('Error', 'Debes seleccionar una carrera');
      return;
    }

    // Cargar materias con la configuración
    if (permitirAmbosTurnos && turnos.length > 0) {
      // Combinar semestres de ambos turnos
      const todosSemestres = [...new Set([...semestresPorTurno.matutino, ...semestresPorTurno.vespertino])].sort((a, b) => a - b);
      cargarMateriasMultiTurno(carreraFinal, turnos, todosSemestres);
    } else if (turno) {
      cargarMaterias(carreraFinal, turno, semestresSeleccionados);
    }
    
    // Navegar a selección de materias
    router.push('/select-materias');
  };

  const handleSelectSemestre = (semestre: Semestre) => {
    if (tipoEstudiante === 'regular') {
      // Regular: hasta 2 semestres consecutivos hacia adelante
      if (semestresSeleccionados.includes(semestre)) {
        // Siempre permitir quitar
        toggleSemestre(semestre);
      } else if (semestresSeleccionados.length === 0) {
        // Primer semestre: cualquiera
        toggleSemestre(semestre);
      } else if (semestresSeleccionados.length < MAX_SEMESTRES_REGULAR) {
        // Segundo semestre: solo consecutivo hacia adelante
        const semestreBase = Math.min(...semestresSeleccionados);
        if (semestre === semestreBase + 1 || semestre === semestreBase + 2) {
          toggleSemestre(semestre);
        } else {
          Alert.alert(
            'Semestre no válido',
            'Los estudiantes regulares solo pueden adelantar materias de semestres consecutivos hacia adelante'
          );
        }
      } else {
        Alert.alert(
          'Límite alcanzado',
          `Los estudiantes regulares pueden seleccionar máximo ${MAX_SEMESTRES_REGULAR} semestres consecutivos`
        );
      }
    } else {
      // Irregular: puede seleccionar hasta 3
      if (semestresSeleccionados.includes(semestre)) {
        toggleSemestre(semestre);
      } else if (puedeAgregarSemestre()) {
        toggleSemestre(semestre);
      } else {
        Alert.alert(
          'Límite alcanzado',
          `Los estudiantes irregulares pueden seleccionar máximo ${MAX_SEMESTRES_IRREGULAR} semestres`
        );
      }
    }
  };

  const handleSelectSemestrePorTurno = (turnoParam: Turno, semestre: Semestre) => {
    const isSelected = semestresPorTurno[turnoParam].includes(semestre);
    const todosSeleccionados = [...semestresPorTurno.matutino, ...semestresPorTurno.vespertino];
    const totalActual = todosSeleccionados.length;
    
    if (tipoEstudiante === 'regular') {
      // Regular: hasta 2 semestres consecutivos hacia adelante (puede ser en diferentes turnos)
      if (isSelected) {
        toggleSemestrePorTurno(turnoParam, semestre);
      } else if (totalActual === 0) {
        toggleSemestrePorTurno(turnoParam, semestre);
      } else if (totalActual < MAX_SEMESTRES_REGULAR) {
        const semestreBase = Math.min(...todosSeleccionados);
        // Permitir semestres consecutivos hacia adelante en cualquier turno
        if (semestre === semestreBase + 1 || semestre === semestreBase + 2) {
          toggleSemestrePorTurno(turnoParam, semestre);
        } else {
          Alert.alert(
            'Semestre no válido',
            'Solo puedes seleccionar semestres consecutivos hacia adelante (ej: 5º y 6º)'
          );
        }
      } else {
        Alert.alert(
          'Límite alcanzado',
          `Los estudiantes regulares pueden seleccionar máximo ${MAX_SEMESTRES_REGULAR} semestres consecutivos`
        );
      }
    } else {
      // Irregular: puede seleccionar hasta 3 totales
      if (isSelected) {
        toggleSemestrePorTurno(turnoParam, semestre);
      } else if (puedeAgregarSemestreEnTurno(turnoParam)) {
        toggleSemestrePorTurno(turnoParam, semestre);
      }
    }
  };

  const handleTurnoPress = (t: Turno) => {
    if (permitirAmbosTurnos) {
      toggleTurno(t);
    } else {
      setTurno(t);
    }
  };

  const isTurnoSelected = (t: Turno) => {
    if (permitirAmbosTurnos) {
      return turnos.includes(t);
    }
    return turno === t;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Carrera - Solo mostrar si no hay usuario logueado */}
        {!user && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="school-outline" size={18} /> Carrera
            </Text>
            <View style={styles.optionsGrid}>
              {CARRERAS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.optionCard,
                    carrera === c.id && styles.optionCardSelected,
                  ]}
                  onPress={() => setCarrera(c.id)}
                >
                  <Text style={styles.optionAbrev}>{c.abreviatura}</Text>
                  <Text 
                    style={[
                      styles.optionNombre,
                      carrera === c.id && styles.optionNombreSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {c.nombre}
                  </Text>
                  {carrera === c.id && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={20} 
                      color={Colors.light.primary} 
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Info de carrera si hay usuario */}
        {user && (
          <View style={styles.section}>
            <View style={styles.userCarreraInfo}>
              <Ionicons name="school" size={24} color={Colors.light.primary} />
              <View style={styles.userCarreraText}>
                <Text style={styles.userCarreraLabel}>Tu carrera</Text>
                <Text style={styles.userCarreraNombre}>
                  {CARRERAS.find(c => c.id === user.carrera)?.nombre}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Turno */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="time-outline" size={18} /> Turno
          </Text>
          
          {/* Toggle ambos turnos */}
          <View style={styles.ambosTurnosContainer}>
            <View style={styles.ambosTurnosInfo}>
              <Ionicons name="swap-horizontal" size={20} color={Colors.light.primary} />
              <Text style={styles.ambosTurnosText}>Permitir ambos turnos</Text>
            </View>
            <Switch
              value={permitirAmbosTurnos}
              onValueChange={setPermitirAmbosTurnos}
              trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
              thumbColor="#FFF"
            />
          </View>
          
          {permitirAmbosTurnos && (
            <Text style={styles.ambosTurnosHint}>
              Selecciona uno o ambos turnos
            </Text>
          )}
          
          <View style={styles.turnoContainer}>
            <TouchableOpacity
              style={[
                styles.turnoBtn,
                isTurnoSelected('matutino') && styles.turnoBtnSelected,
              ]}
              onPress={() => handleTurnoPress('matutino')}
            >
              <Ionicons 
                name="sunny-outline" 
                size={24} 
                color={isTurnoSelected('matutino') ? '#FFF' : Colors.light.warning} 
              />
              <Text style={[
                styles.turnoText,
                isTurnoSelected('matutino') && styles.turnoTextSelected,
              ]}>
                Matutino
              </Text>
              <Text style={[
                styles.turnoHora,
                isTurnoSelected('matutino') && styles.turnoHoraSelected,
              ]}>
                7:00 - 14:00
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.turnoBtn,
                isTurnoSelected('vespertino') && styles.turnoBtnSelected,
              ]}
              onPress={() => handleTurnoPress('vespertino')}
            >
              <Ionicons 
                name="moon-outline" 
                size={24} 
                color={isTurnoSelected('vespertino') ? '#FFF' : Colors.light.info} 
              />
              <Text style={[
                styles.turnoText,
                isTurnoSelected('vespertino') && styles.turnoTextSelected,
              ]}>
                Vespertino
              </Text>
              <Text style={[
                styles.turnoHora,
                isTurnoSelected('vespertino') && styles.turnoHoraSelected,
              ]}>
                14:00 - 21:00
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tipo de estudiante */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="person-outline" size={18} /> Tipo de Estudiante
          </Text>
          <View style={styles.tipoContainer}>
            <TouchableOpacity
              style={[
                styles.tipoBtn,
                tipoEstudiante === 'regular' && styles.tipoBtnSelected,
              ]}
              onPress={() => setTipoEstudiante('regular')}
            >
              <Text style={[
                styles.tipoText,
                tipoEstudiante === 'regular' && styles.tipoTextSelected,
              ]}>
                Regular
              </Text>
              <Text style={[
                styles.tipoDesc,
                tipoEstudiante === 'regular' && styles.tipoDescSelected,
              ]}>
                Hasta {MAX_SEMESTRES_REGULAR} sem. consecutivos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tipoBtn,
                tipoEstudiante === 'irregular' && styles.tipoBtnSelected,
              ]}
              onPress={() => setTipoEstudiante('irregular')}
            >
              <Text style={[
                styles.tipoText,
                tipoEstudiante === 'irregular' && styles.tipoTextSelected,
              ]}>
                Irregular
              </Text>
              <Text style={[
                styles.tipoDesc,
                tipoEstudiante === 'irregular' && styles.tipoDescSelected,
              ]}>
                Hasta {MAX_SEMESTRES_IRREGULAR} semestres
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Semestres */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="layers-outline" size={18} /> Semestre(s)
            </Text>
            {obtenerTotalSemestresSeleccionados() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {obtenerTotalSemestresSeleccionados()} seleccionado(s)
                </Text>
              </View>
            )}
          </View>
          
          {!carreraActual || turnosActivos.length === 0 ? (
            <View style={styles.placeholder}>
              <Ionicons name="arrow-up" size={24} color={Colors.light.textMuted} />
              <Text style={styles.placeholderText}>
                Selecciona carrera y turno primero
              </Text>
            </View>
          ) : permitirAmbosTurnos && turnos.length > 0 ? (
            // Modo ambos turnos: mostrar semestres separados por turno
            <View style={styles.turnosSemestresContainer}>
              {turnos.includes('matutino') && (
                <View style={styles.turnoSemestresSection}>
                  <View style={styles.turnoSemestresHeader}>
                    <Ionicons name="sunny" size={16} color={Colors.light.warning} />
                    <Text style={styles.turnoSemestresTitle}>Matutino</Text>
                    {semestresPorTurno.matutino.length > 0 && (
                      <View style={styles.smallBadge}>
                        <Text style={styles.smallBadgeText}>{semestresPorTurno.matutino.length}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.semestresGrid}>
                    {obtenerSemestresDisponiblesPorTurno('matutino').map((sem) => {
                      const isSelected = semestresPorTurno.matutino.includes(sem);
                      const totalActual = semestresPorTurno.matutino.length + semestresPorTurno.vespertino.length;
                      const isDisabled = !isSelected && tipoEstudiante === 'irregular' && totalActual >= MAX_SEMESTRES_IRREGULAR;
                      return (
                        <TouchableOpacity
                          key={`mat-${sem}`}
                          style={[
                            styles.semestreBtn,
                            isSelected && styles.semestreBtnSelectedMat,
                            isDisabled && styles.semestreBtnDisabled,
                          ]}
                          onPress={() => handleSelectSemestrePorTurno('matutino', sem)}
                          disabled={isDisabled}
                        >
                          <Text style={[
                            styles.semestreNum,
                            isSelected && styles.semestreNumSelected,
                            isDisabled && styles.semestreNumDisabled,
                          ]}>
                            {sem}
                          </Text>
                          <Text style={[
                            styles.semestreLabel,
                            isSelected && styles.semestreLabelSelected,
                            isDisabled && styles.semestreLabelDisabled,
                          ]}>
                            Sem
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
              
              {turnos.includes('vespertino') && (
                <View style={styles.turnoSemestresSection}>
                  <View style={styles.turnoSemestresHeader}>
                    <Ionicons name="moon" size={16} color={Colors.light.info} />
                    <Text style={styles.turnoSemestresTitle}>Vespertino</Text>
                    {semestresPorTurno.vespertino.length > 0 && (
                      <View style={styles.smallBadge}>
                        <Text style={styles.smallBadgeText}>{semestresPorTurno.vespertino.length}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.semestresGrid}>
                    {obtenerSemestresDisponiblesPorTurno('vespertino').map((sem) => {
                      const isSelected = semestresPorTurno.vespertino.includes(sem);
                      const totalActual = semestresPorTurno.matutino.length + semestresPorTurno.vespertino.length;
                      const isDisabled = !isSelected && tipoEstudiante === 'irregular' && totalActual >= MAX_SEMESTRES_IRREGULAR;
                      return (
                        <TouchableOpacity
                          key={`vesp-${sem}`}
                          style={[
                            styles.semestreBtn,
                            isSelected && styles.semestreBtnSelectedVesp,
                            isDisabled && styles.semestreBtnDisabled,
                          ]}
                          onPress={() => handleSelectSemestrePorTurno('vespertino', sem)}
                          disabled={isDisabled}
                        >
                          <Text style={[
                            styles.semestreNum,
                            isSelected && styles.semestreNumSelected,
                            isDisabled && styles.semestreNumDisabled,
                          ]}>
                            {sem}
                          </Text>
                          <Text style={[
                            styles.semestreLabel,
                            isSelected && styles.semestreLabelSelected,
                            isDisabled && styles.semestreLabelDisabled,
                          ]}>
                            Sem
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
              
              {tipoEstudiante === 'irregular' && (
                <Text style={styles.limitHint}>
                  Máximo {MAX_SEMESTRES_IRREGULAR} semestres en total (combinando ambos turnos)
                </Text>
              )}
            </View>
          ) : semestresDisponibles.length === 0 ? (
            <View style={styles.placeholder}>
              <Ionicons name="alert-circle-outline" size={24} color={Colors.light.warning} />
              <Text style={styles.placeholderText}>
                No hay horarios disponibles para esta combinación
              </Text>
            </View>
          ) : (
            <View style={styles.semestresGrid}>
              {semestresDisponibles.map((sem) => {
                const isSelected = semestresSeleccionados.includes(sem);
                const isDisabled = !isSelected && tipoEstudiante === 'irregular' && !puedeAgregarSemestre();
                return (
                <TouchableOpacity
                  key={sem}
                  style={[
                    styles.semestreBtn,
                    isSelected && styles.semestreBtnSelected,
                    isDisabled && styles.semestreBtnDisabled,
                  ]}
                  onPress={() => handleSelectSemestre(sem)}
                  disabled={isDisabled}
                >
                  <Text style={[
                    styles.semestreNum,
                    isSelected && styles.semestreNumSelected,
                    isDisabled && styles.semestreNumDisabled,
                  ]}>
                    {sem}
                  </Text>
                  <Text style={[
                    styles.semestreLabel,
                    isSelected && styles.semestreLabelSelected,
                    isDisabled && styles.semestreLabelDisabled,
                  ]}>
                    Semestre
                  </Text>
                </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Espacio para botón */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botón continuar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continuarBtn,
            !esConfiguracionValida() && styles.continuarBtnDisabled,
          ]}
          onPress={handleContinuar}
          disabled={!esConfiguracionValida()}
        >
          <Text style={styles.continuarBtnText}>Continuar</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>
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
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionCard: {
    width: '48%',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.light.border,
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#EFF6FF',
  },
  optionAbrev: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  optionNombre: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
  optionNombreSelected: {
    color: Colors.light.primary,
  },
  checkIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  userCarreraInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  userCarreraText: {
    flex: 1,
  },
  userCarreraLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  userCarreraNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  ambosTurnosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  ambosTurnosInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ambosTurnosText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  ambosTurnosHint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  turnoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  turnoBtn: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  turnoBtnSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  turnoText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 8,
  },
  turnoTextSelected: {
    color: '#FFF',
  },
  turnoHora: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  turnoHoraSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  tipoContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tipoBtn: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  tipoBtnSelected: {
    backgroundColor: Colors.light.secondary,
    borderColor: Colors.light.secondary,
  },
  tipoText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  tipoTextSelected: {
    color: '#FFF',
  },
  tipoDesc: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  tipoDescSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  semestresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  semestreBtn: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  semestreBtnSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  semestreBtnSelectedMat: {
    backgroundColor: Colors.light.warning,
    borderColor: Colors.light.warning,
  },
  semestreBtnSelectedVesp: {
    backgroundColor: Colors.light.info,
    borderColor: Colors.light.info,
  },
  semestreBtnDisabled: {
    backgroundColor: Colors.light.border,
    borderColor: Colors.light.border,
    opacity: 0.5,
  },
  semestreNum: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  semestreNumSelected: {
    color: '#FFF',
  },
  semestreNumDisabled: {
    color: Colors.light.textMuted,
  },
  semestreLabel: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  semestreLabelSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  semestreLabelDisabled: {
    color: Colors.light.textMuted,
  },
  badge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
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
  continuarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continuarBtnDisabled: {
    backgroundColor: Colors.light.textMuted,
  },
  continuarBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  turnosSemestresContainer: {
    gap: 16,
  },
  turnoSemestresSection: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  turnoSemestresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  turnoSemestresTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
  },
  smallBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  smallBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  limitHint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
