/**
 * Hook para gestionar aplicaciones a trabajos
 * Usa el servicio centralizado (Supabase o Mock automático)
 */

import { useState, useEffect, useCallback } from 'react';
import { dataService } from '../services/dataService';
import { supabase } from '../lib/supabase';
import type { Application, ApplicationStatus } from '../types/application';

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updating, setUpdating] = useState(false);

  // Obtener ID del candidato
  const getCandidateId = useCallback(async () => {
    if (!dataService.isSupabaseMode()) {
      return 'mock-candidate';
    }

    const { data: { user } } = await supabase!.auth.getUser();
    return user?.id || 'mock-candidate';
  }, []);

  // Cargar aplicaciones
  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const candidateId = await getCandidateId();
      const apps = await dataService.getApplications(candidateId);
      setApplications(apps);
    } catch (err) {
      console.error('Error cargando aplicaciones:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [getCandidateId]);

  // Obtener una aplicación específica
  const getApplication = useCallback(async (applicationId: string): Promise<Application | null> => {
    try {
      return await dataService.getApplication(applicationId);
    } catch (err) {
      console.error('Error obteniendo aplicación:', err);
      return null;
    }
  }, []);

  // Crear nueva aplicación
  const createApplication = useCallback(async (application: Omit<Application, 'id'>): Promise<Application | null> => {
    try {
      setUpdating(true);
      const newApp = await dataService.createApplication(application);
      await loadApplications(); // Recargar lista
      return newApp;
    } catch (err) {
      console.error('Error creando aplicación:', err);
      setError(err as Error);
      return null;
    } finally {
      setUpdating(false);
    }
  }, [loadApplications]);

  // Actualizar aplicación
  const updateApplication = useCallback(async (
    applicationId: string,
    updates: Partial<Application>
  ): Promise<void> => {
    try {
      setUpdating(true);
      await dataService.updateApplication(applicationId, updates);
      await loadApplications(); // Recargar lista
    } catch (err) {
      console.error('Error actualizando aplicación:', err);
      setError(err as Error);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [loadApplications]);

  // Actualizar estado de aplicación
  const updateStatus = useCallback(async (
    applicationId: string,
    newStatus: ApplicationStatus
  ): Promise<void> => {
    await updateApplication(applicationId, {
      status: newStatus,
      lastUpdate: new Date(),
    });
  }, [updateApplication]);

  // Filtrar aplicaciones por estado
  const filterByStatus = useCallback((status: ApplicationStatus | 'all'): Application[] => {
    if (status === 'all') return applications;
    return applications.filter(app => app.status === status);
  }, [applications]);

  // Cargar aplicaciones al montar
  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  return {
    applications,
    loading,
    error,
    updating,
    getApplication,
    createApplication,
    updateApplication,
    updateStatus,
    filterByStatus,
    reload: loadApplications,
  };
};
