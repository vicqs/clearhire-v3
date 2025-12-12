import { describe, it, expect, vi, beforeEach } from 'vitest'
import { applicationService } from '../../../src/services/supabase/applicationService'
import { trackingHistoryService } from '../../../src/services/trackingHistoryService'
import type { OfferDetails } from '../../../src/types/application'
import type { TrackingEvent } from '../../../src/types/tracking'

// Mock de Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    insert: vi.fn(() => Promise.resolve({ error: null })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        neq: vi.fn(() => ({
          in: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }))
}

vi.mock('../../../src/lib/supabase', () => ({
  supabase: mockSupabase,
  isSupabaseConfigured: vi.fn(() => false) // Usar modo mock por defecto
}))

describe('ApplicationTrackingService Extensions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('processOfferAcceptance', () => {
    it('should process offer acceptance in mock mode', async () => {
      const applicationId = 'app-1'
      const offerDetails: OfferDetails = {
        offeredAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        salary: 75000,
        currency: 'USD',
        benefits: ['Health Insurance', 'Dental'],
        acceptedAt: new Date()
      }

      // En modo mock, no debería lanzar errores
      await expect(applicationService.processOfferAcceptance(applicationId, offerDetails))
        .resolves.not.toThrow()
    })

    it('should handle errors gracefully', async () => {
      const applicationId = 'app-1'
      const offerDetails: OfferDetails = {
        offeredAt: new Date(),
        expiresAt: new Date(),
        salary: 50000,
        currency: 'USD',
        benefits: []
      }

      // Mock error en Supabase
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: new Error('Database error') })) })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => ({
              in: vi.fn(() => Promise.resolve({ data: [], error: null }))
            })),
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      } as any)

      // Temporalmente habilitar Supabase para probar manejo de errores
      const { isSupabaseConfigured } = await import('../../../src/lib/supabase')
      vi.mocked(isSupabaseConfigured).mockReturnValue(true)

      await expect(applicationService.processOfferAcceptance(applicationId, offerDetails))
        .rejects.toThrow('Database error')

      // Restaurar modo mock
      vi.mocked(isSupabaseConfigured).mockReturnValue(false)
    })
  })

  describe('withdrawOtherApplications', () => {
    it('should withdraw other applications in mock mode', async () => {
      const candidateId = 'candidate-1'
      const excludeApplicationId = 'app-1'

      // En modo mock, no debería lanzar errores
      await expect(applicationService.withdrawOtherApplications(candidateId, excludeApplicationId))
        .resolves.not.toThrow()
    })

    it('should handle case with no applications to withdraw', async () => {
      const candidateId = 'candidate-1'
      const excludeApplicationId = 'app-1'

      // Mock respuesta vacía
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => ({
              in: vi.fn(() => Promise.resolve({ data: [], error: null }))
            }))
          }))
        }))
      } as any)

      // Temporalmente habilitar Supabase
      const { isSupabaseConfigured } = await import('../../../src/lib/supabase')
      vi.mocked(isSupabaseConfigured).mockReturnValue(true)

      await expect(applicationService.withdrawOtherApplications(candidateId, excludeApplicationId))
        .resolves.not.toThrow()

      // Restaurar modo mock
      vi.mocked(isSupabaseConfigured).mockReturnValue(false)
    })

    it('should withdraw multiple applications', async () => {
      const candidateId = 'candidate-1'
      const excludeApplicationId = 'app-1'

      const mockApplicationsToWithdraw = [
        { id: 'app-2', company: 'Company A', position: 'Developer', status: 'offer_pending' },
        { id: 'app-3', company: 'Company B', position: 'Senior Dev', status: 'interview_scheduled' }
      ]

      // Mock respuesta con aplicaciones para retirar
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn(() => ({ 
          eq: vi.fn(() => ({ 
            neq: vi.fn(() => ({ 
              in: vi.fn(() => Promise.resolve({ error: null })) 
            })) 
          })) 
        })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            neq: vi.fn(() => ({
              in: vi.fn(() => Promise.resolve({ data: mockApplicationsToWithdraw, error: null }))
            }))
          }))
        }))
      } as any)

      // Temporalmente habilitar Supabase
      const { isSupabaseConfigured } = await import('../../../src/lib/supabase')
      vi.mocked(isSupabaseConfigured).mockReturnValue(true)

      await expect(applicationService.withdrawOtherApplications(candidateId, excludeApplicationId))
        .resolves.not.toThrow()

      // Restaurar modo mock
      vi.mocked(isSupabaseConfigured).mockReturnValue(false)
    })
  })

  describe('createTrackingEntry', () => {
    it('should create tracking entry in mock mode', async () => {
      const applicationId = 'app-1'
      const trackingEvent: TrackingEvent = {
        id: 'tracking-1',
        applicationId,
        eventType: 'offer_accepted',
        timestamp: new Date(),
        details: { salary: 50000 },
        triggeredBy: 'user'
      }

      // En modo mock, no debería lanzar errores
      await expect(applicationService.createTrackingEntry(applicationId, trackingEvent))
        .resolves.not.toThrow()
    })

    it('should handle database errors when creating tracking entry', async () => {
      const applicationId = 'app-1'
      const trackingEvent: TrackingEvent = {
        id: 'tracking-1',
        applicationId,
        eventType: 'offer_accepted',
        timestamp: new Date(),
        details: { salary: 50000 },
        triggeredBy: 'user'
      }

      // Mock error en insert
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
        insert: vi.fn(() => Promise.resolve({ error: new Error('Insert failed') })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      } as any)

      // Temporalmente habilitar Supabase
      const { isSupabaseConfigured } = await import('../../../src/lib/supabase')
      vi.mocked(isSupabaseConfigured).mockReturnValue(true)

      await expect(applicationService.createTrackingEntry(applicationId, trackingEvent))
        .rejects.toThrow('Insert failed')

      // Restaurar modo mock
      vi.mocked(isSupabaseConfigured).mockReturnValue(false)
    })
  })

  describe('getTrackingHistory', () => {
    it('should return mock tracking history in mock mode', async () => {
      const applicationId = 'app-1'

      const result = await applicationService.getTrackingHistory(applicationId)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'mock-event-1',
        applicationId,
        eventType: 'offer_accepted',
        triggeredBy: 'user'
      })
    })

    it('should return tracking history from database', async () => {
      const applicationId = 'app-1'
      const mockEvents = [
        {
          id: 'event-1',
          application_id: applicationId,
          event_type: 'offer_accepted',
          timestamp: new Date().toISOString(),
          details: { salary: 50000 },
          triggered_by: 'user',
          metadata: {}
        }
      ]

      // Mock respuesta de base de datos
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockEvents, error: null }))
          }))
        }))
      } as any)

      // Temporalmente habilitar Supabase
      const { isSupabaseConfigured } = await import('../../../src/lib/supabase')
      vi.mocked(isSupabaseConfigured).mockReturnValue(true)

      const result = await applicationService.getTrackingHistory(applicationId)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: 'event-1',
        applicationId,
        eventType: 'offer_accepted',
        triggeredBy: 'user'
      })

      // Restaurar modo mock
      vi.mocked(isSupabaseConfigured).mockReturnValue(false)
    })

    it('should handle database errors when fetching history', async () => {
      const applicationId = 'app-1'

      // Mock error en select
      vi.mocked(mockSupabase.from).mockReturnValue({
        update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
        insert: vi.fn(() => Promise.resolve({ error: null })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error: new Error('Select failed') }))
          }))
        }))
      } as any)

      // Temporalmente habilitar Supabase
      const { isSupabaseConfigured } = await import('../../../src/lib/supabase')
      vi.mocked(isSupabaseConfigured).mockReturnValue(true)

      const result = await applicationService.getTrackingHistory(applicationId)

      // Debería retornar array vacío en caso de error
      expect(result).toEqual([])

      // Restaurar modo mock
      vi.mocked(isSupabaseConfigured).mockReturnValue(false)
    })
  })
})

describe('TrackingHistoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getTrackingHistory with filters', () => {
    it('should return filtered tracking history', async () => {
      const applicationId = 'app-1'
      const filters = {
        eventTypes: ['offer_accepted'],
        limit: 10
      }

      const result = await trackingHistoryService.getTrackingHistory(applicationId, filters)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })

    it('should apply date filters correctly', async () => {
      const applicationId = 'app-1'
      const dateFrom = new Date('2024-01-01')
      const dateTo = new Date('2024-12-31')
      
      const filters = {
        dateFrom,
        dateTo,
        triggeredBy: 'user' as const
      }

      const result = await trackingHistoryService.getTrackingHistory(applicationId, filters)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getTrackingStats', () => {
    it('should return tracking statistics', async () => {
      const applicationId = 'app-1'

      const result = await trackingHistoryService.getTrackingStats(applicationId)

      expect(result).toMatchObject({
        totalEvents: expect.any(Number),
        eventsByType: expect.any(Object),
        averageProcessingTime: expect.any(Number),
        timelineData: expect.any(Array)
      })
    })
  })

  describe('getCandidateTrackingHistory', () => {
    it('should return complete candidate tracking history', async () => {
      const candidateId = 'candidate-1'

      const result = await trackingHistoryService.getCandidateTrackingHistory(candidateId)

      expect(result).toMatchObject({
        applications: expect.any(Array),
        allEvents: expect.any(Array),
        stats: expect.any(Object)
      })
    })
  })

  describe('searchTrackingEvents', () => {
    it('should search events by term', async () => {
      const applicationId = 'app-1'
      const searchTerm = 'offer'

      const result = await trackingHistoryService.searchTrackingEvents(applicationId, searchTerm)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('exportTrackingHistory', () => {
    it('should export tracking history as JSON', async () => {
      const applicationId = 'app-1'

      const result = await trackingHistoryService.exportTrackingHistory(applicationId)

      expect(typeof result).toBe('string')
      expect(() => JSON.parse(result)).not.toThrow()
      
      const parsed = JSON.parse(result)
      expect(parsed).toHaveProperty('application')
      expect(parsed).toHaveProperty('events')
      expect(parsed).toHaveProperty('exportedAt')
      expect(parsed).toHaveProperty('totalEvents')
    })
  })
})