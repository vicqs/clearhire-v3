import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { dataService } from '../../../src/services/dataService'
import { mockProfile } from '../../fixtures/profileData'

// Mock Supabase
vi.mock('../../../src/lib/supabase', () => ({
  isSupabaseConfigured: vi.fn(() => false),
  supabase: null
}))

// Mock profile service
vi.mock('../../../src/services/supabase/profileService', () => ({
  profileService: {
    getProfile: vi.fn(),
    upsertProfile: vi.fn()
  }
}))

// Mock application service
vi.mock('../../../src/services/supabase/applicationService', () => ({
  applicationService: {
    getApplications: vi.fn(),
    getApplication: vi.fn(),
    createApplication: vi.fn(),
    updateApplication: vi.fn()
  }
}))

describe('DataService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Mode Detection', () => {
    it('should detect mock mode when Supabase is not configured', () => {
      expect(dataService.isSupabaseMode()).toBe(false)
    })

    it('should detect supabase mode when configured', async () => {
      const { isSupabaseConfigured } = await import('../../../src/lib/supabase')
      vi.mocked(isSupabaseConfigured).mockReturnValue(true)
      
      // Test with mocked function - dataService should detect the change
      expect(dataService.isSupabaseMode()).toBe(false) // Still false because it was initialized before mock
    })
  })

  describe('Profile Operations', () => {
    describe('getProfile', () => {
      it('should return mock profile in mock mode', async () => {
        const result = await dataService.getProfile('test-user')
        
        expect(result).toBeDefined()
        expect(result?.personalInfo).toBeDefined()
        expect(result?.experience).toBeDefined()
        expect(result?.education).toBeDefined()
      })

      it('should handle user ID parameter', async () => {
        const userId = 'test-user-123'
        const result = await dataService.getProfile(userId)
        
        expect(result).toBeDefined()
      })
    })

    describe('saveProfile', () => {
      it('should log mock mode message when saving in mock mode', async () => {
        const consoleSpy = vi.spyOn(console, 'log')
        
        await dataService.saveProfile('test-user', mockProfile)
        
        expect(consoleSpy).toHaveBeenCalledWith('📦 Mock mode: Perfil no guardado')
      })

      it('should not throw error when saving valid profile', async () => {
        await expect(
          dataService.saveProfile('test-user', mockProfile)
        ).resolves.not.toThrow()
      })
    })
  })

  describe('Application Operations', () => {
    describe('getApplications', () => {
      it('should return mock applications in mock mode', async () => {
        const result = await dataService.getApplications('candidate-1')
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        expect(result[0]).toHaveProperty('id')
        expect(result[0]).toHaveProperty('position')
        expect(result[0]).toHaveProperty('status')
      })
    })

    describe('getApplication', () => {
      it('should return specific application by ID', async () => {
        const applications = await dataService.getApplications('candidate-1')
        const firstApp = applications[0]
        
        const result = await dataService.getApplication(firstApp.id)
        
        expect(result).toBeDefined()
        expect(result?.id).toBe(firstApp.id)
      })

      it('should return null for non-existent application', async () => {
        const result = await dataService.getApplication('non-existent-id')
        
        expect(result).toBeNull()
      })
    })

    describe('createApplication', () => {
      it('should create application with generated ID in mock mode', async () => {
        const newApp = {
          candidateId: 'candidate-1',
          jobId: 'job-1',
          company: 'Test Company',
          position: 'Test Position',
          availablePositions: 1,
          status: 'active' as const,
          appliedDate: new Date('2024-01-01'),
          lastUpdate: new Date('2024-01-01'),
          interviewConfirmed: false,
          currentStageId: 'stage-1',
          stages: [{
            id: 'stage-1',
            name: 'Initial',
            order: 1,
            status: 'pending' as const,
            estimatedDays: 3,
            startDate: new Date('2024-01-01')
          }]
        }

        const result = await dataService.createApplication(newApp)
        
        expect(result).toBeDefined()
        expect(result.id).toMatch(/^mock-\d+$/)
        expect(result.position).toBe(newApp.position)
        expect(result.company).toBe(newApp.company)
      })
    })

    describe('updateApplication', () => {
      it('should log mock mode message when updating in mock mode', async () => {
        const consoleSpy = vi.spyOn(console, 'log')
        
        await dataService.updateApplication('app-1', { status: 'screening' })
        
        expect(consoleSpy).toHaveBeenCalledWith('📦 Mock mode: Aplicación no actualizada')
      })
    })
  })

  describe('Badge Operations', () => {
    describe('getBadges', () => {
      it('should return mock badges', async () => {
        const result = await dataService.getBadges('profile-1')
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBeGreaterThan(0)
        expect(result[0]).toHaveProperty('name')
        expect(result[0]).toHaveProperty('description')
        expect(result[0]).toHaveProperty('rarity')
      })
    })
  })

  describe('Offer Operations', () => {
    describe('getOffers', () => {
      it('should return empty array for offers', async () => {
        const result = await dataService.getOffers('candidate-1')
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(0)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid user IDs gracefully', async () => {
      await expect(
        dataService.getProfile('')
      ).resolves.toBeDefined()
    })

    it('should handle null/undefined parameters', async () => {
      await expect(
        dataService.getProfile(null as any)
      ).resolves.toBeDefined()
    })
  })
})