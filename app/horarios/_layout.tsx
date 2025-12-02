// Layout para rutas de horarios con guard de protección

import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { useMateriasStore } from '@/src/stores/useMateriasStore';
import { useHorariosStore } from '@/src/stores/useHorariosStore';

export default function HorariosLayout() {
  const hayMateriasSeleccionadas = useMateriasStore((state) => state.hayMateriasSeleccionadas);
  const hayHorariosGenerados = useHorariosStore((state) => state.hayHorariosGenerados);
  const hayHorariosGuardados = useHorariosStore((state) => state.hayHorariosGuardados);

  useEffect(() => {
    // Guard: Si no hay materias seleccionadas ni horarios, redirigir
    if (!hayMateriasSeleccionadas() && !hayHorariosGenerados() && !hayHorariosGuardados()) {
      router.replace('/select-materias');
    }
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Horarios Generados',
          headerBackTitle: 'Inicio',
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
