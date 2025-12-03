// Pantalla principal - HomeScreen

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { useHorariosStore } from '@/src/stores/useHorariosStore';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { BackendStatus } from '@/src/components';
import { CARRERAS } from '@/src/types';

export default function HomeScreen() {
  const horariosGuardados = useHorariosStore((state) => state.horariosGuardados);
  const { user } = useAuthStore();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header con perfil */}
      <View style={styles.headerBar}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting}>Hola, {user?.nombre.split(' ')[0] || 'Usuario'}</Text>
          <Text style={styles.userCarrera}>
            {CARRERAS.find(c => c.id === user?.carrera)?.abreviatura || ''}
          </Text>
        </View>
        <BackendStatus />
        <TouchableOpacity 
          style={styles.profileBtn}
          onPress={() => router.push('/profile' as never)}
        >
          <Ionicons name="person-circle-outline" size={32} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {/* Logo y título */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="calendar" size={60} color={Colors.light.primary} />
          </View>
          <Text style={styles.title}>SIOH</Text>
          <Text style={styles.subtitle}>
            Sistema Inteligente de{'\n'}Optimización de Horarios
          </Text>
          <Text style={styles.upiit}>UPIIT - IPN</Text>
        </View>

        {/* Botones principales */}
        <View style={styles.buttonsContainer}>
          <Link href="/config" asChild>
            <TouchableOpacity style={styles.primaryButton}>
              <Ionicons name="add-circle-outline" size={24} color="#FFF" />
              <Text style={styles.primaryButtonText}>Generar Horario</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/horarios" asChild>
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="bookmark-outline" size={24} color={Colors.light.primary} />
              <Text style={styles.secondaryButtonText}>Horarios Guardados</Text>
              {horariosGuardados.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{horariosGuardados.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </Link>
        </View>

        {/* Info cards */}
        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="flash" size={24} color={Colors.light.secondary} />
            </View>
            <Text style={styles.infoTitle}>Rápido</Text>
            <Text style={styles.infoText}>Hasta 10 opciones en segundos</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="options" size={24} color={Colors.light.warning} />
            </View>
            <Text style={styles.infoTitle}>Optimizado</Text>
            <Text style={styles.infoText}>Menos horas muertas</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={[styles.infoIconContainer, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="school" size={24} color={Colors.light.info} />
            </View>
            <Text style={styles.infoTitle}>Flexible</Text>
            <Text style={styles.infoText}>Regular o irregular</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.2.0 • SIOH UPIIT</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  userCarrera: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  profileBtn: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.light.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  upiit: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 48,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 18,
    borderRadius: 14,
    gap: 10,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surface,
    paddingVertical: 18,
    borderRadius: 14,
    gap: 10,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  secondaryButtonText: {
    color: Colors.light.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
});
