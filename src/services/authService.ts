/**
 * Servicio de Autenticación
 * Maneja la autenticación con Supabase y fallback a modo mock
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email?: string;
  isAuthenticated: boolean;
  isMock: boolean;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.initializeAuth();
  }

  /**
   * Inicializa la autenticación
   */
  private async initializeAuth() {
    if (!isSupabaseConfigured()) {
      console.log('📦 Modo mock activado: Creando usuario mock');
      this.setCurrentUser({
        id: 'mock-user-id',
        email: 'usuario@mock.com',
        isAuthenticated: true,
        isMock: true
      });
      return;
    }

    try {
      // Verificar sesión existente con timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout de conexión')), 3000)
      );

      const sessionPromise = supabase!.auth.getSession();
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error obteniendo sesión:', error);
        this.handleAuthError(error);
        return;
      }

      if (session?.user) {
        console.log('✅ Sesión existente encontrada:', session.user.id);
        this.setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          isAuthenticated: true,
          isMock: false
        });
      } else {
        console.log('⚠️ No hay sesión activa, creando usuario anónimo');
        await this.createAnonymousUser();
      }

      // Escuchar cambios de autenticación
      supabase!.auth.onAuthStateChange((event: string, session: any) => {
        console.log('🔄 Cambio de estado de auth:', event);

        if (session?.user) {
          this.setCurrentUser({
            id: session.user.id,
            email: session.user.email,
            isAuthenticated: true,
            isMock: false
          });
        } else {
          this.setCurrentUser(null);
        }
      });

    } catch (error) {
      console.error('❌ Error inicializando autenticación:', error);
      this.handleAuthError(error);
    }
  }

  /**
   * Crea un usuario anónimo para desarrollo
   */
  private async createAnonymousUser() {
    try {
      console.log('👤 Creando usuario anónimo para desarrollo...');

      const { data, error } = await supabase!.auth.signInAnonymously();

      if (error) {
        console.error('Error creando usuario anónimo:', error);
        // En producción NO hacemos fallback a mock para evitar errores 400 en Supabase
        // El usuario deberá iniciar sesión manualmente
        return;
      }

      if (data.user) {
        console.log('✅ Usuario anónimo creado:', data.user.id);
        this.setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          isAuthenticated: true,
          isMock: false
        });
      }

    } catch (error) {
      console.error('Error en signInAnonymously:', error);
      // En producción NO hacemos fallback a mock
    }
  }

  /**
   * Maneja errores de autenticación
   */
  private handleAuthError(error: any) {
    console.warn('⚠️ Error de autenticación, usando modo mock:', error.message);

    // Crear usuario mock como fallback
    this.setCurrentUser({
      id: 'mock-user-' + Date.now(),
      email: 'usuario@mock.com',
      isAuthenticated: true,
      isMock: true
    });
  }

  /**
   * Establece el usuario actual y notifica a los listeners
   */
  private setCurrentUser(user: AuthUser | null) {
    this.currentUser = user;
    this.listeners.forEach(listener => listener(user));
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId(): string | null {
    return this.currentUser?.id || null;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUser?.isAuthenticated || false;
  }

  /**
   * Verifica si está en modo mock
   */
  isMockMode(): boolean {
    return this.currentUser?.isMock || !isSupabaseConfigured();
  }

  /**
   * Inicia sesión con email y contraseña
   */
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    // Verificar si Supabase está configurado y habilitado
    if (!isSupabaseConfigured() || import.meta.env.VITE_USE_SUPABASE !== 'true') {
      console.log('📦 Mock: Simulando inicio de sesión (Supabase deshabilitado)');
      this.setCurrentUser({
        id: 'mock-user-' + Date.now(),
        email,
        isAuthenticated: true,
        isMock: true
      });
      return { success: true };
    }

    try {
      console.log('🔄 Intentando conectar a Supabase...');

      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error en signIn:', error);
        // NO hacer fallback automático - devolver el error
        return {
          success: false,
          error: `Error de Supabase: ${error.message}`
        };
      }

      if (data.user) {
        this.setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          isAuthenticated: true,
          isMock: false
        });
      }

      return { success: true };

    } catch (error: any) {
      console.error('Error inesperado en signIn:', error);

      // NO hacer fallback automático - devolver el error
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Cierra sesión
   */
  async signOut(): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.log('📦 Mock: Simulando cierre de sesión');
      this.setCurrentUser(null);
      return;
    }

    try {
      const { error } = await supabase!.auth.signOut();
      if (error) {
        console.error('Error en signOut:', error);
      }
      this.setCurrentUser(null);
    } catch (error) {
      console.error('Error inesperado en signOut:', error);
    }
  }

  /**
   * Registra un listener para cambios de autenticación
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.push(callback);

    // Llamar inmediatamente con el estado actual
    callback(this.currentUser);

    // Retornar función para desregistrar
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Limpia el flag de problemas de conexión para permitir reintentos
   */
  clearConnectionIssues(): void {
    localStorage.removeItem('supabase_connection_failed');
    console.log('🔄 Flag de problemas de conexión limpiado');
  }

  /**
   * Refresca la sesión actual
   */
  async refreshSession(): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      const { data, error } = await supabase!.auth.refreshSession();

      if (error) {
        console.error('Error refrescando sesión:', error);
        return;
      }

      if (data.session?.user) {
        this.setCurrentUser({
          id: data.session.user.id,
          email: data.session.user.email,
          isAuthenticated: true,
          isMock: false
        });
      }
    } catch (error) {
      console.error('Error inesperado refrescando sesión:', error);
    }
  }
}

// Exportar instancia singleton
export const authService = new AuthService();