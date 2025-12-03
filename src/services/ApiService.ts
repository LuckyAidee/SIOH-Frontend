// Servicio para comunicación con el backend SIOH

import AsyncStorage from '@react-native-async-storage/async-storage';
import { CarreraId, Turno, Semestre, Materia, Grupo, Horario } from '../types';

// Configuración del API
// En desarrollo usa la IP local, en producción usa tu dominio
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.0.28:3000/api'
  : 'https://tu-servidor.com/api'; // Cambiar en producción

const TOKEN_KEY = 'sioh-auth-token';

// Tipos de respuesta del API
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    email: string;
    nombre: string;
  };
}

interface CarreraResponse {
  id: string;
  nombre: string;
  abreviatura: string;
}

interface MateriaResponse {
  id: string;
  nombre: string;
  codigo: string;
  carrera_id: string;
  semestre: number;
  turno: string;
}

interface GrupoResponse {
  id: string;
  numero: number;
  materia_id: string;
  profesor: string;
  materia_nombre: string;
  semestre: number;
  turno: string;
  carrera_id: string;
  sesiones?: SesionResponse[];
}

interface SesionResponse {
  id: string;
  grupo_id: string;
  dia: string;
  hora_inicio: number;
  hora_fin: number;
  salon: string;
  edificio: string;
}

interface HorarioGuardadoResponse {
  id: number;
  usuario_id: number;
  nombre: string;
  datos: string;
  created_at: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  // Cargar token de AsyncStorage
  private async loadToken(): Promise<void> {
    try {
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error cargando token:', error);
    }
  }

  // Guardar token
  private async saveToken(token: string): Promise<void> {
    try {
      this.token = token;
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error guardando token:', error);
    }
  }

  // Eliminar token
  private async clearToken(): Promise<void> {
    try {
      this.token = null;
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error eliminando token:', error);
    }
  }

  // Headers comunes
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Método genérico para hacer peticiones
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Error en la petición',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('Error en petición API:', error);
      return {
        error: 'Error de conexión con el servidor',
        status: 0,
      };
    }
  }

  // ==================== AUTH ====================

  async register(email: string, password: string, nombre: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nombre }),
    });

    if (response.data?.token) {
      await this.saveToken(response.data.token);
    }

    return response;
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data?.token) {
      await this.saveToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    await this.clearToken();
  }

  async getMe(): Promise<ApiResponse<{ usuario: AuthResponse['usuario'] }>> {
    return this.request('/auth/me');
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  // ==================== CARRERAS ====================

  async getCarreras(): Promise<ApiResponse<{ carreras: CarreraResponse[] }>> {
    return this.request('/carreras');
  }

  async getCarrera(id: string): Promise<ApiResponse<CarreraResponse & { semestres: { turno: string; semestre: number }[] }>> {
    return this.request(`/carreras/${id}`);
  }

  // ==================== MATERIAS ====================

  async getMaterias(params: {
    carrera?: CarreraId;
    turno?: Turno;
    semestre?: Semestre;
  }): Promise<ApiResponse<{ materias: MateriaResponse[] }>> {
    const queryParams = new URLSearchParams();
    if (params.carrera) queryParams.append('carrera', params.carrera);
    if (params.turno) queryParams.append('turno', params.turno);
    if (params.semestre) queryParams.append('semestre', params.semestre.toString());

    return this.request(`/materias?${queryParams.toString()}`);
  }

  // ==================== GRUPOS ====================

  async getGrupos(params: {
    carrera?: CarreraId;
    turno?: Turno;
    semestre?: Semestre;
    materia?: string;
  }): Promise<ApiResponse<{ grupos: GrupoResponse[] }>> {
    const queryParams = new URLSearchParams();
    if (params.carrera) queryParams.append('carrera', params.carrera);
    if (params.turno) queryParams.append('turno', params.turno);
    if (params.semestre) queryParams.append('semestre', params.semestre.toString());
    if (params.materia) queryParams.append('materia', params.materia);

    return this.request(`/grupos?${queryParams.toString()}`);
  }

  async getGrupo(id: string): Promise<ApiResponse<GrupoResponse>> {
    return this.request(`/grupos/${id}`);
  }

  // ==================== HORARIOS GUARDADOS ====================

  async getHorariosGuardados(): Promise<ApiResponse<{ horarios: HorarioGuardadoResponse[] }>> {
    return this.request('/horarios');
  }

  async guardarHorario(nombre: string, horario: Horario): Promise<ApiResponse<HorarioGuardadoResponse>> {
    return this.request('/horarios', {
      method: 'POST',
      body: JSON.stringify({
        nombre,
        datos: JSON.stringify(horario),
      }),
    });
  }

  async eliminarHorario(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/horarios/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== HEALTH CHECK ====================

  async healthCheck(): Promise<ApiResponse<{ status: string; message: string }>> {
    return this.request('/health');
  }

  // ==================== DATOS HORARIOS (ENDPOINT HÍBRIDO) ====================

  async getDatosHorarios(): Promise<ApiResponse<any>> {
    return this.request('/horarios/datos');
  }
}

// Instancia singleton
export const apiService = new ApiService();

// Funciones helper para obtener datos formateados
export const obtenerCarrerasAPI = async (): Promise<CarreraResponse[]> => {
  const response = await apiService.getCarreras();
  return response.data?.carreras || [];
};

export const obtenerMateriasAPI = async (
  carrera: CarreraId,
  turno: Turno,
  semestres: Semestre[]
): Promise<Materia[]> => {
  const materias: Materia[] = [];
  
  for (const semestre of semestres) {
    const response = await apiService.getMaterias({ carrera, turno, semestre });
    if (response.data?.materias) {
      materias.push(...response.data.materias.map(m => ({
        id: m.id,
        nombre: m.nombre,
        codigo: m.codigo,
        semestre: m.semestre as unknown as Semestre,
        turno: m.turno as Turno,
      })));
    }
  }
  
  return materias;
};

export const obtenerGruposAPI = async (
  carrera: CarreraId,
  turno: Turno,
  semestres: Semestre[]
): Promise<Record<string, Grupo[]>> => {
  const gruposPorMateria: Record<string, Grupo[]> = {};
  
  for (const semestre of semestres) {
    const response = await apiService.getGrupos({ carrera, turno, semestre });
    if (response.data?.grupos) {
      for (const grupo of response.data.grupos) {
        // Obtener sesiones del grupo
        const grupoDetalle = await apiService.getGrupo(grupo.id);
        const sesiones = grupoDetalle.data?.sesiones || [];
        
        const grupoFormateado: Grupo = {
          id: grupo.id,
          numero: grupo.numero.toString(),
          materiaId: grupo.materia_id,
          materiaNombre: grupo.materia_nombre,
          profesor: grupo.profesor,
          sesiones: sesiones.map(s => ({
            id: s.id,
            grupoId: s.grupo_id,
            dia: s.dia as any,
            horaInicio: s.hora_inicio,
            horaFin: s.hora_fin,
            salon: s.salon,
            edificio: s.edificio,
          })),
          esFijado: false,
        };
        
        if (!gruposPorMateria[grupo.materia_id]) {
          gruposPorMateria[grupo.materia_id] = [];
        }
        gruposPorMateria[grupo.materia_id].push(grupoFormateado);
      }
    }
  }
  
  return gruposPorMateria;
};
