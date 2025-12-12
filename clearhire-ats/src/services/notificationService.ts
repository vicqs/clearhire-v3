/**
 * Servicio de Notificaciones
 * Maneja el envío de notificaciones para aceptación de ofertas y seguimiento
 */

import { dataService } from './dataService';
import type {
  NotificationService as INotificationService,
  NotificationResult,
  OfferAcceptanceNotificationData,
  BulkNotificationRequest
} from '../types/tracking';
import type { Application, Stage } from '../types/application';

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
      
      // Determinar método de envío preferido
      const notificationType = this.getPreferredNotificationType(recipientType);
      
      const result = await this.sendNotificationWithRetry(
        recipientId,
        notificationType,
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
      const notificationType = this.getPreferredNotificationType(recipientType);

      const result = await this.sendNotificationWithRetry(
        recipientId,
        notificationType,
        template,
        notificationData
      );

      return result;

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
    // En modo mock, simular envío
    if (!dataService.isSupabaseMode()) {
      console.log('📦 Mock: Notificación enviada', {
        recipientId,
        type,
        subject: template.subject,
        company: data.companyName,
        position: data.positionTitle
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
    return {
      subject: `Actualización de estado - ${data.positionTitle}`,
      body: `El estado de tu aplicación para ${data.positionTitle} en ${data.companyName} ha cambiado de "${fromStatus}" a "${toStatus}".

Próximos pasos:
${data.nextSteps.map(step => `• ${step}`).join('\n')}

Mantente atento a futuras actualizaciones.

Saludos,
El equipo de ClearHire ATS`,
      type: 'email'
    };
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
   * Obtiene historial de notificaciones
   */
  getNotificationHistory(candidateId: string): any[] {
    console.log('📦 Mock: Obteniendo historial para candidato', candidateId);
    return [];
  }

  /**
   * Obtiene conteo de notificaciones no leídas
   */
  getUnreadCount(candidateId: string): number {
    console.log('📦 Mock: Obteniendo conteo no leídas para candidato', candidateId);
    return 0;
  }

  /**
   * Obtiene analytics de notificaciones
   */
  getAnalytics(candidateId: string): any {
    console.log('📦 Mock: Obteniendo analytics para candidato', candidateId);
    return {
      totalSent: 0,
      totalRead: 0,
      readRate: 0
    };
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
   * Marca notificación como leída
   */
  markAsRead(notificationId: string): void {
    console.log('📖 Mock: Marcando como leída notificación', notificationId);
  }

  /**
   * Programa recordatorio de entrevista
   */
  scheduleInterviewReminder(
    candidateId: string,
    applicationId: string,
    interviewDate: Date,
    metadata: any
  ): void {
    console.log('📅 Mock: Programando recordatorio de entrevista', {
      candidateId,
      applicationId,
      interviewDate,
      metadata
    });
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
    console.log('⏰ Mock: Enviando alerta de deadline', {
      candidateId,
      applicationId,
      type,
      deadline,
      metadata
    });
  }

  /**
   * Envía notificación de feedback
   */
  async sendFeedbackNotification(
    candidateId: string,
    applicationId: string,
    metadata: any
  ): Promise<void> {
    console.log('💬 Mock: Enviando notificación de feedback', {
      candidateId,
      applicationId,
      metadata
    });
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
   * Agrega event listener (mock)
   */
  addEventListener(event: string, _handler: Function): void {
    console.log('👂 Mock: Agregando event listener', event);
  }

  /**
   * Remueve event listener (mock)
   */
  removeEventListener(event: string, _handler: Function): void {
    console.log('🚫 Mock: Removiendo event listener', event);
  }
}

// Exportar instancia singleton
export const notificationService = new NotificationServiceImpl();