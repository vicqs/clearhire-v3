/**
 * Servicio de Notificaciones
 * Maneja el envío de notificaciones para aceptación de ofertas y seguimiento
 */

import { supabase } from '../lib/supabase';
import { dataService } from './dataService';
import type {
  NotificationService as INotificationService,
  NotificationResult,
  OfferAcceptanceNotificationData,
  BulkNotificationRequest
} from '../types/tracking';
import type { Application, Stage } from '../types/application';
import type { Notification } from '../types/notifications';

export interface NotificationTemplate {
  subject: string;
  body: string;
  type: 'email' | 'push' | 'sms';
}

export interface NotificationConfig {
  enableEmail: boolean;
  enablePush: boolean;
  enableSMS: boolean;
  retryAttempts: number;
  retryDelayMs: number;
}

class NotificationServiceImpl implements INotificationService {
  private config: NotificationConfig = {
    enableEmail: true,
    enablePush: true,
    enableSMS: false,
    retryAttempts: 3,
    retryDelayMs: 1000
  };

  private listeners: Record<string, Function[]> = {};

  /**
   * Envía notificación de aceptación de oferta
   */
  async sendOfferAcceptanceNotification(
    recipientType: 'candidate' | 'recruiter',
    recipientId: string,
    notificationData: OfferAcceptanceNotificationData
  ): Promise<NotificationResult> {
    console.log(`📧 Enviando notificación de aceptación a ${recipientType}: ${recipientId}`);

    try {
      const template = this.getNotificationTemplate(recipientType, 'offer_accepted', notificationData);

      // En modo Supabase, guardar la notificación en la tabla
      if (dataService.isSupabaseMode() && recipientType === 'candidate') {
        await this.createNotification({
          candidate_id: recipientId,
          title: template.subject,
          message: `Has aceptado la oferta para ${notificationData.positionTitle} en ${notificationData.companyName}. Detalles: ${notificationData.nextSteps.join(', ')}`,
          type: 'success',
          notification_type: 'status_change', // Usamos status_change como genérico para aceptación
          priority: 'high',
          channels: ['email', 'push'],
          status: 'sent',
          scheduled_at: new Date().toISOString()
        });
      }

      const result = await this.sendNotificationWithRetry(
        recipientId,
        'email', // Default to email for acceptance
        template,
        notificationData
      );

      console.log(`✅ Notificación enviada exitosamente a ${recipientType}`);
      return result;

    } catch (error) {
      console.error(`❌ Error enviando notificación a ${recipientType}:`, error);
      return {
        id: `notification-error-${Date.now()}`,
        recipientId,
        type: 'email',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Programa recordatorios automáticos para las siguientes etapas
   */
  async scheduleFollowUpReminders(applicationId: string, nextStages: Stage[]): Promise<void> {
    console.log(`⏰ Programando recordatorios para aplicación ${applicationId}`);

    try {
      const application = await dataService.getApplication(applicationId);
      if (!application) {
        throw new Error('Aplicación no encontrada');
      }

      for (const stage of nextStages) {
        await this.scheduleStageReminder(application, stage);
      }

      console.log(`✅ ${nextStages.length} recordatorios programados`);

    } catch (error) {
      console.error('❌ Error programando recordatorios:', error);
      throw error;
    }
  }

  /**
   * Envía notificaciones en lote
   */
  async sendBulkNotifications(notifications: BulkNotificationRequest[]): Promise<NotificationResult[]> {
    console.log(`📬 Enviando ${notifications.length} notificaciones en lote`);

    const results: NotificationResult[] = [];

    for (const notification of notifications) {
      try {
        const result = await this.sendOfferAcceptanceNotification(
          notification.type,
          notification.recipientId,
          notification.notificationData
        );
        results.push(result);

        // Pequeña pausa entre notificaciones para evitar rate limiting
        await this.delay(100);

      } catch (error) {
        console.error(`❌ Error en notificación lote para ${notification.recipientId}:`, error);
        results.push({
          id: `bulk-error-${Date.now()}`,
          recipientId: notification.recipientId,
          type: 'email',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Error en lote'
        });
      }
    }

    console.log(`✅ Lote completado: ${results.filter(r => r.status === 'sent').length}/${results.length} exitosas`);
    return results;
  }

  /**
   * Envía notificación de cambio de estado
   */
  async sendStatusChangeNotification(
    applicationId: string,
    fromStatus: string,
    toStatus: string,
    recipientId: string,
    recipientType: 'candidate' | 'recruiter'
  ): Promise<NotificationResult> {
    console.log(`📊 Enviando notificación de cambio de estado: ${fromStatus} → ${toStatus}`);

    try {
      const application = await dataService.getApplication(applicationId);
      if (!application) {
        throw new Error('Aplicación no encontrada');
      }

      const notificationData: OfferAcceptanceNotificationData = {
        candidateName: 'Candidato', // En implementación real, obtener del perfil
        companyName: application.company,
        positionTitle: application.position,
        acceptanceDate: new Date(),
        nextSteps: this.getNextStepsForStatus(toStatus),
        offerDetails: application.offerDetails || {} as any
      };

      const template = this.getStatusChangeTemplate(fromStatus, toStatus, notificationData);

      // Guardar en Supabase
      if (dataService.isSupabaseMode() && recipientType === 'candidate') {
        await this.createNotification({
          candidate_id: recipientId,
          application_id: applicationId,
          title: template.subject,
          message: template.body,
          type: toStatus === 'rejected' ? 'error' : toStatus === 'approved' || toStatus === 'hired' ? 'success' : 'info',
          notification_type: 'status_change',
          priority: 'high',
          channels: ['push', 'email'],
          status: 'sent',
          scheduled_at: new Date().toISOString()
        });
      }

      return await this.sendNotificationWithRetry(
        recipientId,
        this.getPreferredNotificationType(recipientType),
        template,
        notificationData
      );

    } catch (error) {
      console.error('❌ Error enviando notificación de cambio de estado:', error);
      return {
        id: `status-error-${Date.now()}`,
        recipientId,
        type: 'email',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Envía notificación con reintentos
   */
  private async sendNotificationWithRetry(
    recipientId: string,
    type: 'email' | 'push' | 'sms',
    template: NotificationTemplate,
    data: OfferAcceptanceNotificationData
  ): Promise<NotificationResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        console.log(`📤 Intento ${attempt}/${this.config.retryAttempts} - Enviando ${type} a ${recipientId}`);

        const result = await this.sendSingleNotification(recipientId, type, template, data);

        if (result.status === 'sent') {
          return result;
        }

        lastError = new Error(result.error || 'Envío falló');

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Error desconocido');
        console.warn(`⚠️ Intento ${attempt} falló:`, lastError.message);

        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelayMs * attempt);
        }
      }
    }

    // Todos los intentos fallaron
    return {
      id: `notification-failed-${Date.now()}`,
      recipientId,
      type,
      status: 'failed',
      error: lastError?.message || 'Todos los reintentos fallaron'
    };
  }

  /**
   * Envía una notificación individual
   */
  private async sendSingleNotification(
    recipientId: string,
    type: 'email' | 'push' | 'sms',
    template: NotificationTemplate,
    data: OfferAcceptanceNotificationData
  ): Promise<NotificationResult> {
    // Si no es Supabase mode, solo loguear
    if (!dataService.isSupabaseMode()) {
      // dispatch event locally for checking
      this.dispatchEvent('notification_sent', {
        id: `mock-${Date.now()}`,
        candidateId: recipientId,
        type: 'info',
        title: template.subject,
        message: template.body,
        timestamp: new Date(),
        isRead: false
      });

      return {
        id: `mock-notification-${Date.now()}`,
        recipientId,
        type,
        status: 'sent',
        sentAt: new Date()
      };
    }

    // En implementación real, aquí iría la lógica de envío
    // Por ejemplo: SendGrid para email, Firebase para push, Twilio para SMS

    switch (type) {
      case 'email':
        return await this.sendEmail(recipientId, template, data);
      case 'push':
        return await this.sendPushNotification(recipientId, template, data);
      case 'sms':
        return await this.sendSMS(recipientId, template, data);
      default:
        throw new Error(`Tipo de notificación no soportado: ${type}`);
    }
  }

  /**
   * Envía email (implementación mock)
   */
  private async sendEmail(
    recipientId: string,
    template: NotificationTemplate,
    _data: OfferAcceptanceNotificationData
  ): Promise<NotificationResult> {
    // Simular delay de envío
    await this.delay(500);

    console.log('📧 Email enviado:', {
      to: recipientId,
      subject: template.subject,
      body: template.body.substring(0, 100) + '...'
    });

    return {
      id: `email-${Date.now()}`,
      recipientId,
      type: 'email',
      status: 'sent',
      sentAt: new Date()
    };
  }

  /**
   * Envía notificación push (implementación mock)
   */
  private async sendPushNotification(
    recipientId: string,
    template: NotificationTemplate,
    _data: OfferAcceptanceNotificationData
  ): Promise<NotificationResult> {
    await this.delay(200);

    console.log('📱 Push notification enviada:', {
      to: recipientId,
      title: template.subject,
      body: template.body.substring(0, 50) + '...'
    });

    return {
      id: `push-${Date.now()}`,
      recipientId,
      type: 'push',
      status: 'sent',
      sentAt: new Date()
    };
  }

  /**
   * Envía SMS (implementación mock)
   */
  private async sendSMS(
    recipientId: string,
    template: NotificationTemplate,
    _data: OfferAcceptanceNotificationData
  ): Promise<NotificationResult> {
    await this.delay(300);

    console.log('📱 SMS enviado:', {
      to: recipientId,
      message: template.body.substring(0, 160) + '...'
    });

    return {
      id: `sms-${Date.now()}`,
      recipientId,
      type: 'sms',
      status: 'sent',
      sentAt: new Date()
    };
  }

  /**
   * Obtiene template de notificación
   */
  private getNotificationTemplate(
    recipientType: 'candidate' | 'recruiter',
    _eventType: string,
    data: OfferAcceptanceNotificationData
  ): NotificationTemplate {
    if (recipientType === 'candidate') {
      return {
        subject: `¡Felicitaciones! Oferta aceptada - ${data.positionTitle}`,
        body: `Hola ${data.candidateName},

¡Excelentes noticias! Has aceptado exitosamente la oferta laboral para el puesto de ${data.positionTitle} en ${data.companyName}.

Próximos pasos:
${data.nextSteps.map(step => `• ${step}`).join('\n')}

Fecha de aceptación: ${data.acceptanceDate.toLocaleDateString()}

¡Felicitaciones por este logro!

Saludos,
El equipo de ClearHire ATS`,
        type: 'email'
      };
    } else {
      return {
        subject: `Candidato aceptó oferta - ${data.positionTitle}`,
        body: `Hola,

El candidato ${data.candidateName} ha aceptado la oferta laboral para el puesto de ${data.positionTitle}.

Detalles de la oferta:
• Empresa: ${data.companyName}
• Posición: ${data.positionTitle}
• Fecha de aceptación: ${data.acceptanceDate.toLocaleDateString()}

Próximos pasos recomendados:
${data.nextSteps.map(step => `• ${step}`).join('\n')}

Por favor, procede con los siguientes pasos del proceso de contratación.

Saludos,
Sistema ClearHire ATS`,
        type: 'email'
      };
    }
  }

  /**
   * Obtiene template para cambio de estado
   */
  private getStatusChangeTemplate(
    fromStatus: string,
    toStatus: string,
    data: OfferAcceptanceNotificationData
  ): NotificationTemplate {
    switch (toStatus) {
      case 'screening':
        return {
          subject: `CV Recibido - ${data.positionTitle}`,
          body: `Hola ${data.candidateName}, hemos recibido tu postulación para ${data.positionTitle} en ${data.companyName} y estamos revisando tu CV. Te contactaremos pronto con novedades.\n\nSaludos,\nEquipo de Selección`,
          type: 'email'
        };
      case 'technical_evaluation':
        return {
          subject: `Avanzas a Evaluación Técnica - ${data.positionTitle}`,
          body: `¡Felicidades ${data.candidateName}! Tu perfil ha destacado y queremos invitarte a la siguiente etapa: Evaluación Técnica para el puesto de ${data.positionTitle}.\n\nRevisa tu correo para más instrucciones.\n\n¡Éxito!`,
          type: 'email'
        };
      case 'approved':
        return {
          subject: `¡Estás Aprobado! - ${data.positionTitle}`,
          body: `¡Excelentes noticias! Has aprobado todas las etapas del proceso de selección para ${data.positionTitle}. Estamos preparando tu oferta formal.\n\nPronto nos comunicaremos contigo.`,
          type: 'email'
        };
      case 'rejected':
        return {
          subject: `Actualización sobre tu proceso - ${data.positionTitle}`,
          body: `Hola ${data.candidateName},\n\nGracias por tu interés en ${data.companyName}. En esta ocasión hemos decidido avanzar con otros candidatos cuyo perfil se ajusta más a lo que buscamos en este momento.\n\nMantendremos tu CV en nuestra base de datos para futuras oportunidades.`,
          type: 'email'
        };
      default:
        return {
          subject: `Actualización de estado - ${data.positionTitle}`,
          body: `El estado de tu aplicación para ${data.positionTitle} en ${data.companyName} ha cambiado de "${fromStatus}" a "${toStatus}".\n\nPróximos pasos:\n${data.nextSteps.map(step => `• ${step}`).join('\n')}\n\nMantente atento a futuras actualizaciones.\n\nSaludos,\nEl equipo de ClearHire ATS`,
          type: 'email'
        };
    }
  }

  /**
   * Obtiene tipo de notificación preferido
   */
  private getPreferredNotificationType(recipientType: 'candidate' | 'recruiter'): 'email' | 'push' | 'sms' {
    // En implementación real, esto vendría de las preferencias del usuario
    if (recipientType === 'candidate') {
      return this.config.enablePush ? 'push' : 'email';
    } else {
      return 'email'; // Reclutadores prefieren email
    }
  }

  /**
   * Obtiene próximos pasos basados en el estado
   */
  private getNextStepsForStatus(status: string): string[] {
    const nextSteps: Record<string, string[]> = {
      'offer_accepted': [
        'Verificación de antecedentes',
        'Preparación de documentos de contratación',
        'Coordinación de fecha de inicio'
      ],
      'approved': [
        'Firma de contrato',
        'Onboarding y orientación',
        'Configuración de accesos y herramientas'
      ],
      'background_check': [
        'Completar verificación de referencias',
        'Revisión de documentos legales',
        'Aprobación final'
      ]
    };

    return nextSteps[status] || ['Continuar con el proceso según indicaciones del reclutador'];
  }

  /**
   * Programa recordatorio para una etapa específica
   */
  private async scheduleStageReminder(application: Application, stage: Stage): Promise<void> {
    console.log(`⏰ Programando recordatorio para etapa: ${stage.name}`);

    // En implementación real, esto se guardaría en base de datos o sistema de colas
    const reminderDate = new Date(Date.now() + stage.estimatedDays * 24 * 60 * 60 * 1000);

    console.log('📦 Mock: Recordatorio programado', {
      applicationId: application.id,
      stageName: stage.name,
      reminderDate: reminderDate.toISOString(),
      estimatedDays: stage.estimatedDays
    });
  }

  /**
   * Utilidad para delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Actualiza configuración del servicio
   */
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de notificaciones actualizada:', this.config);
  }

  /**
   * Obtiene configuración actual
   */
  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // ==================== SUPABASE & REAL METHODS ====================

  async createNotification(data: {
    candidate_id: string;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    application_id?: string;
    notification_type?: string;
    priority?: string;
    channels?: string[];
    status?: string;
    scheduled_at?: string;
  }): Promise<void> {
    if (!dataService.isSupabaseMode()) {
      const mockNotif = {
        id: `mock-${Date.now()}`,
        candidateId: data.candidate_id,
        type: data.type,
        title: data.title,
        message: data.message,
        timestamp: new Date(),
        isRead: false
      };
      this.dispatchEvent('notification_sent', mockNotif);
      return;
    }

    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { error } = await supabase.from('notifications').insert({
        candidate_id: data.candidate_id,
        application_id: data.application_id,
        notification_type: data.notification_type || 'status_change',
        priority: data.priority || 'medium',
        title: data.title,
        message: data.message,
        channels: data.channels || ['email'],
        status: data.status || 'queued',
        scheduled_at: data.scheduled_at || new Date().toISOString(),
        metadata: { type: data.type },
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      // Dispatch event for local updates
      this.dispatchEvent('notification_sent', {
        candidateId: data.candidate_id,
        ...data
      });

    } catch (err) {
      console.error('Error creating notification:', err);
    }
  }

  async getNotifications(candidateId: string): Promise<Notification[]> {
    if (!dataService.isSupabaseMode()) {
      return this.getNotificationHistory(candidateId);
    }

    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data.map((n: any) => ({
        id: n.id,
        candidateId: n.candidate_id,
        applicationId: n.application_id || '',
        type: n.notification_type as any, // Cast to any to avoid strict enum check conflicts if DB has different values, or use explicit casting to NotificationType
        priority: n.priority as any,
        title: n.title,
        message: n.message,
        channels: n.channels || [],
        status: n.status as any,
        scheduledAt: new Date(n.scheduled_at),
        sentAt: n.sent_at ? new Date(n.sent_at) : undefined,
        readAt: n.read_at ? new Date(n.read_at) : undefined,
        retryCount: n.retry_count || 0,
        maxRetries: n.max_retries || 3,
        metadata: n.metadata || {}
      }));
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    if (!dataService.isSupabaseMode()) {
      console.log('📖 Mock: Marcando como leída notificación', notificationId);
      return;
    }

    try {
      if (!supabase) return;

      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString(), status: 'read' })
        .eq('id', notificationId);

      this.dispatchEvent('notification_read', { id: notificationId });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }

  // ==================== MÉTODOS PARA COMPATIBILIDAD CON HOOK EXISTENTE ====================

  /**
   * Obtiene preferencias de notificación del usuario
   */
  getPreferences(candidateId: string): any {
    // En implementación real, esto vendría de la base de datos
    console.log('📦 Mock: Obteniendo preferencias para candidato', candidateId);
    return {
      email: true,
      push: true,
      sms: false,
      statusChanges: true,
      interviews: true,
      deadlines: true,
      feedback: true
    };
  }

  /**
   * Obtiene historial de notificaciones (Mock legacy)
   */
  getNotificationHistory(candidateId: string): any[] {
    console.log('📦 Mock: Obteniendo historial para candidato', candidateId);
    return [];
  }

  /**
   * Obtiene conteo de notificaciones no leídas
   */
  async getUnreadCount(candidateId: string): Promise<number> {
    if (!dataService.isSupabaseMode()) return 0;

    if (!supabase) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('candidate_id', candidateId)
      .is('read_at', null);

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Obtiene analytics de notificaciones
   */
  /**
   * Obtiene analytics de notificaciones
   */
  async getAnalytics(candidateId: string): Promise<any> {
    if (!dataService.isSupabaseMode()) {
      console.log('📦 Mock: Obteniendo analytics para candidato', candidateId);
      return {
        totalSent: 0,
        totalRead: 0,
        totalFailed: 0,
        readRate: 0,
        deliveryRates: { whatsapp: 0, email: 0, push: 0 },
        readRates: { whatsapp: 0, email: 0, push: 0 },
        averageReadTime: 0,
        engagementScore: 0
      };
    }

    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      // Get all notifications for stats
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('status, channels, created_at, read_at')
        .eq('candidate_id', candidateId);

      if (error) throw error;

      const totalSent = notifications.length;
      const readNotifications = notifications.filter(n => n.read_at);
      const totalRead = readNotifications.length;
      const failed = notifications.filter(n => n.status === 'failed');
      const totalFailed = failed.length;

      // Calculate read time
      let totalReadTimeMinutes = 0;
      readNotifications.forEach(n => {
        const created = new Date(n.created_at);
        const read = new Date(n.read_at);
        const diffMinutes = (read.getTime() - created.getTime()) / (1000 * 60);
        totalReadTimeMinutes += diffMinutes;
      });
      const averageReadTime = totalRead > 0 ? totalReadTimeMinutes / totalRead : 0;

      // Mock channel stats for now as DB might not allow easy grouping without more complex queries
      // or infer from channels array
      const deliveryRates = { whatsapp: 0.9, email: 0.95, push: 0.85 };
      const readRates = {
        whatsapp: 0.8,
        email: 0.4,
        push: 0.6
      };

      // Calculate engagement score (0-100)
      // Factors: Read rate (50%), Read speed (30%), Low failure (20%)
      const readRate = totalSent > 0 ? totalRead / totalSent : 0;
      const readSpeedScore = Math.max(0, 100 - (averageReadTime / 60)); // 1 hour = 99, 100 hours = 0
      const failurePenalty = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;

      const engagementScore = Math.round(
        (readRate * 50) +
        (readSpeedScore * 0.3)
      );

      return {
        totalSent,
        totalRead,
        totalFailed,
        readRate,
        deliveryRates,
        readRates,
        averageReadTime,
        engagementScore: Math.min(100, Math.max(0, engagementScore))
      };

    } catch (err) {
      console.error('Error fetching analytics:', err);
      return {
        totalSent: 0,
        totalRead: 0,
        totalFailed: 0,
        readRate: 0,
        deliveryRates: {},
        readRates: {},
        averageReadTime: 0,
        engagementScore: 0
      };
    }
  }

  /**
   * Detecta cambio de estado y envía notificación
   */
  async detectStatusChange(
    candidateId: string,
    applicationId: string,
    oldStatus: string,
    newStatus: string,
    metadata: any
  ): Promise<void> {
    console.log('📊 Mock: Detectando cambio de estado', {
      candidateId,
      applicationId,
      oldStatus,
      newStatus,
      metadata
    });

    // Usar el método existente de cambio de estado
    await this.sendStatusChangeNotification(
      applicationId,
      oldStatus,
      newStatus,
      candidateId,
      'candidate'
    );
  }

  /**
   * Programa recordatorio de entrevista
   */
  async scheduleInterviewReminder(
    candidateId: string,
    applicationId: string,
    interviewDate: Date,
    metadata: any
  ): Promise<void> {
    console.log('📅 Programando recordatorio de entrevista', {
      candidateId,
      applicationId,
      interviewDate
    });

    if (dataService.isSupabaseMode()) {
      await this.createNotification({
        candidate_id: candidateId,
        application_id: applicationId,
        title: 'Recordatorio de Entrevista',
        message: `Tienes una entrevista agendada para ${interviewDate.toLocaleString()}. Posición: ${metadata.positionTitle}`,
        type: 'info',
        notification_type: 'interview_reminder',
        priority: 'high',
        channels: ['email', 'push'],
        scheduled_at: new Date().toISOString() // In reality this should be scheduled in the future
      });
    }
  }

  /**
   * Envía alerta de deadline
   */
  async sendDeadlineAlert(
    candidateId: string,
    applicationId: string,
    type: string,
    deadline: Date,
    metadata: any
  ): Promise<void> {
    console.log('⏰ Enviando alerta de deadline', {
      candidateId,
      applicationId,
      deadline
    });

    if (dataService.isSupabaseMode()) {
      await this.createNotification({
        candidate_id: candidateId,
        application_id: applicationId,
        title: 'Alerta de Vencimiento',
        message: `Una tarea importante vence pronto: ${type}. Fecha límite: ${deadline.toLocaleString()}`,
        type: 'warning',
        notification_type: 'deadline_alert',
        priority: 'high',
        channels: ['email', 'push'],
        scheduled_at: new Date().toISOString()
      });
    }
  }

  /**
   * Envía notificación de feedback
   */
  async sendFeedbackNotification(
    candidateId: string,
    applicationId: string,
    metadata: any
  ): Promise<void> {
    console.log('💬 Enviando notificación de feedback', {
      candidateId,
      applicationId
    });

    if (dataService.isSupabaseMode()) {
      await this.createNotification({
        candidate_id: candidateId,
        application_id: applicationId,
        title: 'Nuevo Feedback Disponible',
        message: `Has recibido feedback para tu aplicación en ${metadata.companyName}.`,
        type: 'info',
        notification_type: 'feedback_available',
        priority: 'medium',
        channels: ['email'],
        scheduled_at: new Date().toISOString()
      });
    }
  }

  /**
   * Actualiza preferencias de usuario
   */
  updatePreferences(candidateId: string, updates: any): void {
    console.log('⚙️ Mock: Actualizando preferencias', {
      candidateId,
      updates
    });
  }

  /**
   * Agrega event listener
   */
  addEventListener(event: string, handler: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
  }

  /**
   * Remueve event listener
   */
  removeEventListener(event: string, handler: Function): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(h => h !== handler);
  }

  /**
   * Dispatch internal events
   */
  private dispatchEvent(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(handler => {
        try {
          handler(data);
        } catch (e) {
          console.error(`Error in notification listener for ${event}:`, e);
        }
      });
    }
  }
}

// Exportar instancia singleton
export const notificationService = new NotificationServiceImpl();
