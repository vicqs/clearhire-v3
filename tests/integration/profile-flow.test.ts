import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react';
import { useProfile } from '../../src/hooks/useProfile';
import { dataService } from '../../src/services/dataService';
import { mockProfile } from '../mocks/data';

// Test de integración real con Supabase (cuando esté configurado)
describe('Profile Integration Flow', () => {
  describe('Profile CRUD Operations', () => {
    it('should complete full profile lifecycle', async () => {
      // Simular que Supabase está configurado
      vi.spyOn(dataService, 'isSupabaseMode').mockReturnValue(true);

      const mockSupabaseService = {
        getProfile: vi.fn().mockResolvedValue(null),
        saveProfile: vi.fn().mockResolvedValue(undefined),
      };

      // Mock del servicio de datos para usar nuestro mock
      vi.spyOn(dataService, 'getProfile').mockImplementation(mockSupabaseService.getProfile);
      vi.spyOn(dataService, 'saveProfile').mockImplementation(mockSupabaseService.saveProfile);

      const { result } = renderHook(() => useProfile());

      // 1. Verificar carga inicial (perfil no existe)
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.profile).toBeNull();
      expect(mockSupabaseService.getProfile).toHaveBeenCalledWith('mock-user');

      // 2. Crear nuevo perfil
      await result.current.saveProfile(mockProfile);

      expect(mockSupabaseService.saveProfile).toHaveBeenCalledWith('mock-user', mockProfile);
      expect(result.current.profile).toEqual(mockProfile);

      // 3. Actualizar perfil existente
      mockSupabaseService.getProfile.mockResolvedValue(mockProfile);

      const updatedProfile = {
        ...mockProfile,
        personalInfo: {
          ...mockProfile.personalInfo,
          firstName: 'Carlos',
        },
      };

      await result.current.saveProfile(updatedProfile);

      expect(mockSupabaseService.saveProfile).toHaveBeenCalledWith('mock-user', updatedProfile);
      expect(result.current.profile?.personalInfo.firstName).toBe('Carlos');

      // 4. Recargar perfil
      await result.current.reload();

      expect(mockSupabaseService.getProfile).toHaveBeenCalledTimes(2);
    });

    it('should handle network errors gracefully', async () => {
      vi.spyOn(dataService, 'isSupabaseMode').mockReturnValue(true);

      const networkError = new Error('Network error');
      vi.spyOn(dataService, 'getProfile').mockRejectedValue(networkError);

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toEqual(networkError);
      expect(result.current.profile).toBeNull();
    });

    it('should handle save errors and maintain local state', async () => {
      vi.spyOn(dataService, 'isSupabaseMode').mockReturnValue(true);
      vi.spyOn(dataService, 'getProfile').mockResolvedValue(mockProfile);

      const saveError = new Error('Save failed');
      vi.spyOn(dataService, 'saveProfile').mockRejectedValue(saveError);

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updatedProfile = {
        ...mockProfile,
        personalInfo: {
          ...mockProfile.personalInfo,
          firstName: 'Updated',
        },
      };

      try {
        await result.current.saveProfile(updatedProfile);
      } catch (error) {
        expect(error).toEqual(saveError);
      }

      expect(result.current.error).toEqual(saveError);
    });
  });

  describe('Auto-save Integration', () => {
    it('should auto-save profile changes after delay', async () => {
      vi.useFakeTimers();

      const mockSave = vi.fn().mockResolvedValue(undefined);

      // Simular componente que usa auto-save
      const { result } = renderHook(() => {
        const { useAutoSave } = require('../../src/hooks/useAutoSave');
        return useAutoSave({
          data: mockProfile,
          onSave: mockSave,
          delay: 1000,
        });
      });

      // Cambiar datos
      const updatedProfile = {
        ...mockProfile,
        personalInfo: {
          ...mockProfile.personalInfo,
          firstName: 'Auto-saved',
        },
      };

      result.current.data = updatedProfile;

      // Avanzar tiempo
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith(updatedProfile);
      });

      expect(result.current.saveStatus).toBe('saved');

      vi.useRealTimers();
    });
  });

  describe('Authentication Integration', () => {
    it('should handle authentication state changes', async () => {
      const { getCurrentUser } = require('../../src/utils/authHelper');

      // Simular usuario no autenticado inicialmente
      getCurrentUser.mockResolvedValue(null);

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simular login exitoso
      const mockUser = {
        id: '9a0ee8bb-7651-4149-ba8c-5b9e62d7e6ff',
        email: 'test@clearhire.com',
      };

      getCurrentUser.mockResolvedValue(mockUser);

      // Recargar después del login
      await result.current.reload();

      // Verificar que ahora usa el ID real del usuario
      expect(dataService.getProfile).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across multiple operations', async () => {
      vi.spyOn(dataService, 'isSupabaseMode').mockReturnValue(true);

      let storedProfile = mockProfile;

      vi.spyOn(dataService, 'getProfile').mockImplementation(async () => storedProfile);
      vi.spyOn(dataService, 'saveProfile').mockImplementation(async (_userId, profile) => {
        storedProfile = profile;
      });

      const { result } = renderHook(() => useProfile());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Operación 1: Actualizar información personal
      const step1 = {
        ...result.current.profile!,
        personalInfo: {
          ...result.current.profile!.personalInfo,
          firstName: 'Step1',
        },
      };

      await result.current.saveProfile(step1);

      // Operación 2: Agregar experiencia
      const step2 = {
        ...result.current.profile!,
        experience: [
          ...result.current.profile!.experience,
          {
            id: '2',
            company: 'New Company',
            position: 'Senior Developer',
            startDate: '2025-01-01',
            endDate: '',
            description: 'New role',
          },
        ],
      };

      await result.current.saveProfile(step2);

      // Operación 3: Recargar y verificar consistencia
      await result.current.reload();

      expect(result.current.profile?.personalInfo.firstName).toBe('Step1');
      expect(result.current.profile?.experience).toHaveLength(2);
      expect(result.current.profile?.experience[1].company).toBe('New Company');
    });
  });
});