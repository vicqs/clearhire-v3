// Notification System Types

export type NotificationType = 
  | 'status_change'
  | 'interview_reminder'
  | 'deadline_alert'
  | 'feedback_available'
  | 'document_request';

export type NotificationPriority = 'high' | 'medium' | 'low';

export type NotificationStatus = 
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'cancelled';

export type DeliveryChannel = 'whatsapp' | 'email' | 'push';

export interface Notification {
  id: string;
  candidateId: string;
  applicationId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  channels: DeliveryChannel[];
  status: NotificationStatus;
  scheduledAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  retryCount: number;
  maxRetries: number;
  metadata: {
    previousStatus?: string;
    newStatus?: string;
    stageName?: string;
    recruiterName?: string;
    companyName?: string;
    positionTitle?: string;
    deadlineType?: string;
    deadline?: string;
    reminderType?: string;
    interviewDate?: string;
    [key: string]: any; // Para permitir campos adicionales
  };
}

export interface NotificationPreferences {
  candidateId: string;
  channels: {
    whatsapp: ChannelPreference;
    email: ChannelPreference;
    push: ChannelPreference;
  };
  types: {
    statusChanges: boolean;
    interviewReminders: boolean;
    deadlineAlerts: boolean;
    feedbackAvailable: boolean;
    promotional: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
    timezone: string;
  };
  frequency: 'immediate' | 'daily_digest' | 'weekly_summary';
  language: 'es' | 'pt' | 'en';
}

export interface ChannelPreference {
  enabled: boolean;
  verified: boolean;
  address: string; // phone, email, device token
  priority: number; // 1-3, lower = higher priority
}

export interface MessageTemplate {
  id: string;
  type: NotificationType;
  statusChange?: {
    from: string;
    to: string;
  };
  language: string;
  channel: DeliveryChannel;
  subject?: string; // Para email
  title: string;
  body: string;
  variables: string[]; // Variables que se pueden reemplazar
}

export interface DeliveryResult {
  success: boolean;
  messageId?: string;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  deliveredAt: Date;
  metadata: {
    channel: DeliveryChannel;
    provider: string;
    retryAttempt: number;
  };
}