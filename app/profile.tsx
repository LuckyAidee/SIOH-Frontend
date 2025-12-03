// Pantalla de Mi Perfil

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { useHorariosStore } from '@/src/stores/useHorariosStore';
import { CARRERAS, CarreraId } from '@/src/types';

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuthStore();
  const { limpiarTodo: limpiarHorarios } = useHorariosStore();
  
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [carrera, setCarrera] = useState<CarreraId | null>(user?.carrera || null);
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    router.replace('/login' as never);
    return null;
  }

  const handleSave = () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    // Si cambió la carrera, advertir sobre horarios
    if (carrera && carrera !== user.carrera) {
      Alert.alert(
        'Cambiar carrera',
        'Al cambiar de carrera, se eliminarán los horarios guardados que no sean compatibles. ¿Continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Continuar',
            style: 'destructive',
            onPress: () => {
              // Limpiar horarios al cambiar carrera
              limpiarHorarios();
              updateProfile({ nombre: nombre.trim(), carrera });
              setIsEditing(false);
              Alert.alert('¡Guardado!', 'Tu perfil ha sido actualizado');
            },
          },
        ]
      );
    } else {
      updateProfile({ nombre: nombre.trim() });
      setIsEditing(false);
      Alert.alert('¡Guardado!', 'Tu perfil ha sido actualizado');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login' as never);
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setNombre(user.nombre);
    setCarrera(user.carrera);
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Mi Perfil</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.nombre.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            {isEditing ? (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  autoCapitalize="words"
                  placeholder="Tu nombre"
                  placeholderTextColor={Colors.light.textMuted}
                />
              </View>
            ) : (
              <Text style={styles.value}>{user.nombre}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Carrera</Text>
            {isEditing ? (
              <View style={styles.carreraGrid}>
                {CARRERAS.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.carreraBtn,
                      carrera === c.id && styles.carreraBtnSelected,
                    ]}
                    onPress={() => setCarrera(c.id)}
                  >
                    <Text style={[
                      styles.carreraAbrev,
                      carrera === c.id && styles.carreraAbrevSelected,
                    ]}>
                      {c.abreviatura}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.value}>
                {CARRERAS.find(c => c.id === user.carrera)?.nombre}
              </Text>
            )}
          </View>

          {/* Botones de edición */}
          {isEditing ? (
            <View style={styles.editButtons}>
              <TouchableOpacity 
                style={styles.cancelBtn}
                onPress={handleCancel}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveBtn}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.editBtn}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="pencil-outline" size={18} color={Colors.light.primary} />
              <Text style={styles.editBtnText}>Editar perfil</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity 
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.light.error} />
          <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 20,
    marginBottom: 24,
  },
  backBtn: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
  },
  email: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.surface,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputContainer: {
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  input: {
    fontSize: 16,
    color: Colors.light.text,
    padding: 14,
  },
  carreraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  carreraBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  carreraBtnSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#EFF6FF',
  },
  carreraAbrev: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  carreraAbrevSelected: {
    color: Colors.light.primary,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    gap: 8,
    marginTop: 12,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    gap: 8,
    marginTop: 40,
    marginBottom: 40,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.error,
  },
});
