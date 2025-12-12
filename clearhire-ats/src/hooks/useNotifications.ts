import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import type { Notification, NotificationPreferences } from '../types/notifications';
import type { ApplicationStatus } from '../types/application';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  analytics: any;
  sendStatusChangeNotification: (
    candidateId: string,
    applicationId: string,
    oldStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
    metadata: {
      positionTitle: string;
      companyName: string;
      candidateName: string;
      recruiterName?: string;
    }
  ) => Promise<void>;
  scheduleInterviewReminder: (
    applicationId: string,
    interviewDate: Date,
    metadata: {
      candidateName: string;
      positionTitle: string;
      companyName: string;
      recruiterName: string;
      interviewMode: string;
    }
  ) => void;
  sendDeadlineAlert: (
    applicationId: string,
    type: 'interview_confirmation' | 'document_upload',
    deadline: Date,
    metadata: any
  ) => Promise<void>;
  sendFeedbackNotification: (
    applicationId: string,
    metadata: {
      candidateName: string;
      positionTitle: string;
      companyName: string;
    }
  ) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  refreshNotifications: () => void;
  clearAllNotifications: () => void;
}

export const useNotifications = (candidateId: string): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [analytics, setAnalytics] = useState<any>({});
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences(candidateId)
  );

  // Cargar notificaciones
  const refreshNotifications = useCallback(() => {
    const history = notificationService.getNotificationHistory(candidateId);
    const unread = notificationService.getUnreadCount(candidateId);
    const analyticsData = notificationService.getAnalytics(candidateId);
    
    setNotifications(history);
    setUnreadCount(unread);
    setAnalytics(analyticsData);
  }, [candidateId]);

  // Efecto para cargar datos iniciales y configurar listeners
  useEffect(() => {
    refreshNotifications();
    
    // Configurar listeners para eventos en tiempo real
    const handleNotificationSent = (notification: Notification) => {
      if (notification.candidateId === candidateId) {
        refreshNotifications();
      }
    };

    const handleNotificationRead = (notification: Notification) => {
      if (notification.candidateId === candidateId) {
        refreshNotifications();
      }
    };

    notificationService.addEventListener('notification_sent', handleNotificationSent);
    notificationService.addEventListener('notification_read', handleNotificationRead);
    
    // Actualizar cada 30 segundos para reflejar cambios de estado
    const interval = setInterval(refreshNotifications, 30000);
    
    return () => {
      clearInterval(interval);
      notificationService.removeEventListener('notification_sent', handleNotificationSent);
      notificationService.removeEventListener('notification_read', handleNotificationRead);
    };
  }, [refreshNotifications, candidateId]);

  // Enviar notificación de cambio de estado
  const sendStatusChangeNotification = useCallback(async (
    candidateId: string,
    applicationId: string,
    oldStatus: ApplicationStatus,
    newStatus: ApplicationStatus,
    metadata: {
      positionTitle: string;
      companyName: string;
      candidateName: string;
      recruiterName?: string;
    }
  ) => {
    try {
      await notificationService.detectStatusChange(
        candidateId,
        applicationId,
        oldStatus,
        newStatus,
        metadata
      );
      
      // Actualizar estado local después de enviar
      setTimeout(refreshNotifications, 1000);
      
      // Mostrar toast de confirmación
      console.log(`📱 Notificación enviada: ${oldStatus} → ${newStatus}`);
    } catch (error) {
      console.error('Error sending status change notification:', error);
    }
  }, [refreshNotifications]);

  // Marcar como leída
  const markAsRead = useCallback((notificationId: string) => {
    notificationService.markAsRead(notificationId);
    refreshNotifications();
  }, [refreshNotifications]);

  // Programar recordatorio de entrevista
  const scheduleInterviewReminder = useCallback((
    applicationId: string,
    interviewDate: Date,
    metadata: {
      candidateName: string;
      positionTitle: string;
      companyName: string;
      recruiterName: string;
      interviewMode: string;
    }
  ) => {
    notificationService.scheduleInterviewReminder(
      candidateId,
      applicationId,
      interviewDate,
      metadata
    );
  }, [candidateId]);

  // Enviar alerta de deadline
  const sendDeadlineAlert = useCallback(async (
    applicationId: string,
    type: 'interview_confirmation' | 'document_upload',
    deadline: Date,
    metadata: any
  ) => {
    await notificationService.sendDeadlineAlert(
      candidateId,
      applicationId,
      type,
      deadline,
      metadata
    );
    setTimeout(refreshNotifications, 1000);
  }, [candidateId, refreshNotifications]);

  // Enviar notificación de feedback
  const sendFeedbackNotification = useCallback(async (
    applicationId: string,
    metadata: {
      candidateName: string;
      positionTitle: string;
      companyName: string;
    }
  ) => {
    await notificationService.sendFeedbackNotification(
      candidateId,
      applicationId,
      metadata
    );
    setTimeout(refreshNotifications, 1000);
  }, [candidateId, refreshNotifications]);

  // Actualizar preferencias
  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    notificationService.updatePreferences(candidateId, updates);
    const updatedPrefs = notificationService.getPreferences(candidateId);
    setPreferences(updatedPrefs);
  }, [candidateId]);

  // Limpiar todas las notificaciones
  const clearAllNotifications = useCallback(() => {
    // Marcar todas como leídas
    notifications
      .filter(n => n.status !== 'read')
      .forEach(n => notificationService.markAsRead(n.id));
    refreshNotifications();
  }, [notifications, refreshNotifications]);

  return {
    notifications,
    unreadCount,
    preferences,
    analytics,
    sendStatusChangeNotification,
    scheduleInterviewReminder,
    sendDeadlineAlert,
    sendFeedbackNotification,
    markAsRead,
    updatePreferences,
    refreshNotifications,
    clearAllNotifications
  };
};