/**
 * Utilidades de autenticación para testing y desarrollo
 */

export interface User {
  id: string;
  email: string;
}

/**
 * Obtener el usuario actual
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // En modo mock, devolver usuario de prueba
    return {
      id: 'test-user-id',
      email: 'test@clearhire.com'
    };
  } catch (error) {
    console.warn('Error getting current user:', error);
    return null;
  }
}

/**
 * Crear sesión de prueba
 */
export async function createTestSession(email: string, password: string): Promise<User | null> {
  try {
    // Simular autenticación exitosa
    if (email && password) {
      return {
        id: 'test-user-id',
        email: email
      };
    }
    return null;
  } catch (error) {
    console.warn('Error creating test session:', error);
    return null;
  }
}

/**
 * Cerrar sesión
 */
export async function signOut(): Promise<void> {
  try {
    // Simular cierre de sesión
    console.log('User signed out');
  } catch (error) {
    console.warn('Error signing out:', error);
  }
}

/**
 * Registrar usuario
 */
export async function signUp(email: string, password: string): Promise<User | null> {
  try {
    // Simular registro exitoso
    if (email && password) {
      return {
        id: 'new-user-id',
        email: email
      };
    }
    return null;
  } catch (error) {
    console.warn('Error signing up:', error);
    return null;
  }
}