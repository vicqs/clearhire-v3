/**
 * Hook para gestionar el perfil del usuario
 * Usa el servicio centralizado (Supabase o Mock automático)
 */

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import type { Profile } from '../types/profile';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);

  // Obtener ID del usuario usando el servicio de auth
  const getUserId = useCallback(() => {
    const userId = authService.getCurrentUserId();
    
    if (!userId) {
      console.warn('⚠️ No hay usuario autenticado');
      return null;
    }
    
    console.log('✅ Usuario obtenido:', userId, authService.isMockMode() ? '(mock)' : '(supabase)');
    return userId;
  }, []);

  // Cargar perfil
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Esperar a que el servicio de auth esté listo
      let attempts = 0;
      let userId = getUserId();
      
      while (!userId && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        userId = getUserId();
        attempts++;
      }
      
      if (!userId) {
        console.log('📦 Usando datos mock (sin autenticación después de espera)');
        const mockData = await dataService.getProfile('mock-user');
        setProfile(mockData);
        return;
      }

      const userProfile = await dataService.getProfile(userId);
      setProfile(userProfile);
    } catch (err) {
      console.error('Error cargando perfil:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // Guardar perfil
  const saveProfile = useCallback(async (updatedProfile: Profile) => {
    try {
      setSaving(true);
      setError(null);

      const userId = getUserId();
      
      if (!userId) {
        console.warn('⚠️ No se puede guardar: usuario no autenticado');
        setProfile(updatedProfile); // Actualizar solo localmente
        
        if (authService.isMockMode()) {
          console.log('📦 Modo mock: Guardado simulado');
          return; // En modo mock, no lanzar error
        }
        
        throw new Error('Usuario no autenticado. Por favor, inicia sesión para guardar cambios.');
      }

      await dataService.saveProfile(userId, updatedProfile);
      setProfile(updatedProfile);
      console.log('✅ Perfil guardado exitosamente');
    } catch (err) {
      console.error('Error guardando perfil:', err);
      setError(err as Error);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [getUserId]);

  // Actualizar campo específico
  const updateField = useCallback(async (field: keyof Profile, value: any) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      [field]: value,
    };

    await saveProfile(updatedProfile);
  }, [profile, saveProfile]);

  // Cargar perfil al montar y escuchar cambios de auth
  useEffect(() => {
    // Cargar perfil inicial
    loadProfile();

    // Escuchar cambios de autenticación
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (user) {
        console.log('🔄 Usuario cambió, recargando perfil:', user.id);
        loadProfile();
      } else {
        console.log('🔄 Usuario desconectado, limpiando perfil');
        setProfile(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    saving,
    saveProfile,
    updateField,
    reload: loadProfile,
  };
};
