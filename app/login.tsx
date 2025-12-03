// Pantalla de Login

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { useAuthStore } from '@/src/stores/useAuthStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email.trim(), password);
      
      if (success) {
        router.replace('/');
      } else {
        Alert.alert('Error', 'Correo o contraseña incorrectos');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Ionicons name="calendar" size={50} color={Colors.light.primary} />
            </View>
            <Text style={styles.title}>SIOH</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
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

            <TouchableOpacity
              style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginBtnText}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Registro */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => router.push('/register' as never)}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
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
  loginBtn: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnDisabled: {
    backgroundColor: Colors.light.textMuted,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    gap: 4,
  },
  registerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
