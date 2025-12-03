// Pantalla de Registro

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { CARRERAS, CarreraId } from '@/src/types';

export default function RegisterScreen() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [carrera, setCarrera] = useState<CarreraId | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuthStore();

  const handleRegister = async () => {
    // Validaciones
    if (!nombre.trim() || !email.trim() || !password || !confirmPassword || !carrera) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Por favor ingresa un correo válido');
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(nombre.trim(), email.trim(), password, carrera);
      
      if (success) {
        Alert.alert(
          '¡Bienvenido!',
          'Tu cuenta ha sido creada exitosamente',
          [{ text: 'Continuar', onPress: () => router.replace('/') }]
        );
      } else {
        Alert.alert('Error', 'Este correo ya está registrado');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al registrarte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Regístrate para usar SIOH</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.light.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
                placeholderTextColor={Colors.light.textMuted}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.light.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={Colors.light.textMuted}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.light.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholderTextColor={Colors.light.textMuted}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={Colors.light.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.light.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholderTextColor={Colors.light.textMuted}
              />
            </View>

            {/* Selección de carrera */}
            <View style={styles.carreraSection}>
              <Text style={styles.carreraLabel}>
                <Ionicons name="school-outline" size={16} /> Selecciona tu carrera
              </Text>
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
                    <Text 
                      style={[
                        styles.carreraNombre,
                        carrera === c.id && styles.carreraNombreSelected,
                      ]}
                      numberOfLines={2}
                    >
                      {c.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerBtn, isLoading && styles.registerBtnDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerBtnText}>
                {isLoading ? 'Registrando...' : 'Crear Cuenta'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 20,
    marginBottom: 32,
  },
  backBtn: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  carreraSection: {
    marginTop: 8,
  },
  carreraLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  carreraGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  carreraBtn: {
    width: '48%',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  carreraBtnSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: '#EFF6FF',
  },
  carreraAbrev: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 2,
  },
  carreraAbrevSelected: {
    color: Colors.light.primary,
  },
  carreraNombre: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    lineHeight: 14,
  },
  carreraNombreSelected: {
    color: Colors.light.primary,
  },
  registerBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  registerBtnDisabled: {
    backgroundColor: Colors.light.textMuted,
  },
  registerBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 4,
  },
  loginText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
