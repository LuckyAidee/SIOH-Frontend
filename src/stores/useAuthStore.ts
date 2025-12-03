// Store para autenticación local de usuarios

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, CarreraId, CARRERAS } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  
  // Acciones
  login: (email: string, password: string) => Promise<boolean>;
  register: (nombre: string, email: string, password: string, carrera: CarreraId) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'nombre' | 'carrera'>>) => void;
  
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
      registeredUsers: [],
      
      // Login
      login: async (email, password) => {
        const { registeredUsers } = get();
        
        const found = registeredUsers.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        
        if (found) {
          set({
            user: found.user,
            isAuthenticated: true,
          });
          return true;
        }
        
        return false;
      },
      
      // Registro
      register: async (nombre, email, password, carrera) => {
        const { registeredUsers } = get();
        
        // Verificar si ya existe
        const exists = registeredUsers.some(
          u => u.email.toLowerCase() === email.toLowerCase()
        );
        
        if (exists) {
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
        });
        
        return true;
      },
      
      // Logout
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
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
    }),
    {
      name: 'sioh-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
