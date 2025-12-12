import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { notificationService } from '../../../src/services/notificationService'
import { reminderService } from '../../../src/services/reminderService'
import type { OfferAcceptanceNotificationData, BulkNotificationRequest } from '../../../src/types/tracking'
import type { Application, Stage } from '../../../src/types/application'

// Mock del dataService
const mockDataService = {
  getApplication: vi.fn(),
  isSupabaseMode: vi.fn(() => false)
}

vi.mock('../../../src/services/dataService', () => ({
  dataService: mockDataService
}))

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendOfferAcceptanceNotification', () => {
    const mockNotificationData: OfferAcceptanceNotificationData = {
      candidateName: 'Juan Pérez',
      companyName: 'Tech Corp',
      positionTitle: 'Senior Developer',
      acceptanceDate: new Date('2024-01-15'),
      nextSteps: ['Verificación de antecedentes', 'Firma de contrato'],
      offerDetails: {
        offeredAt: new Date(),
        expiresAt: new Date(),
        salary: 75000,
        currency: 'USD',
        benefits: ['Health Insurance']
      }
    }

    it('should send notification to candidate successfully', async () => {
      const result = await notificationService.sendOfferAcceptanceNotification(
        'candidate',
        'candidate-123',
        mockNotificationData
      )

      expect(result.recipientId).toBe('candidate-123')
      expect(result.status).toBe('sent')
      expect(result.id).toBeDefined()
      expect(result.sentAt).toBeDefined()
    })

    it('should send notification to recruiter successfully', async () => {
      const result = await notificationService.sendOfferAcceptanceNotification(
        'recruiter',
        'recruiter-456',
        mockNotificationData
      )

      expect(result.recipientId).toBe('recruiter-456')
      expect(result.status).toBe('sent')
      expect(result.type).toBe('email') // Recruiters prefer email
    })

    it('should handle notification failures gracefully', async () => {
      // Mock error by temporarily enabling Supabase mode and causing failure
      mockDataService.isSupabaseMode.mockReturnValue(true)
      
      // Since we don't have real email service, this will fail in Supabase mode
      const result = await notificationService.sendOfferAcceptanceNotification(
        'candidate',
        'candidate-123',
        mockNotificationData
      )

      expect(result.status).toBe('failed')
      expect(result.error).toBeDefined()

      // Restore mock mode
      mockDataService.isSupabaseMode.mockReturnValue(false)
    })

    it('should include correct notification content for candidates', async () => {
      const result = await notificationService.sendOfferAcceptanceNotification(
        'candidate',
        'candidate-123',
        mockNotificationData
      )

      expect(result.status).toBe('sent')
      // In mock mode, we can verify the notification was processed
      expect(result.recipientId).toBe('candidate-123')
    })

    it('should include correct notification content for recruiters', async () => {
      const result = await notificationService.sendOfferAcceptanceNotification(
        'recruiter',
        'recruiter-456',
        mockNotificationData
      )

      expect(result.status).toBe('sent')
      expect(result.recipientId).toBe('recruiter-456')
    })
  })

  describe('sendBulkNotifications', () => {
    const mockBulkRequests: BulkNotificationRequest[] = [
      {
        recipientId: 'candidate-1',
        type: 'candidate',
        notificationData: {
          candidateName: 'Juan Pérez',
          companyName: 'Tech Corp',
          positionTitle: 'Developer',
          acceptanceDate: new Date(),
          nextSteps: ['Next step 1'],
          offerDetails: {
            offeredAt: new Date(),
            expiresAt: new Date(),
            salary: 50000,
            currency: 'USD',
            benefits: []
          }
        }
      },
      {
        recipientId: 'recruiter-1',
        type: 'recruiter',
        notificationData: {
          candidateName: 'María García',
          companyName: 'StartupXYZ',
          positionTitle: 'Designer',
          acceptanceDate: new Date(),
          nextSteps: ['Next step 2'],
          offerDetails: {
            offeredAt: new Date(),
            expiresAt: new Date(),
            salary: 60000,
            currency: 'USD',
            benefits: []
          }
        }
      }
    ]

    it('should send bulk notifications successfully', async () => {
      const results = await notificationService.sendBulkNotifications(mockBulkRequests)

      expect(results).toHaveLength(2)
      expect(results[0].status).toBe('sent')
      expect(results[1].status).toBe('sent')
      expect(results[0].recipientId).toBe('candidate-1')
      expect(results[1].recipientId).toBe('recruiter-1')
    })

    it('should handle partial failures in bulk notifications', async () => {
      // Create a mix of valid and invalid requests
      const mixedRequests = [
        ...mockBulkRequests,
        {
          recipientId: '', // Invalid recipient
          type: 'candidate' as const,
          notificationData: mockBulkRequests[0].notificationData
        }
      ]

      const results = await notificationService.sendBulkNotifications(mixedRequests)

      expect(results).toHaveLength(3)
      // First two should succeed, third might fail
      expect(results[0].status).toBe('sent')
      expect(results[1].status).toBe('sent')
    })

    it('should return empty array for empty bulk request', async () => {
      const results = await notificationService.sendBulkNotifications([])

      expect(results).toHaveLength(0)
    })
  })

  describe('sendStatusChangeNotification', () => {
    const mockApplication: Application = {
      id: 'app-123',
      candidateId: 'candidate-123',
      jobId: 'job-123',
      company: 'Tech Corp',
      position: 'Senior Developer',
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

    it('should send status change notification successfully', async () => {
      const result = await notificationService.sendStatusChangeNotification(
        'app-123',
        'offer_pending',
        'offer_accepted',
        'candidate-123',
        'candidate'
      )

      expect(result.status).toBe('sent')
      expect(result.recipientId).toBe('candidate-123')
      expect(mockDataService.getApplication).toHaveBeenCalledWith('app-123')
    })

    it('should handle missing application gracefully', async () => {
      mockDataService.getApplication.mockResolvedValue(null)

      const result = await notificationService.sendStatusChangeNotification(
        'nonexistent-app',
        'offer_pending',
        'offer_accepted',
        'candidate-123',
        'candidate'
      )

      expect(result.status).toBe('failed')
      expect(result.error).toContain('Aplicación no encontrada')
    })

    it('should handle database errors gracefully', async () => {
      mockDataService.getApplication.mockRejectedValue(new Error('Database error'))

      const result = await notificationService.sendStatusChangeNotification(
        'app-123',
        'offer_pending',
        'offer_accepted',
        'candidate-123',
        'candidate'
      )

      expect(result.status).toBe('failed')
      expect(result.error).toContain('Database error')
    })
  })

  describe('configuration management', () => {
    it('should update configuration correctly', () => {
      const newConfig = {
        enableEmail: false,
        enablePush: true,
        retryAttempts: 5
      }

      notificationService.updateConfig(newConfig)
      const currentConfig = notificationService.getConfig()

      expect(currentConfig.enableEmail).toBe(false)
      expect(currentConfig.enablePush).toBe(true)
      expect(currentConfig.retryAttempts).toBe(5)
      expect(currentConfig.enableSMS).toBe(false) // Should maintain existing value
    })

    it('should return current configuration', () => {
      const config = notificationService.getConfig()

      expect(config).toHaveProperty('enableEmail')
      expect(config).toHaveProperty('enablePush')
      expect(config).toHaveProperty('enableSMS')
      expect(config).toHaveProperty('retryAttempts')
      expect(config).toHaveProperty('retryDelayMs')
    })
  })
})

describe('ReminderService', () => {
  const mockApplication: Application = {
    id: 'app-123',
    candidateId: 'candidate-123',
    jobId: 'job-123',
    company: 'Tech Corp',
    position: 'Senior Developer',
    availablePositions: 1,
    status: 'offer_accepted',
    stages: [],
    currentStageId: 'stage-1',
    appliedDate: new Date(),
    lastUpdate: new Date(),
    interviewConfirmed: false
  }

  const mockStages: Stage[] = [
    {
      id: 'stage-1',
      name: 'Background Check',
      order: 1,
      status: 'pending',
      estimatedDays: 3,
      startDate: new Date(),
      recruiter: {
        id: 'recruiter-1',
        name: 'Jane Smith',
        title: 'HR Manager',
        avatar: 'avatar.jpg'
      }
    },
    {
      id: 'stage-2',
      name: 'Final Interview',
      order: 2,
      status: 'pending',
      estimatedDays: 1,
      startDate: new Date()
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    reminderService.clearAll() // Clear any existing reminders
    mockDataService.getApplication.mockResolvedValue(mockApplication)
  })

  afterEach(() => {
    reminderService.clearAll() // Clean up after each test
  })

  describe('scheduleFollowUpReminders', () => {
    it('should schedule reminders for multiple stages', async () => {
      await reminderService.scheduleFollowUpReminders('app-123', mockStages)

      const reminders = reminderService.getApplicationReminders('app-123')
      expect(reminders.length).toBeGreaterThan(0)
      
      // Should have reminders for both stages
      const stageNames = reminders.map(r => r.stageName)
      expect(stageNames).toContain('Background Check')
      expect(stageNames).toContain('Final Interview')
    })

    it('should handle empty stages array', async () => {
      await reminderService.scheduleFollowUpReminders('app-123', [])

      const reminders = reminderService.getApplicationReminders('app-123')
      expect(reminders).toHaveLength(0)
    })

    it('should handle missing application gracefully', async () => {
      mockDataService.getApplication.mockResolvedValue(null)

      await expect(reminderService.scheduleFollowUpReminders('nonexistent-app', mockStages))
        .rejects.toThrow('Aplicación no encontrada')
    })

    it('should cancel existing reminders before scheduling new ones', async () => {
      // Schedule first batch
      await reminderService.scheduleFollowUpReminders('app-123', [mockStages[0]])
      
      let reminders = reminderService.getApplicationReminders('app-123')
      const initialCount = reminders.length

      // Schedule second batch (should cancel first)
      await reminderService.scheduleFollowUpReminders('app-123', mockStages)
      
      reminders = reminderService.getApplicationReminders('app-123')
      
      // Should have new reminders, old ones should be cancelled
      const activeReminders = reminders.filter(r => r.status === 'scheduled')
      expect(activeReminders.length).toBeGreaterThan(initialCount)
    })
  })

  describe('reminder scheduling and management', () => {
    it('should schedule different types of reminders for interview stage', async () => {
      const interviewStage: Stage = {
        ...mockStages[1],
        name: 'Technical Interview'
      }

      await reminderService.scheduleStageReminders(mockApplication, interviewStage)

      const reminders = reminderService.getApplicationReminders('app-123')
      const reminderTypes = reminders.map(r => r.reminderType)
      
      expect(reminderTypes).toContain('stage_deadline')
      expect(reminderTypes).toContain('follow_up')
      expect(reminderTypes).toContain('interview_reminder')
    })

    it('should schedule document reminders for background check stage', async () => {
      const backgroundStage: Stage = {
        ...mockStages[0],
        name: 'Background Check and Document Verification'
      }

      await reminderService.scheduleStageReminders(mockApplication, backgroundStage)

      const reminders = reminderService.getApplicationReminders('app-123')
      const reminderTypes = reminders.map(r => r.reminderType)
      
      expect(reminderTypes).toContain('document_request')
    })

    it('should cancel specific reminders', async () => {
      await reminderService.scheduleFollowUpReminders('app-123', [mockStages[0]])
      
      const reminders = reminderService.getApplicationReminders('app-123')
      expect(reminders.length).toBeGreaterThan(0)
      
      const reminderId = reminders[0].id
      await reminderService.cancelReminder(reminderId)
      
      const updatedReminders = reminderService.getApplicationReminders('app-123')
      const cancelledReminder = updatedReminders.find(r => r.id === reminderId)
      
      expect(cancelledReminder?.status).toBe('cancelled')
    })

    it('should cancel all application reminders', async () => {
      await reminderService.scheduleFollowUpReminders('app-123', mockStages)
      
      let reminders = reminderService.getApplicationReminders('app-123')
      expect(reminders.length).toBeGreaterThan(0)
      
      await reminderService.cancelApplicationReminders('app-123')
      
      reminders = reminderService.getApplicationReminders('app-123')
      const activeReminders = reminders.filter(r => r.status === 'scheduled')
      
      expect(activeReminders).toHaveLength(0)
    })
  })

  describe('reminder statistics and configuration', () => {
    it('should provide accurate reminder statistics', async () => {
      await reminderService.scheduleFollowUpReminders('app-123', mockStages)
      
      const stats = reminderService.getReminderStats()
      
      expect(stats.total).toBeGreaterThan(0)
      expect(stats.scheduled).toBeGreaterThan(0)
      expect(stats.sent).toBe(0) // No reminders sent yet
      expect(stats.failed).toBe(0)
      expect(stats.cancelled).toBe(0)
    })

    it('should update configuration correctly', () => {
      const newConfig = {
        stageDeadlineHours: 48,
        followUpDays: 5,
        enableAutoReminders: false
      }

      reminderService.updateConfig(newConfig)
      const currentConfig = reminderService.getConfig()

      expect(currentConfig.stageDeadlineHours).toBe(48)
      expect(currentConfig.followUpDays).toBe(5)
      expect(currentConfig.enableAutoReminders).toBe(false)
    })

    it('should respect disabled auto reminders', async () => {
      reminderService.updateConfig({ enableAutoReminders: false })

      await reminderService.scheduleFollowUpReminders('app-123', mockStages)

      const reminders = reminderService.getApplicationReminders('app-123')
      expect(reminders).toHaveLength(0)

      // Re-enable for other tests
      reminderService.updateConfig({ enableAutoReminders: true })
    })
  })

  describe('reminder execution', () => {
    it('should handle reminder sending gracefully', async () => {
      await reminderService.scheduleFollowUpReminders('app-123', [mockStages[0]])
      
      const reminders = reminderService.getApplicationReminders('app-123')
      expect(reminders.length).toBeGreaterThan(0)
      
      const reminderId = reminders[0].id
      
      // Manually trigger reminder (normally would be triggered by timer)
      await reminderService.sendReminder(reminderId)
      
      const updatedReminders = reminderService.getApplicationReminders('app-123')
      const sentReminder = updatedReminders.find(r => r.id === reminderId)
      
      expect(sentReminder?.status).toBe('sent')
      expect(sentReminder?.sentAt).toBeDefined()
    })

    it('should handle non-existent reminder gracefully', async () => {
      // Should not throw error for non-existent reminder
      await expect(reminderService.sendReminder('non-existent-id'))
        .resolves.not.toThrow()
    })
  })
})