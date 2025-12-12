/**
 * Servicio de Recordatorios Automáticos
 * Maneja la programación y envío de recordatorios para el proceso de contratación
 */

import { notificationService } from './notificationService';
import { dataService } from './dataService';
import { applicationService } from './supabase/applicationService';
import type { Application, Stage } from '../types/application';
// Reminder types are defined locally in this file

export interface ReminderSchedule {
  id: string;
  applicationId: string;
  stageName: string;
  reminderType: 'stage_deadline' | 'follow_up' | 'document_request' | 'interview_reminder';
  scheduledFor: Date;
  recipientId: string;
  recipientType: 'candidate' | 'recruiter';
  message: string;
  status: 'scheduled' | 'sent' | 'cancelled' | 'failed';
  createdAt: Date;
  sentAt?: Date;
  metadata?: Record<string, any>;
}

export interface ReminderConfig {
  stageDeadlineHours: number;
  followUpDays: number;
  interviewReminderHours: number;
  documentRequestDays: number;
  maxRetries: number;
  enableAutoReminders: boolean;
}

class ReminderService {
  private reminders: Map<string, ReminderSchedule> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  private config: ReminderConfig = {
    stageDeadlineHours: 24,
    followUpDays: 3,
    interviewReminderHours: 2,
    documentRequestDays: 1,
    maxRetries: 3,
    enableAutoReminders: true
  };

  /**
   * Programa recordatorios automáticos para las siguientes etapas
   */
  async scheduleFollowUpReminders(applicationId: string, nextStages: Stage[]): Promise<void> {
    if (!this.config.enableAutoReminders) {
      console.log('⏸️ Recordatorios automáticos deshabilitados');
      return;
    }

    console.log(`⏰ Programando recordatorios para aplicación ${applicationId}`);

    try {
      const application = await dataService.getApplication(applicationId);
      if (!application) {
        throw new Error('Aplicación no encontrada');
      }

      // Cancelar recordatorios existentes para esta aplicación
      await this.cancelApplicationReminders(applicationId);

      // Programar nuevos recordatorios
      for (const stage of nextStages) {
        await this.scheduleStageReminders(application, stage);
      }

      console.log(`✅ Recordatorios programados para ${nextStages.length} etapas`);

    } catch (error) {
      console.error('❌ Error programando recordatorios:', error);
      throw error;
    }
  }

  /**
   * Programa recordatorios específicos para una etapa
   */
  async scheduleStageReminders(application: Application, stage: Stage): Promise<void> {
    const baseDate = new Date();
    
    // 1. Recordatorio de deadline de etapa
    const deadlineReminder = await this.createStageDeadlineReminder(application, stage, baseDate);
    await this.scheduleReminder(deadlineReminder);

    // 2. Recordatorio de seguimiento
    const followUpReminder = await this.createFollowUpReminder(application, stage, baseDate);
    await this.scheduleReminder(followUpReminder);

    // 3. Recordatorios específicos según el tipo de etapa
    if (stage.name.toLowerCase().includes('interview')) {
      const interviewReminder = await this.createInterviewReminder(application, stage, baseDate);
      await this.scheduleReminder(interviewReminder);
    }

    if (stage.name.toLowerCase().includes('document') || stage.name.toLowerCase().includes('background')) {
      const documentReminder = await this.createDocumentReminder(application, stage, baseDate);
      await this.scheduleReminder(documentReminder);
    }
  }

  /**
   * Programa un recordatorio individual
   */
  async scheduleReminder(reminder: ReminderSchedule): Promise<void> {
    console.log(`📅 Programando recordatorio: ${reminder.reminderType} para ${reminder.scheduledFor.toISOString()}`);

    // Guardar recordatorio
    this.reminders.set(reminder.id, reminder);

    // Calcular delay hasta el envío
    const delay = reminder.scheduledFor.getTime() - Date.now();

    if (delay <= 0) {
      // Si ya pasó la fecha, enviar inmediatamente
      await this.sendReminder(reminder.id);
    } else {
      // Programar timer
      const timer = setTimeout(async () => {
        await this.sendReminder(reminder.id);
      }, delay);

      this.timers.set(reminder.id, timer);
    }

    // En modo real, también guardaríamos en base de datos
    if (dataService.isSupabaseMode()) {
      await this.saveReminderToDatabase(reminder);
    }
  }

  /**
   * Envía un recordatorio programado
   */
  async sendReminder(reminderId: string): Promise<void> {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) {
      console.warn(`⚠️ Recordatorio ${reminderId} no encontrado`);
      return;
    }

    if (reminder.status !== 'scheduled') {
      console.log(`⏭️ Recordatorio ${reminderId} ya procesado (${reminder.status})`);
      return;
    }

    console.log(`📤 Enviando recordatorio: ${reminder.reminderType}`);

    try {
      // Obtener datos actualizados de la aplicación
      const application = await dataService.getApplication(reminder.applicationId);
      if (!application) {
        throw new Error('Aplicación no encontrada');
      }

      // Crear datos de notificación
      const notificationData = {
        candidateName: 'Candidato', // En implementación real, obtener del perfil
        companyName: application.company,
        positionTitle: application.position,
        acceptanceDate: new Date(),
        nextSteps: [reminder.message],
        offerDetails: application.offerDetails || {} as any
      };

      // Enviar notificación
      const result = await notificationService.sendOfferAcceptanceNotification(
        reminder.recipientType,
        reminder.recipientId,
        notificationData
      );

      // Actualizar estado del recordatorio
      reminder.status = result.status === 'sent' ? 'sent' : 'failed';
      reminder.sentAt = new Date();

      // Limpiar timer
      const timer = this.timers.get(reminderId);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(reminderId);
      }

      // Crear evento de seguimiento
      await applicationService.createTrackingEntry(reminder.applicationId, {
        id: `reminder-${reminderId}`,
        applicationId: reminder.applicationId,
        eventType: 'notification_sent',
        timestamp: new Date(),
        details: {
          reminderType: reminder.reminderType,
          recipientType: reminder.recipientType,
          status: reminder.status,
          message: reminder.message
        },
        triggeredBy: 'system',
        metadata: {
          reminderId,
          scheduledFor: reminder.scheduledFor.toISOString()
        }
      });

      console.log(`✅ Recordatorio enviado exitosamente: ${reminder.reminderType}`);

    } catch (error) {
      console.error(`❌ Error enviando recordatorio ${reminderId}:`, error);
      
      reminder.status = 'failed';
      
      // En implementación real, podríamos programar reintentos
      if (this.shouldRetryReminder(reminder)) {
        await this.scheduleReminderRetry(reminder);
      }
    }

    // Actualizar en base de datos si es necesario
    if (dataService.isSupabaseMode()) {
      await this.updateReminderInDatabase(reminder);
    }
  }

  /**
   * Cancela todos los recordatorios de una aplicación
   */
  async cancelApplicationReminders(applicationId: string): Promise<void> {
    console.log(`🚫 Cancelando recordatorios para aplicación ${applicationId}`);

    const remindersToCancel = Array.from(this.reminders.values())
      .filter(reminder => reminder.applicationId === applicationId && reminder.status === 'scheduled');

    for (const reminder of remindersToCancel) {
      await this.cancelReminder(reminder.id);
    }

    console.log(`✅ ${remindersToCancel.length} recordatorios cancelados`);
  }

  /**
   * Cancela un recordatorio específico
   */
  async cancelReminder(reminderId: string): Promise<void> {
    const reminder = this.reminders.get(reminderId);
    if (!reminder) {
      return;
    }

    // Cancelar timer si existe
    const timer = this.timers.get(reminderId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(reminderId);
    }

    // Actualizar estado
    reminder.status = 'cancelled';

    console.log(`🚫 Recordatorio cancelado: ${reminderId}`);

    // Actualizar en base de datos si es necesario
    if (dataService.isSupabaseMode()) {
      await this.updateReminderInDatabase(reminder);
    }
  }

  /**
   * Obtiene recordatorios activos para una aplicación
   */
  getApplicationReminders(applicationId: string): ReminderSchedule[] {
    return Array.from(this.reminders.values())
      .filter(reminder => reminder.applicationId === applicationId);
  }

  /**
   * Obtiene estadísticas de recordatorios
   */
  getReminderStats(): {
    total: number;
    scheduled: number;
    sent: number;
    failed: number;
    cancelled: number;
  } {
    const reminders = Array.from(this.reminders.values());
    
    return {
      total: reminders.length,
      scheduled: reminders.filter(r => r.status === 'scheduled').length,
      sent: reminders.filter(r => r.status === 'sent').length,
      failed: reminders.filter(r => r.status === 'failed').length,
      cancelled: reminders.filter(r => r.status === 'cancelled').length
    };
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Crea recordatorio de deadline de etapa
   */
  private async createStageDeadlineReminder(
    application: Application,
    stage: Stage,
    baseDate: Date
  ): Promise<ReminderSchedule> {
    const scheduledFor = new Date(baseDate.getTime() + this.config.stageDeadlineHours * 60 * 60 * 1000);

    return {
      id: `deadline-${application.id}-${stage.id}-${Date.now()}`,
      applicationId: application.id,
      stageName: stage.name,
      reminderType: 'stage_deadline',
      scheduledFor,
      recipientId: stage.recruiter?.id || 'default-recruiter',
      recipientType: 'recruiter',
      message: `Recordatorio: La etapa "${stage.name}" para ${application.position} en ${application.company} requiere atención.`,
      status: 'scheduled',
      createdAt: new Date(),
      metadata: {
        stageId: stage.id,
        estimatedDays: stage.estimatedDays
      }
    };
  }

  /**
   * Crea recordatorio de seguimiento
   */
  private async createFollowUpReminder(
    application: Application,
    stage: Stage,
    baseDate: Date
  ): Promise<ReminderSchedule> {
    const scheduledFor = new Date(baseDate.getTime() + this.config.followUpDays * 24 * 60 * 60 * 1000);

    return {
      id: `followup-${application.id}-${stage.id}-${Date.now()}`,
      applicationId: application.id,
      stageName: stage.name,
      reminderType: 'follow_up',
      scheduledFor,
      recipientId: application.candidateId,
      recipientType: 'candidate',
      message: `Seguimiento: Tu aplicación para ${application.position} en ${application.company} está en la etapa "${stage.name}".`,
      status: 'scheduled',
      createdAt: new Date(),
      metadata: {
        stageId: stage.id
      }
    };
  }

  /**
   * Crea recordatorio de entrevista
   */
  private async createInterviewReminder(
    application: Application,
    stage: Stage,
    baseDate: Date
  ): Promise<ReminderSchedule> {
    const scheduledFor = new Date(baseDate.getTime() + this.config.interviewReminderHours * 60 * 60 * 1000);

    return {
      id: `interview-${application.id}-${stage.id}-${Date.now()}`,
      applicationId: application.id,
      stageName: stage.name,
      reminderType: 'interview_reminder',
      scheduledFor,
      recipientId: application.candidateId,
      recipientType: 'candidate',
      message: `Recordatorio: Tienes una entrevista programada para ${application.position} en ${application.company}.`,
      status: 'scheduled',
      createdAt: new Date(),
      metadata: {
        stageId: stage.id,
        interviewDate: application.interviewDate?.toISOString()
      }
    };
  }

  /**
   * Crea recordatorio de documentos
   */
  private async createDocumentReminder(
    application: Application,
    stage: Stage,
    baseDate: Date
  ): Promise<ReminderSchedule> {
    const scheduledFor = new Date(baseDate.getTime() + this.config.documentRequestDays * 24 * 60 * 60 * 1000);

    return {
      id: `document-${application.id}-${stage.id}-${Date.now()}`,
      applicationId: application.id,
      stageName: stage.name,
      reminderType: 'document_request',
      scheduledFor,
      recipientId: application.candidateId,
      recipientType: 'candidate',
      message: `Recordatorio: Se requieren documentos para completar la etapa "${stage.name}" de tu aplicación en ${application.company}.`,
      status: 'scheduled',
      createdAt: new Date(),
      metadata: {
        stageId: stage.id
      }
    };
  }

  /**
   * Determina si se debe reintentar un recordatorio
   */
  private shouldRetryReminder(reminder: ReminderSchedule): boolean {
    const retryCount = reminder.metadata?.retryCount || 0;
    return retryCount < this.config.maxRetries;
  }

  /**
   * Programa reintento de recordatorio
   */
  private async scheduleReminderRetry(reminder: ReminderSchedule): Promise<void> {
    const retryCount = (reminder.metadata?.retryCount || 0) + 1;
    const retryDelay = Math.pow(2, retryCount) * 60 * 1000; // Backoff exponencial en minutos

    reminder.metadata = {
      ...reminder.metadata,
      retryCount
    };

    reminder.scheduledFor = new Date(Date.now() + retryDelay);
    reminder.status = 'scheduled';

    console.log(`🔄 Programando reintento ${retryCount}/${this.config.maxRetries} para recordatorio ${reminder.id}`);

    await this.scheduleReminder(reminder);
  }

  /**
   * Guarda recordatorio en base de datos (implementación mock)
   */
  private async saveReminderToDatabase(reminder: ReminderSchedule): Promise<void> {
    console.log('📦 Mock: Guardando recordatorio en BD', {
      id: reminder.id,
      type: reminder.reminderType,
      scheduledFor: reminder.scheduledFor.toISOString()
    });
  }

  /**
   * Actualiza recordatorio en base de datos (implementación mock)
   */
  private async updateReminderInDatabase(reminder: ReminderSchedule): Promise<void> {
    console.log('📦 Mock: Actualizando recordatorio en BD', {
      id: reminder.id,
      status: reminder.status,
      sentAt: reminder.sentAt?.toISOString()
    });
  }

  /**
   * Actualiza configuración del servicio
   */
  updateConfig(newConfig: Partial<ReminderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de recordatorios actualizada:', this.config);
  }

  /**
   * Obtiene configuración actual
   */
  getConfig(): ReminderConfig {
    return { ...this.config };
  }

  /**
   * Limpia todos los recordatorios y timers (para testing)
   */
  clearAll(): void {
    // Cancelar todos los timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.timers.clear();
    this.reminders.clear();
    
    console.log('🧹 Todos los recordatorios limpiados');
  }
}

// Exportar instancia singleton
export const reminderService = new ReminderService();