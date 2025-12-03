import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { useHorariosStore } from '@/src/stores/useHorariosStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated } = useAuthStore();
  const { limpiarTodo: limpiarHorarios } = useHorariosStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const firstSegment = segments[0] as string;
    const inAuthGroup = firstSegment === 'login' || firstSegment === 'register';

    if (!isAuthenticated && !inAuthGroup) {
      // Si no está autenticado y no está en login/register, limpiar datos previos y redirigir
      limpiarHorarios();
      router.replace('/login' as never);
    } else if (isAuthenticated && inAuthGroup) {
      // Si está autenticado y está en login/register, redirigir al home
      router.replace('/');
    }
  }, [isAuthenticated, segments, navigationState?.key]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen 
          name="login" 
          options={{ 
            title: 'Iniciar Sesión',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            title: 'Registro',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'SIOH',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{ 
            title: 'Mi Perfil',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="config" 
          options={{ 
            title: 'Configuración',
            headerBackTitle: 'Inicio',
          }} 
        />
        <Stack.Screen 
          name="select-materias" 
          options={{ 
            title: 'Seleccionar Materias',
            headerBackTitle: 'Config',
          }} 
        />
        <Stack.Screen 
          name="horarios" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="modal" 
          options={{ presentation: 'modal' }} 
        />
      </Stack>
    </ThemeProvider>
  );
}
