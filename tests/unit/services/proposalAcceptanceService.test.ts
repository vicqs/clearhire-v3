import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { proposalAcceptanceService } from '../../../src/services/proposalAcceptanceService'
import type { Application } from '../../../src/types/application'
import type { AcceptanceData } from '../../../src/types/tracking'

// Mock del dataService
const mockDataService = {
  getApplications: vi.fn(),
  updateApplication: vi.fn(),
  isSupabaseMode: vi.fn(() => false)
}

vi.mock('../../../src/services/dataService', () => ({
  dataService: mockDataService
}))

describe('ProposalAcceptanceService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    proposalAcceptanceService.clearTransactionContext()
  })

  afterEach(() => {
    proposalAcceptanceService.clearTransactionContext()
  })

  describe('validateAcceptance', () => {
    it('should validate a valid proposal acceptance', async () => {
      const mockApplications: Application[] = [
        {
          id: 'app-1',
          candidateId: 'candidate-1',
          jobId: 'job-1',
          company: 'Test Company',
          position: 'Developer',
          availablePositions: 1,
          status: 'offer_pending',
          stages: [],
          currentStageId: 'stage-1',
          appliedDate: new Date(),
          lastUpdate: new Date(),
          interviewConfirmed: false,
          offerDetails: {
            offeredAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días en el futuro
            salary: 50000,
            currency: 'USD',
            benefits: ['Health Insurance']
          }
        }
      ]

      mockDataService.getApplications.mockResolvedValue(mockApplications)

      const result = await proposalAcceptanceService.validateAcceptance('app-1', 'candidate-1')

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(mockDataService.getApplications).toHaveBeenCalledWith('candidate-1')
    })

    it('should reject validation for non-existent proposal', async () => {
      mockDataService.getApplications.mockResolvedValue([])

      const result = await proposalAcceptanceService.validateAcceptance('non-existent', 'candidate-1')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('La propuesta especificada no existe o no pertenece al candidato')
    })

    it('should reject validation for expired offer', async () => {
      const mockApplications: Application[] = [
        {
          id: 'app-1',
          candidateId: 'candidate-1',
          jobId: 'job-1',
          company: 'Test Company',
          position: 'Developer',
          availablePositions: 1,
          status: 'offer_pending',
          stages: [],
          currentStageId: 'stage-1',
          appliedDate: new Date(),
          lastUpdate: new Date(),
          interviewConfirmed: false,
          offerDetails: {
            offeredAt: new Date(),
            expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expirada ayer
            salary: 50000,
            currency: 'USD',
            benefits: []
          }
        }
      ]

      mockDataService.getApplications.mockResolvedValue(mockApplications)

      const result = await proposalAcceptanceService.validateAcceptance('app-1', 'candidate-1')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('La oferta ha expirado y no puede ser aceptada')
    })

    it('should reject validation when candidate already has accepted offer', async () => {
      const mockApplications: Application[] = [
        {
          id: 'app-1',
          candidateId: 'candidate-1',
          jobId: 'job-1',
          company: 'Test Company',
          position: 'Developer',
          availablePositions: 1,
          status: 'offer_pending',
          stages: [],
          currentStageId: 'stage-1',
          appliedDate: new Date(),
          lastUpdate: new Date(),
          interviewConfirmed: false,
          offerDetails: {
            offeredAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            salary: 50000,
            currency: 'USD',
            benefits: []
          }
        },
        {
          id: 'app-2',
          candidateId: 'candidate-1',
          jobId: 'job-2',
          company: 'Other Company',
          position: 'Senior Developer',
          availablePositions: 1,
          status: 'offer_accepted', // Ya tiene una oferta aceptada
          stages: [],
          currentStageId: 'stage-2',
          appliedDate: new Date(),
          lastUpdate: new Date(),
          interviewConfirmed: false
        }
      ]

      mockDataService.getApplications.mockResolvedValue(mockApplications)

      const result = await proposalAcceptanceService.validateAcceptance('app-1', 'candidate-1')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Ya tienes una oferta aceptada. No puedes aceptar múltiples ofertas simultáneamente')
    })

    it('should include warnings for pending offers', async () => {
      const mockApplications: Application[] = [
        {
          id: 'app-1',
          candidateId: 'candidate-1',
          jobId: 'job-1',
          company: 'Test Company',
          position: 'Developer',
          availablePositions: 1,
          status: 'offer_pending',
          stages: [],
          currentStageId: 'stage-1',
          appliedDate: new Date(),
          lastUpdate: new Date(),
          interviewConfirmed: false,
          offerDetails: {
            offeredAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            salary: 50000,
            currency: 'USD',
            benefits: []
          }
        },
        {
          id: 'app-2',
          candidateId: 'candidate-1',
          jobId: 'job-2',
          company: 'Other Company',
          position: 'Senior Developer',
          availablePositions: 1,
          status: 'offer_pending', // Otra oferta pendiente
          stages: [],
          currentStageId: 'stage-2',
          appliedDate: new Date(),
          lastUpdate: new Date(),
          interviewConfirmed: false
        }
      ]

      mockDataService.getApplications.mockResolvedValue(mockApplications)

      const result = await proposalAcceptanceService.validateAcceptance('app-1', 'candidate-1')

      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Tienes 1 ofertas pendientes que serán automáticamente retiradas')
    })
  })

  describe('acceptProposal', () => {
    it('should successfully accept a valid proposal', async () => {
      const mockApplications: Application[] = [
        {
          id: 'app-1',
          candidateId: 'candidate-1',
          jobId: 'job-1',
          company: 'Test Company',
          position: 'Developer',
          availablePositions: 1,
          status: 'offer_pending',
          stages: [],
          currentStageId: 'stage-1',
          appliedDate: new Date(),
          lastUpdate: new Date(),
          interviewConfirmed: false,
          offerDetails: {
            offeredAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            salary: 50000,
            currency: 'USD',
            benefits: ['Health Insurance']
          }
        }
      ]

      const acceptanceData: AcceptanceData = {
        acceptedAt: new Date(),
        candidateNotes: 'Excited to join the team!'
      }

      mockDataService.getApplications.mockResolvedValue(mockApplications)
      mockDataService.updateApplication.mockResolvedValue(undefined)

      const result = await proposalAcceptanceService.acceptProposal('app-1', 'candidate-1', acceptanceData)

      expect(result.success).toBe(true)
      expect(result.acceptanceId).toBeDefined()
      expect(result.errors).toHaveLength(0)
      expect(mockDataService.updateApplication).toHaveBeenCalled()
    })

    it('should fail when validation fails', async () => {
      mockDataService.getApplications.mockResolvedValue([]) // No applications found

      const acceptanceData: AcceptanceData = {
        acceptedAt: new Date()
      }

      const result = await proposalAcceptanceService.acceptProposal('app-1', 'candidate-1', acceptanceData)

      expect(result.success).toBe(false)
      expect(result.errors).toContain('La propuesta especificada no existe o no pertenece al candidato')
      expect(mockDataService.updateApplication).not.toHaveBeenCalled()
    })

    it('should handle errors during transaction execution', async () => {
      const mockApplications: Application[] = [
        {
          id: 'app-1',
          candidateId: 'candidate-1',
          jobId: 'job-1',
          company: 'Test Company',
          position: 'Developer',
          availablePositions: 1,
          status: 'offer_pending',
          stages: [],
          currentStageId: 'stage-1',
          appliedDate: new Date(),
          lastUpdate: new Date(),
          interviewConfirmed: false,
          offerDetails: {
            offeredAt: new Date(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            salary: 50000,
            currency: 'USD',
            benefits: []
          }
        }
      ]

      const acceptanceData: AcceptanceData = {
        acceptedAt: new Date()
      }

      mockDataService.getApplications.mockResolvedValue(mockApplications)
      mockDataService.updateApplication.mockRejectedValue(new Error('Database error'))

      const result = await proposalAcceptanceService.acceptProposal('app-1', 'candidate-1', acceptanceData)

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Error interno: Database error')
    })
  })

  describe('validateExclusivityStatus', () => {
    it('should return correct exclusivity status for candidate with no accepted offers', async () => {
      const mockApplications: Application[] = [
        {
          id: 'app-1',
          candidateId: 'candidate-1',
          jobId: 'job-1',
          company: 'Test Company',
          position: 'Developer',
          availablePositions: 1,
          status: 'offer_pending',
          stages: [],
          currentStageId: 'stage-1',
          appliedDate: new Date(),
          lastUpdate: new Date(),
          interviewConfirmed: false
        }
      ]

      mockDataService.getApplications.mockResolvedValue(mockApplications)

      const result = await proposalAcceptanceService.validateExclusivityStatus('candidate-1')

      expect(result.canAcceptOffers).toBe(true)
      expect(result.exclusiveApplication).toBeUndefined()
      expect(result.pendingApplications).toHaveLength(1)
    })

    it('should return correct exclusivity status for candidate with accepted offer', async () => {
      const mockApplications: Application[] = [
        {
          id: 'app-1',
          candidateId: 'candidate-1',
          jobId: 'job-1',
          company: 'Test Company',
          position: 'Developer',
          availablePositions: 1,
          status: 'offer_accepted',
          stages: [],
          currentStageId: 'stage-1',
          appliedDate: new Date(),
          lastUpdate: new Date(),
          interviewConfirmed: false
        }
      ]

      mockDataService.getApplications.mockResolvedValue(mockApplications)

      const result = await proposalAcceptanceService.validateExclusivityStatus('candidate-1')

      expect(result.canAcceptOffers).toBe(false)
      expect(result.exclusiveApplication).toBeDefined()
      expect(result.exclusiveApplication?.id).toBe('app-1')
      expect(result.pendingApplications).toHaveLength(0)
    })
  })

  describe('markApplicationAsExclusive', () => {
    it('should mark application as exclusive', async () => {
      mockDataService.updateApplication.mockResolvedValue(undefined)

      await proposalAcceptanceService.markApplicationAsExclusive('app-1')

      expect(mockDataService.updateApplication).toHaveBeenCalledWith('app-1', {
        exclusivityStatus: 'exclusive',
        isExclusive: true,
        lastTrackingUpdate: expect.any(Date)
      })
    })

    it('should handle errors when marking application as exclusive', async () => {
      mockDataService.updateApplication.mockRejectedValue(new Error('Update failed'))

      await expect(proposalAcceptanceService.markApplicationAsExclusive('app-1'))
        .rejects.toThrow('Update failed')
    })
  })

  describe('transaction context management', () => {
    it('should initialize and clear transaction context', () => {
      expect(proposalAcceptanceService.getTransactionStatus()).toBeNull()
      
      proposalAcceptanceService.clearTransactionContext()
      
      expect(proposalAcceptanceService.getTransactionStatus()).toBeNull()
    })
  })
})