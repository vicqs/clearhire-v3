import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { profileService } from '../../src/services/supabase/profileService'
import { mockProfile } from '../fixtures/profileData'
import { authenticateTestUser, cleanupTestData, testSupabase } from './setup'

// Helper function to check if Supabase is configured
const isSupabaseConfigured = () => {
  // For testing purposes, we'll assume Supabase is available
  // In a real environment, you would check actual environment variables
  return true
}

describe('Supabase Integration Tests', () => {
  let testUser: any
  let testUserId: string

  beforeEach(async () => {
    // Skip all tests if Supabase not configured
    if (!isSupabaseConfigured()) {
      return
    }

    // Authenticate test user
    testUser = await authenticateTestUser()
    testUserId = testUser.id
    
    // Clean up any existing test data
    await cleanupTestData(testUserId)
  })

  afterEach(async () => {
    if (!isSupabaseConfigured()) {
      return
    }

    // Clean up test data after each test
    if (testUserId) {
      await cleanupTestData(testUserId)
    }
    
    // Sign out
    await testSupabase.auth.signOut()
  })

  describe('Profile Service Integration', () => {
    it('should create and retrieve a profile', async () => {
      if (!isSupabaseConfigured()) {
        console.log('⏭️ Skipping test - Supabase not configured')
        return
      }

      // Create profile using service
      await profileService.upsertProfile(testUserId, mockProfile)
      
      // Retrieve profile
      const retrievedProfile = await profileService.getProfile(testUserId)
      
      expect(retrievedProfile).toBeDefined()
      expect(retrievedProfile?.personalInfo.firstName).toBe(mockProfile.personalInfo.firstName)
      expect(retrievedProfile?.personalInfo.lastName).toBe(mockProfile.personalInfo.lastName)
      expect(retrievedProfile?.personalInfo.email).toBe(mockProfile.personalInfo.email)
    })

    it('should update existing profile', async () => {
      if (!isSupabaseConfigured()) {
        console.log('⏭️ Skipping test - Supabase not configured')
        return
      }

      // Crear perfil inicial
      await profileService.upsertProfile(testUserId, mockProfile)

      // Actualizar perfil
      const updatedProfile = {
        ...mockProfile,
        personalInfo: {
          ...mockProfile.personalInfo,
          firstName: 'Updated Name',
        },
        trade: 'Updated Trade',
      }

      await profileService.upsertProfile(testUserId, updatedProfile)

      // Verificar actualización
      const retrievedProfile = await profileService.getProfile(testUserId)

      expect(retrievedProfile?.personalInfo.firstName).toBe('Updated Name')
      expect(retrievedProfile?.trade).toBe('Updated Trade')
    })

    it('should handle profile with all related data', async () => {
      if (!isSupabaseConfigured()) {
        console.log('⏭️ Skipping test - Supabase not configured')
        return
      }

      const completeProfile = {
        ...mockProfile,
        experience: [
          {
            id: '1',
            company: 'Test Company 1',
            position: 'Developer',
            startDate: '2020-01-01',
            endDate: '2022-01-01',
            description: 'Test description 1',
          },
          {
            id: '2',
            company: 'Test Company 2',
            position: 'Senior Developer',
            startDate: '2022-01-01',
            endDate: '',
            description: 'Test description 2',
          },
        ],
        education: [
          {
            id: '1',
            institution: 'Test University',
            degree: 'Computer Science',
            fieldOfStudy: 'Software Engineering',
            graduationYear: '2020',
          },
        ],
        languages: [
          { language: 'Spanish', proficiency: 'Nativo' as const },
          { language: 'English', proficiency: 'Avanzado' as const },
        ],
        softSkills: ['Leadership', 'Communication', 'Problem Solving'],
        references: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
          },
        ],
      }

      // Crear perfil completo
      await profileService.upsertProfile(testUserId, completeProfile)

      // Recuperar y verificar
      const retrievedProfile = await profileService.getProfile(testUserId)

      expect(retrievedProfile?.experience).toHaveLength(2)
      expect(retrievedProfile?.education).toHaveLength(1)
      expect(retrievedProfile?.languages).toHaveLength(2)
      expect(retrievedProfile?.softSkills).toHaveLength(3)
      expect(retrievedProfile?.references).toHaveLength(1)

      // Verificar datos específicos
      expect(retrievedProfile?.experience[0].company).toBe('Test Company 1')
      expect(retrievedProfile?.education[0].institution).toBe('Test University')
      expect(retrievedProfile?.languages[0].language).toBe('Spanish')
      expect(retrievedProfile?.softSkills).toContain('Leadership')
      expect(retrievedProfile?.references[0].name).toBe('John Doe')
    })

    it('should handle profile not found', async () => {
      if (!isSupabaseConfigured()) {
        console.log('⏭️ Skipping test - Supabase not configured')
        return
      }

      const nonExistentUserId = '00000000-0000-0000-0000-000000000000'
      const profile = await profileService.getProfile(nonExistentUserId)

      expect(profile).toBeNull()
    })
  })

  describe('Database Constraints and Validation', () => {
    it('should enforce required fields', async () => {
      if (!isSupabaseConfigured()) {
        console.log('⏭️ Skipping test - Supabase not configured')
        return
      }

      const invalidProfile = {
        ...mockProfile,
        personalInfo: {
          ...mockProfile.personalInfo,
          firstName: '', // Campo requerido vacío
          email: '', // Campo requerido vacío
        },
      }

      await expect(
        profileService.upsertProfile(testUserId, invalidProfile)
      ).rejects.toThrow()
    })

    it('should enforce email uniqueness', async () => {
      if (!isSupabaseConfigured()) {
        console.log('⏭️ Skipping test - Supabase not configured')
        return
      }

      // Crear primer perfil
      await profileService.upsertProfile(testUserId, mockProfile)

      // Intentar crear segundo perfil con el mismo email
      const secondUserId = '11111111-1111-1111-1111-111111111111'
      const duplicateEmailProfile = {
        ...mockProfile,
        personalInfo: {
          ...mockProfile.personalInfo,
          firstName: 'Different Name',
        },
      }

      await expect(
        profileService.upsertProfile(secondUserId, duplicateEmailProfile)
      ).rejects.toThrow()
    })
  })

  describe('Performance Tests', () => {
    it('should handle large profile data efficiently', async () => {
      if (!isSupabaseConfigured()) {
        console.log('⏭️ Skipping test - Supabase not configured')
        return
      }

      // Crear perfil con muchos datos
      const largeProfile = {
        ...mockProfile,
        experience: Array.from({ length: 10 }, (_, i) => ({
          id: `exp-${i}`,
          company: `Company ${i}`,
          position: `Position ${i}`,
          startDate: `202${i % 5}-01-01`,
          endDate: i % 2 === 0 ? `202${(i % 5) + 1}-01-01` : '',
          description: `Description ${i}`.repeat(50), // Descripción larga
        })),
        softSkills: Array.from({ length: 20 }, (_, i) => `Skill ${i}`),
      }

      const startTime = Date.now()
      
      await profileService.upsertProfile(testUserId, largeProfile)
      const retrievedProfile = await profileService.getProfile(testUserId)
      
      const endTime = Date.now()
      const duration = endTime - startTime

      // Verificar que la operación se completó en tiempo razonable (< 5 segundos)
      expect(duration).toBeLessThan(5000)
      
      // Verificar que todos los datos se guardaron correctamente
      expect(retrievedProfile?.experience).toHaveLength(10)
      expect(retrievedProfile?.softSkills).toHaveLength(20)
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle concurrent profile updates', async () => {
      if (!isSupabaseConfigured()) {
        console.log('⏭️ Skipping test - Supabase not configured')
        return
      }

      // Crear perfil inicial
      await profileService.upsertProfile(testUserId, mockProfile)

      // Realizar múltiples actualizaciones concurrentes
      const updates = Array.from({ length: 5 }, (_, i) => {
        const updatedProfile = {
          ...mockProfile,
          personalInfo: {
            ...mockProfile.personalInfo,
            firstName: `Concurrent Update ${i}`,
          },
        }
        return profileService.upsertProfile(testUserId, updatedProfile)
      })

      // Esperar a que todas las actualizaciones se completen
      await Promise.all(updates)

      // Verificar que el perfil final es válido
      const finalProfile = await profileService.getProfile(testUserId)
      
      expect(finalProfile).not.toBeNull()
      expect(finalProfile?.personalInfo.firstName).toMatch(/^Concurrent Update \d$/)
    })
  })
})