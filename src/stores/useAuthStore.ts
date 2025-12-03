// Store para autenticación de usuarios (híbrido: backend + fallback local)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, CarreraId, CARRERAS } from '../types';
import { apiService } from '../services/ApiService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  useBackend: boolean; // Flag para usar backend o local
  
  // Acciones
  login: (email: string, password: string) => Promise<boolean>;
  register: (nombre: string, email: string, password: string, carrera: CarreraId) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'nombre' | 'carrera'>>) => void;
  checkBackendConnection: () => Promise<boolean>;
  clearError: () => void;
  
  // Para almacenar usuarios registrados (local)
  registeredUsers: Array<{ email: string; password: string; user: User }>;
}

// Generar ID único
const generarId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      useBackend: false, // Por defecto usa local
      registeredUsers: [],
      
      // Verificar conexión con backend
      checkBackendConnection: async () => {
        try {
          const response = await apiService.healthCheck();
          const connected = response.status === 200;
          set({ useBackend: connected });
          return connected;
        } catch {
          set({ useBackend: false });
          return false;
        }
      },
      
      // Login (intenta backend, fallback a local)
      login: async (email, password) => {
        const { useBackend, registeredUsers } = get();
        set({ isLoading: true, error: null });
        
        if (useBackend) {
          try {
            const response = await apiService.login(email, password);
            
            if (response.data?.usuario) {
              const user: User = {
                id: response.data.usuario.id.toString(),
                nombre: response.data.usuario.nombre,
                email: response.data.usuario.email,
                carrera: null as any, // El backend no tiene carrera
                creadoEn: new Date(),
              };
              set({ user, isAuthenticated: true, isLoading: false });
              return true;
            }
            
            if (response.error) {
              set({ error: response.error, isLoading: false });
            }
          } catch (error) {
            console.log('Backend no disponible, usando local');
          }
        }
        
        // Fallback a autenticación local
        const found = registeredUsers.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        
        if (found) {
          set({ user: found.user, isAuthenticated: true, isLoading: false });
          return true;
        }
        
        set({ 
          error: 'Credenciales incorrectas', 
          isLoading: false 
        });
        return false;
      },
      
      // Registro (intenta backend, fallback a local)
      register: async (nombre, email, password, carrera) => {
        const { useBackend, registeredUsers } = get();
        set({ isLoading: true, error: null });
        
        if (useBackend) {
          try {
            const response = await apiService.register(email, password, nombre);
            
            if (response.data?.usuario) {
              const user: User = {
                id: response.data.usuario.id.toString(),
                nombre: response.data.usuario.nombre,
                email: response.data.usuario.email,
                carrera,
                creadoEn: new Date(),
              };
              
              // Guardar también localmente para tener backup
              set({
                registeredUsers: [
                  ...registeredUsers,
                  { email, password, user },
                ],
                user,
                isAuthenticated: true,
                isLoading: false,
              });
              return true;
            }
            
            if (response.error) {
              set({ error: response.error, isLoading: false });
              return false;
            }
          } catch (error) {
            console.log('Backend no disponible, usando local');
          }
        }
        
        // Fallback a registro local
        const exists = registeredUsers.some(
          u => u.email.toLowerCase() === email.toLowerCase()
        );
        
        if (exists) {
          set({ error: 'El email ya está registrado', isLoading: false });
          return false;
        }
        
        const newUser: User = {
          id: generarId(),
          nombre,
          email,
          carrera,
          creadoEn: new Date(),
        };
        
        set({
          registeredUsers: [
            ...registeredUsers,
            { email, password, user: newUser },
          ],
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return true;
      },
      
      // Logout
      logout: () => {
        const { useBackend } = get();
        if (useBackend) {
          apiService.logout().catch(() => {});
        }
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },
      
      // Actualizar perfil
      updateProfile: (updates) => {
        const { user, registeredUsers } = get();
        
        if (!user) return;
        
        const updatedUser = { ...user, ...updates };
        
        // Actualizar en registeredUsers también
        const updatedRegistered = registeredUsers.map(r => 
          r.user.id === user.id 
            ? { ...r, user: updatedUser }
            : r
        );
        
        set({
          user: updatedUser,
          registeredUsers: updatedRegistered,
        });
      },
      
      // Limpiar error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'sioh-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        registeredUsers: state.registeredUsers,
        useBackend: state.useBackend,
      }),
    }
  )
);
