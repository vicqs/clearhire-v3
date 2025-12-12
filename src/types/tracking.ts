// Tracking & Proposal Acceptance Types

export interface TrackingEvent {
  id: string;
  applicationId: string;
  eventType: 'offer_accepted' | 'status_changed' | 'stage_completed' | 'notification_sent' | 'application_withdrawn';
  timestamp: Date;
  details: Record<string, any>;
  triggeredBy: 'system' | 'user' | 'recruiter';
  metadata?: Record<string, any>;
}

export interface AcceptanceHistoryEntry {
  id: string;
  offerId: string;
  acceptedAt: Date;
  acceptedTerms: OfferDetails;
  candidateNotes?: string;
  status: 'active' | 'superseded' | 'cancelled';
}

export interface ProcessTracking {
  id: string;
  applicationId: string;
  candidateId: string;
  companyId: string;
  currentStage: string;
  expectedCompletionDate?: Date;
  milestones: Milestone[];
  automatedReminders: Reminder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo?: string;
  dependencies?: string[];
}

export interface Reminder {
  id: string;
  type: 'email' | 'push' | 'sms';
  recipientId: string;
  scheduledFor: Date;
  message: string;
  sent: boolean;
  sentAt?: Date;
}

// Proposal Acceptance Types
export interface AcceptanceData {
  acceptedAt: Date;
  candidateNotes?: string;
  negotiatedTerms?: NegotiatedTerms;
}

export interface NegotiatedTerms {
  salary?: number;
  startDate?: Date;
  benefits?: string[];
  workingConditions?: string[];
  additionalNotes?: string;
}

export interface AcceptanceResult {
  success: boolean;
  acceptanceId: string;
  updatedApplication: Application;
  notifications: NotificationResult[];
  errors?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Notification Types
export interface NotificationResult {
  id: string;
  recipientId: string;
  type: 'email' | 'push' | 'sms';
  status: 'sent' | 'failed' | 'pending';
  sentAt?: Date;
  error?: string;
}

export interface OfferAcceptanceNotificationData {
  candidateName: string;
  companyName: string;
  positionTitle: string;
  acceptanceDate: Date;
  nextSteps: string[];
  offerDetails: OfferDetails;
}

export interface BulkNotificationRequest {
  recipientId: string;
  type: 'candidate' | 'recruiter';
  notificationData: OfferAcceptanceNotificationData;
}

// Audit Types
export interface OfferAcceptanceAudit {
  acceptanceId: string;
  candidateId: string;
  applicationId: string;
  offerId: string;
  acceptedTerms: OfferDetails;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditEntry {
  id: string;
  applicationId: string;
  eventType: 'offer_accepted' | 'state_changed' | 'data_updated' | 'error_occurred';
  timestamp: Date;
  userId?: string;
  details: Record<string, any>;
  previousState?: any;
  newState?: any;
  reason?: string;
}

// Import types from existing files
import type { Application, OfferDetails } from './application';

// Service Interfaces
export interface ProposalAcceptanceService {
  acceptProposal(proposalId: string, candidateId: string, acceptanceData: AcceptanceData): Promise<AcceptanceResult>;
  validateAcceptance(proposalId: string, candidateId: string): Promise<ValidationResult>;
  rollbackAcceptance(acceptanceId: string): Promise<void>;
}

export interface ApplicationTrackingService {
  processOfferAcceptance(applicationId: string, offerDetails: OfferDetails): Promise<void>;
  withdrawOtherApplications(candidateId: string, excludeApplicationId: string): Promise<void>;
  createTrackingEntry(applicationId: string, event: TrackingEvent): Promise<void>;
  getTrackingHistory(applicationId: string): Promise<TrackingEvent[]>;
}

export interface NotificationService {
  sendOfferAcceptanceNotification(
    recipientType: 'candidate' | 'recruiter',
    recipientId: string,
    notificationData: OfferAcceptanceNotificationData
  ): Promise<NotificationResult>;
  scheduleFollowUpReminders(applicationId: string, nextStages: any[]): Promise<void>;
  sendBulkNotifications(notifications: BulkNotificationRequest[]): Promise<NotificationResult[]>;
}

export interface AuditService {
  logOfferAcceptance(auditData: OfferAcceptanceAudit): Promise<void>;
  logStateChange(applicationId: string, fromState: string, toState: string, reason: string): Promise<void>;
  getAuditTrail(applicationId: string): Promise<AuditEntry[]>;
}

// Transaction Types
export interface TransactionStep {
  name: string;
  execute: () => Promise<void>;
  rollback: () => Promise<void>;
}

export interface TransactionContext {
  steps: TransactionStep[];
  currentStep: number;
  rollbackExecuted: boolean;
}