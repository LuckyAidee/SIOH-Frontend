// Layout para rutas de horarios con guard de protección

import { Stack, router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/constants/colors';
import { useMateriasStore } from '@/src/stores/useMateriasStore';
import { useHorariosStore } from '@/src/stores/useHorariosStore';

export default function HorariosLayout() {
  const hayMateriasSeleccionadas = useMateriasStore((state) => state.hayMateriasSeleccionadas);
  const hayHorariosGenerados = useHorariosStore((state) => state.hayHorariosGenerados);
  const hayHorariosGuardados = useHorariosStore((state) => state.hayHorariosGuardados);
  const pathname = usePathname();

  useEffect(() => {
    // Guard: Si no hay materias seleccionadas ni horarios, redirigir
    // Pero permitir acceso si hay horarios guardados (para ver desde Home)
    if (!hayMateriasSeleccionadas() && !hayHorariosGenerados() && !hayHorariosGuardados()) {
      router.replace('/');
    }
  }, []);

  const HomeButton = () => (
    <TouchableOpacity 
      onPress={() => router.replace('/')}
      style={styles.homeBtn}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      activeOpacity={0.7}
    >
      <Ionicons name="home-outline" size={22} color={Colors.light.text} />
    </TouchableOpacity>
  );

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Horarios',
          headerLeft: () => <HomeButton />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Detalle del Horario',
          headerBackTitle: 'Horarios',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  homeBtn: {
    padding: 8,
    marginLeft: 4,
  },
});
