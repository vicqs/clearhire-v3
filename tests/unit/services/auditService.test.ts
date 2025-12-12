import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { auditService } from '../../../src/services/auditService'
import { dataValidationService } from '../../../src/services/dataValidationService'
import type { OfferAcceptanceAudit, AcceptanceData } from '../../../src/types/tracking'
import type { Application } from '../../../src/types/application'

// Mock del dataService
const mockDataService = {
  getApplication: vi.fn(),
  isSupabaseMode: vi.fn(() => false)
}

// Mock del applicationService
const mockApplicationService = {
  createTrackingEntry: vi.fn()
}

vi.mock('../../../src/services/dataService', () => ({
  dataService: mockDataService
}))

vi.mock('../../../src/services/supabase/applicationService', () => ({
  applicationService: mockApplicationService
}))

describe('AuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    auditService.clearAll()
  })

  afterEach(() => {
    auditService.clearAll()
  })

  describe('logOfferAcceptance', () => {
    const mockAuditData: OfferAcceptanceAudit = {
      acceptanceId: 'acceptance-123',
      candidateId: 'candidate-123',
      applicationId: 'app-123',
      offerId: 'offer-123',
      acceptedTerms: {
        offeredAt: new Date(),
        expiresAt: new Date(),
        salary: 75000,
        currency: 'USD',
        benefits: ['Health Insurance']
      },
      timestamp: new Date(),
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 Test Browser'
    }

    it('should log offer acceptance audit successfully', async () => {
      mockApplicationService.createTrackingEntry.mockResolvedValue(undefined)

      await auditService.logOfferAcceptance(mockAuditData)

      // Verify tracking entry was created
      expect(mockApplicationService.createTrackingEntry).toHaveBeenCalledWith(
        mockAuditData.applicationId,
        expect.objectContaining({
          eventType: 'offer_accepted',
          details: expect.objectContaining({
            acceptanceId: mockAuditData.acceptanceId
          })
        })
      )
    })

    it('should handle errors during audit logging', async () => {
      mockApplicationService.createTrackingEntry.mockRejectedValue(new Error('Tracking failed'))

      await expect(auditService.logOfferAcceptance(mockAuditData))
        .rejects.toThrow('Tracking failed')
    })

    it('should skip logging when audit is disabled', async () => {
      auditService.updateConfig({ enableAuditLogging: false })

      await auditService.logOfferAcceptance(mockAuditData)

      expect(mockApplicationService.createTrackingEntry).not.toHaveBeenCalled()

      // Re-enable for other tests
      auditService.updateConfig({ enableAuditLogging: true })
    })

    it('should include all required audit data', async () => {
      mockApplicationService.createTrackingEntry.mockResolvedValue(undefined)

      await auditService.logOfferAcceptance(mockAuditData)

      const auditTrail = await auditService.getAuditTrail(mockAuditData.applicationId)
      
      expect(auditTrail).toHaveLength(1)
      expect(auditTrail[0]).toMatchObject({
        eventType: 'offer_accepted',
        applicationId: mockAuditData.applicationId,
        details: expect.objectContaining({
          acceptanceId: mockAuditData.acceptanceId,
          candidateId: mockAuditData.candidateId,
          ipAddress: mockAuditData.ipAddress,
          userAgent: mockAuditData.userAgent
        })
      })
    })
  })

  describe('logStateChange', () => {
    it('should log state change successfully', async () => {
      mockApplicationService.createTrackingEntry.mockResolvedValue(undefined)

      await auditService.logStateChange(
        'app-123',
        'offer_pending',
        'offer_accepted',
        'Candidato aceptó la oferta'
      )

      expect(mockApplicationService.createTrackingEntry).toHaveBeenCalledWith(
        'app-123',
        expect.objectContaining({
          eventType: 'status_changed',
          details: expect.objectContaining({
            fromState: 'offer_pending',
            toState: 'offer_accepted'
          })
        })
      )
    })

    it('should include reason in state change log', async () => {
      mockApplicationService.createTrackingEntry.mockResolvedValue(undefined)
      const reason = 'Candidato aceptó la oferta'

      await auditService.logStateChange('app-123', 'offer_pending', 'offer_accepted', reason)

      const auditTrail = await auditService.getAuditTrail('app-123')
      
      expect(auditTrail).toHaveLength(1)
      expect(auditTrail[0].reason).toBe(reason)
      expect(auditTrail[0].details.reason).toBe(reason)
    })

    it('should handle errors during state change logging', async () => {
      mockApplicationService.createTrackingEntry.mockRejectedValue(new Error('State change failed'))

      await expect(auditService.logStateChange('app-123', 'pending', 'accepted', 'test'))
        .rejects.toThrow('State change failed')
    })
  })

  describe('getAuditTrail', () => {
    beforeEach(async () => {
      // Setup some audit entries
      mockApplicationService.createTrackingEntry.mockResolvedValue(undefined)
      
      await auditService.logStateChange('app-123', 'active', 'screening', 'Process started')
      await auditService.logStateChange('app-123', 'screening', 'offer_pending', 'Screening passed')
    })

    it('should return audit trail for application', async () => {
      const auditTrail = await auditService.getAuditTrail('app-123')

      expect(auditTrail).toHaveLength(2)
      expect(auditTrail[0].applicationId).toBe('app-123')
      expect(auditTrail[1].applicationId).toBe('app-123')
      
      // Should be sorted by timestamp (newest first)
      expect(auditTrail[0].timestamp.getTime()).toBeGreaterThanOrEqual(auditTrail[1].timestamp.getTime())
    })

    it('should return empty array for non-existent application', async () => {
      const auditTrail = await auditService.getAuditTrail('non-existent')

      expect(auditTrail).toHaveLength(0)
    })

    it('should handle errors gracefully', async () => {
      // Mock error in data service
      const originalIsSupabaseMode = mockDataService.isSupabaseMode
      mockDataService.isSupabaseMode.mockImplementation(() => {
        throw new Error('Database error')
      })

      const auditTrail = await auditService.getAuditTrail('app-123')

      expect(auditTrail).toEqual([])

      // Restore original mock
      mockDataService.isSupabaseMode = originalIsSupabaseMode
    })
  })

  describe('searchAuditEntries', () => {
    beforeEach(async () => {
      mockApplicationService.createTrackingEntry.mockResolvedValue(undefined)
      
      // Create entries with different characteristics
      await auditService.logStateChange('app-1', 'active', 'screening', 'Started screening')
      await auditService.logOfferAcceptance({
        acceptanceId: 'acc-1',
        candidateId: 'candidate-1',
        applicationId: 'app-1',
        offerId: 'offer-1',
        acceptedTerms: {
          offeredAt: new Date(),
          expiresAt: new Date(),
          salary: 50000,
          currency: 'USD',
          benefits: []
        },
        timestamp: new Date(),
        ipAddress: '127.0.0.1'
      })
      await auditService.logStateChange('app-2', 'screening', 'interview', 'Interview scheduled')
    })

    it('should search by application ID', async () => {
      const results = await auditService.searchAuditEntries({ applicationId: 'app-1' })

      expect(results).toHaveLength(2)
      expect(results.every(entry => entry.applicationId === 'app-1')).toBe(true)
    })

    it('should search by event types', async () => {
      const results = await auditService.searchAuditEntries({ 
        eventTypes: ['offer_accepted'] 
      })

      expect(results).toHaveLength(1)
      expect(results[0].eventType).toBe('offer_accepted')
    })

    it('should apply pagination', async () => {
      const results = await auditService.searchAuditEntries({ 
        limit: 2,
        offset: 0
      })

      expect(results).toHaveLength(2)
    })

    it('should search by date range', async () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      
      const results = await auditService.searchAuditEntries({
        dateFrom: oneHourAgo,
        dateTo: now
      })

      expect(results.length).toBeGreaterThan(0)
      expect(results.every(entry => 
        entry.timestamp >= oneHourAgo && entry.timestamp <= now
      )).toBe(true)
    })
  })

  describe('getAuditSummary', () => {
    beforeEach(async () => {
      mockApplicationService.createTrackingEntry.mockResolvedValue(undefined)
      
      await auditService.logStateChange('app-123', 'active', 'screening', 'Process started')
      await auditService.logStateChange('app-123', 'screening', 'offer_pending', 'Screening passed')
      await auditService.logOfferAcceptance({
        acceptanceId: 'acc-123',
        candidateId: 'candidate-123',
        applicationId: 'app-123',
        offerId: 'offer-123',
        acceptedTerms: {
          offeredAt: new Date(),
          expiresAt: new Date(),
          salary: 60000,
          currency: 'USD',
          benefits: []
        },
        timestamp: new Date()
      })
    })

    it('should generate summary for specific application', async () => {
      const summary = await auditService.getAuditSummary('app-123')

      expect(summary.totalEntries).toBe(3)
      expect(summary.entriesByType).toHaveProperty('state_changed')
      expect(summary.entriesByType).toHaveProperty('offer_accepted')
      expect(summary.entriesByType['state_changed']).toBe(2)
      expect(summary.entriesByType['offer_accepted']).toBe(1)
    })

    it('should generate global summary when no application specified', async () => {
      const summary = await auditService.getAuditSummary()

      expect(summary.totalEntries).toBeGreaterThan(0)
      expect(summary.dateRange.earliest).toBeDefined()
      expect(summary.dateRange.latest).toBeDefined()
    })

    it('should identify critical events', async () => {
      const summary = await auditService.getAuditSummary('app-123')

      expect(summary.criticalEvents.length).toBeGreaterThan(0)
      expect(summary.criticalEvents.some(event => event.eventType === 'offer_accepted')).toBe(true)
    })

    it('should handle empty audit trail', async () => {
      const summary = await auditService.getAuditSummary('non-existent-app')

      expect(summary.totalEntries).toBe(0)
      expect(summary.entriesByType).toEqual({})
      expect(summary.dateRange.earliest).toBeNull()
      expect(summary.dateRange.latest).toBeNull()
    })
  })

  describe('exportAuditTrail', () => {
    beforeEach(async () => {
      mockApplicationService.createTrackingEntry.mockResolvedValue(undefined)
      
      await auditService.logStateChange('app-123', 'active', 'screening', 'Process started')
    })

    it('should export audit trail as JSON', async () => {
      const exportedData = await auditService.exportAuditTrail('app-123')

      expect(typeof exportedData).toBe('string')
      
      const parsed = JSON.parse(exportedData)
      expect(parsed).toHaveProperty('applicationId', 'app-123')
      expect(parsed).toHaveProperty('exportedAt')
      expect(parsed).toHaveProperty('summary')
      expect(parsed).toHaveProperty('auditTrail')
      expect(parsed).toHaveProperty('metadata')
      
      expect(Array.isArray(parsed.auditTrail)).toBe(true)
      expect(parsed.auditTrail.length).toBeGreaterThan(0)
    })

    it('should handle export errors gracefully', async () => {
      // Mock error by making getAuditTrail fail
      const originalGetAuditTrail = auditService.getAuditTrail
      auditService.getAuditTrail = vi.fn().mockRejectedValue(new Error('Export failed'))

      await expect(auditService.exportAuditTrail('app-123'))
        .rejects.toThrow('Export failed')

      // Restore original method
      auditService.getAuditTrail = originalGetAuditTrail
    })
  })

  describe('verifyAuditIntegrity', () => {
    const mockApplication: Application = {
      id: 'app-123',
      candidateId: 'candidate-123',
      jobId: 'job-123',
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

    beforeEach(() => {
      mockDataService.getApplication.mockResolvedValue(mockApplication)
    })

    it('should verify integrity successfully for consistent data', async () => {
      mockApplicationService.createTrackingEntry.mockResolvedValue(undefined)
      
      // Create consistent audit trail
      await auditService.logOfferAcceptance({
        acceptanceId: 'acc-123',
        candidateId: 'candidate-123',
        applicationId: 'app-123',
        offerId: 'offer-123',
        acceptedTerms: {
          offeredAt: new Date(),
          expiresAt: new Date(),
          salary: 50000,
          currency: 'USD',
          benefits: []
        },
        timestamp: new Date()
      })

      const result = await auditService.verifyAuditIntegrity('app-123')

      expect(result.isValid).toBe(true)
      expect(result.issues).toHaveLength(0)
      expect(result.summary.totalEntries).toBe(1)
    })

    it('should detect missing audit entries', async () => {
      // Application has offer_accepted status but no audit entry
      const result = await auditService.verifyAuditIntegrity('app-123')

      expect(result.isValid).toBe(false)
      expect(result.issues).toContain('Falta entrada de auditoría para aceptación de oferta')
      expect(result.summary.missingEntries).toBe(1)
    })

    it('should handle non-existent application', async () => {
      mockDataService.getApplication.mockResolvedValue(null)

      const result = await auditService.verifyAuditIntegrity('non-existent')

      expect(result.isValid).toBe(false)
      expect(result.issues).toContain('Aplicación no encontrada')
    })

    it('should handle verification errors gracefully', async () => {
      mockDataService.getApplication.mockRejectedValue(new Error('Database error'))

      const result = await auditService.verifyAuditIntegrity('app-123')

      expect(result.isValid).toBe(false)
      expect(result.issues[0]).toContain('Error interno: Database error')
    })
  })

  describe('configuration management', () => {
    it('should update configuration correctly', () => {
      const newConfig = {
        enableAuditLogging: false,
        retentionDays: 180,
        logLevel: 'minimal' as const
      }

      auditService.updateConfig(newConfig)
      const currentConfig = auditService.getConfig()

      expect(currentConfig.enableAuditLogging).toBe(false)
      expect(currentConfig.retentionDays).toBe(180)
      expect(currentConfig.logLevel).toBe('minimal')
    })

    it('should return current configuration', () => {
      const config = auditService.getConfig()

      expect(config).toHaveProperty('enableAuditLogging')
      expect(config).toHaveProperty('retentionDays')
      expect(config).toHaveProperty('logLevel')
      expect(config).toHaveProperty('includeMetadata')
      expect(config).toHaveProperty('enableRealTimeAlerts')
    })
  })
})

describe('DataValidationService', () => {
  const mockApplication: Application = {
    id: 'app-123',
    candidateId: 'candidate-123',
    jobId: 'job-123',
    company: 'Test Company',
    position: 'Developer',
    availablePositions: 1,
    status: 'offer_pending',
    stages: [],
    currentStageId: 'stage-1',
    appliedDate: new Date('2024-01-01'),
    lastUpdate: new Date('2024-01-02'),
    interviewConfirmed: false,
    offerDetails: {
      offeredAt: new Date('2024-01-01'),
      expiresAt: new Date('2024-01-08'),
      salary: 50000,
      currency: 'USD',
      benefits: ['Health Insurance']
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockDataService.getApplication.mockResolvedValue(mockApplication)
  })

  describe('validateProposalAcceptance', () => {
    const validAcceptanceData: AcceptanceData = {
      acceptedAt: new Date('2024-01-05'),
      candidateNotes: 'Excited to join the team!'
    }

    it('should validate valid proposal acceptance', async () => {
      const result = await dataValidationService.validateProposalAcceptance(
        'app-123',
        validAcceptanceData
      )

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject acceptance for non-existent application', async () => {
      mockDataService.getApplication.mockResolvedValue(null)

      const result = await dataValidationService.validateProposalAcceptance(
        'non-existent',
        validAcceptanceData
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'applicationId',
          code: 'APPLICATION_NOT_FOUND'
        })
      )
    })

    it('should reject acceptance without accepted date', async () => {
      const invalidData = { ...validAcceptanceData, acceptedAt: undefined as any }

      const result = await dataValidationService.validateProposalAcceptance(
        'app-123',
        invalidData
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'acceptedAt',
          code: 'REQUIRED_FIELD'
        })
      )
    })

    it('should reject future acceptance date', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      const invalidData = { ...validAcceptanceData, acceptedAt: futureDate }

      const result = await dataValidationService.validateProposalAcceptance(
        'app-123',
        invalidData
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'acceptedAt',
          code: 'INVALID_DATE'
        })
      )
    })

    it('should reject acceptance for invalid application status', async () => {
      const invalidApp = { ...mockApplication, status: 'rejected' as const }
      mockDataService.getApplication.mockResolvedValue(invalidApp)

      const result = await dataValidationService.validateProposalAcceptance(
        'app-123',
        validAcceptanceData
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'status',
          code: 'INVALID_STATUS'
        })
      )
    })

    it('should reject acceptance for expired offer', async () => {
      const expiredApp = {
        ...mockApplication,
        offerDetails: {
          ...mockApplication.offerDetails!,
          expiresAt: new Date('2024-01-01') // Expired
        }
      }
      mockDataService.getApplication.mockResolvedValue(expiredApp)

      const result = await dataValidationService.validateProposalAcceptance(
        'app-123',
        validAcceptanceData
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'offerDetails.expiresAt',
          code: 'OFFER_EXPIRED'
        })
      )
    })

    it('should warn about long candidate notes', async () => {
      const longNotesData = {
        ...validAcceptanceData,
        candidateNotes: 'A'.repeat(1001) // Too long
      }

      const result = await dataValidationService.validateProposalAcceptance(
        'app-123',
        longNotesData
      )

      expect(result.isValid).toBe(true) // Still valid, just warning
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'candidateNotes',
          code: 'FIELD_TOO_LONG'
        })
      )
    })
  })

  describe('detectInconsistencies', () => {
    it('should detect no inconsistencies for valid application', async () => {
      const inconsistencies = await dataValidationService.detectInconsistencies('app-123')

      expect(inconsistencies).toHaveLength(0)
    })

    it('should detect date inconsistencies', async () => {
      const invalidApp = {
        ...mockApplication,
        lastUpdate: new Date('2023-12-31'), // Before applied date
      }
      mockDataService.getApplication.mockResolvedValue(invalidApp)

      const inconsistencies = await dataValidationService.detectInconsistencies('app-123')

      expect(inconsistencies.length).toBeGreaterThan(0)
      expect(inconsistencies.some(i => i.includes('última actualización'))).toBe(true)
    })

    it('should handle non-existent application', async () => {
      mockDataService.getApplication.mockResolvedValue(null)

      const inconsistencies = await dataValidationService.detectInconsistencies('non-existent')

      expect(inconsistencies).toContain('Aplicación no encontrada')
    })
  })

  describe('generateIntegrityReport', () => {
    it('should generate integrity report for valid application', async () => {
      const report = await dataValidationService.generateIntegrityReport('app-123')

      expect(report.applicationId).toBe('app-123')
      expect(report.timestamp).toBeInstanceOf(Date)
      expect(report.overallStatus).toMatch(/^(valid|warnings|errors)$/)
      expect(report.validationResults).toBeDefined()
      expect(report.summary).toBeDefined()
      expect(report.recommendations).toBeDefined()
      expect(Array.isArray(report.recommendations)).toBe(true)
    })

    it('should handle missing application gracefully', async () => {
      mockDataService.getApplication.mockResolvedValue(null)

      await expect(dataValidationService.generateIntegrityReport('non-existent'))
        .rejects.toThrow('Aplicación no encontrada')
    })
  })

  describe('validateBeforePersist', () => {
    it('should validate data before persisting', async () => {
      const result = await dataValidationService.validateBeforePersist(
        mockApplication,
        'application'
      )

      expect(result).toHaveProperty('isValid')
      expect(result).toHaveProperty('errors')
      expect(result).toHaveProperty('warnings')
      expect(Array.isArray(result.errors)).toBe(true)
      expect(Array.isArray(result.warnings)).toBe(true)
    })

    it('should handle validation errors gracefully', async () => {
      // Pass invalid data that will cause validation to fail
      const invalidData = { ...mockApplication, status: 'invalid_status' as any }

      const result = await dataValidationService.validateBeforePersist(
        invalidData,
        'application'
      )

      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})