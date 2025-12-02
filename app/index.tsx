// Pantalla principal - HomeScreen

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Image } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { useHorariosStore } from '@/src/stores/useHorariosStore';

export default function HomeScreen() {
  const horariosGuardados = useHorariosStore((state) => state.horariosGuardados);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
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
        </View>

        {/* Botones principales */}
        <View style={styles.buttonsContainer}>
          <Link href="/select-materias" asChild>
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
            <Ionicons name="flash-outline" size={24} color={Colors.light.secondary} />
            <Text style={styles.infoTitle}>Rápido</Text>
            <Text style={styles.infoText}>Genera hasta 100 opciones en segundos</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="options-outline" size={24} color={Colors.light.warning} />
            <Text style={styles.infoTitle}>Optimizado</Text>
            <Text style={styles.infoText}>Minimiza horas muertas automáticamente</Text>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="lock-closed-outline" size={24} color={Colors.light.info} />
            <Text style={styles.infoTitle}>Flexible</Text>
            <Text style={styles.infoText}>Fija grupos específicos si lo deseas</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0 • SIOH</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    textAlign: 'center',
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
