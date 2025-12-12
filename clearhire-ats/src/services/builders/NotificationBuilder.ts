/**
 * Builder Pattern para construcción de notificaciones
 * Facilita la creación de objetos Notification complejos
 */

import type { 
  Notification, 
  NotificationType, 
  DeliveryChannel 
} from '../../types/notifications';
import { NotificationId } from '../../types/valueObjects';

export class NotificationBuilder {
  private notification: Partial<Notification> = {
    status: 'queued',
    scheduledAt: new Date(),
    retryCount: 0,
    maxRetries: 3,
    channels: [],
    metadata: {}
  };

  /**
   * Establece el candidato destinatario
   */
  forCandidate(candidateId: string): this {
    this.notification.candidateId = candidateId;
    return this;
  }

  /**
   * Establece la aplicación relacionada
   */
  forApplication(applicationId: string): this {
    this.notification.applicationId = applicationId;
    return this;
  }

  /**
   * Establece el tipo de notificación
   */
  withType(type: NotificationType): this {
    this.notification.type = type;
    return this;
  }

  /**
   * Establece la prioridad
   */
  withPriority(priority: 'high' | 'medium' | 'low'): this {
    this.notification.priority = priority;
    return this;
  }

  /**
   * Establece el título y mensaje
   */
  withMessage(title: string, message: string): this {
    this.notification.title = title;
    this.notification.message = message;
    return this;
  }

  /**
   * Establece los canales de entrega
   */
  withChannels(...channels: DeliveryChannel[]): this {
    this.notification.channels = channels;
    return this;
  }

  /**
   * Agrega un canal de entrega
   */
  addChannel(channel: DeliveryChannel): this {
    if (!this.notification.channels) {
      this.notification.channels = [];
    }
    if (!this.notification.channels.includes(channel)) {
      this.notification.channels.push(channel);
    }
    return this;
  }

  /**
   * Establece el número máximo de reintentos
   */
  withMaxRetries(maxRetries: number): this {
    this.notification.maxRetries = maxRetries;
    return this;
  }

  /**
   * Programa la notificación para una fecha específica
   */
  scheduleFor(date: Date): this {
    this.notification.scheduledAt = date;
    return this;
  }

  /**
   * Agrega metadata personalizada
   */
  withMetadata(key: string, value: any): this {
    if (!this.notification.metadata) {
      this.notification.metadata = {};
    }
    this.notification.metadata[key] = value;
    return this;
  }

  /**
   * Agrega múltiples campos de metadata
   */
  withMetadataObject(metadata: Record<string, any>): this {
    this.notification.metadata = {
      ...this.notification.metadata,
      ...metadata
    };
    return this;
  }

  /**
   * Valida que todos los campos requeridos estén presentes
   */
  private validate(): void {
    const errors: string[] = [];

    if (!this.notification.candidateId) {
      errors.push('Candidate ID is required');
    }

    if (!this.notification.applicationId) {
      errors.push('Application ID is required');
    }

    if (!this.notification.type) {
      errors.push('Notification type is required');
    }

    if (!this.notification.priority) {
      errors.push('Priority is required');
    }

    if (!this.notification.title) {
      errors.push('Title is required');
    }

    if (!this.notification.message) {
      errors.push('Message is required');
    }

    if (!this.notification.channels || this.notification.channels.length === 0) {
      errors.push('At least one delivery channel is required');
    }

    if (errors.length > 0) {
      throw new Error(`Invalid notification: ${errors.join(', ')}`);
    }
  }

  /**
   * Construye y retorna la notificación
   */
  build(): Notification {
    this.validate();

    return {
      id: NotificationId.generate().value,
      candidateId: this.notification.candidateId!,
      applicationId: this.notification.applicationId!,
      type: this.notification.type!,
      priority: this.notification.priority!,
      title: this.notification.title!,
      message: this.notification.message!,
      channels: this.notification.channels!,
      status: this.notification.status!,
      scheduledAt: this.notification.scheduledAt!,
      retryCount: this.notification.retryCount!,
      maxRetries: this.notification.maxRetries!,
      metadata: this.notification.metadata || {}
    };
  }

  /**
   * Resetea el builder para crear una nueva notificación
   */
  reset(): this {
    this.notification = {
      status: 'queued',
      scheduledAt: new Date(),
      retryCount: 0,
      maxRetries: 3,
      channels: [],
      metadata: {}
    };
    return this;
  }
}

/**
 * Factory method para crear un builder preconfigurado para cambios de estado
 */
export function createStatusChangeNotificationBuilder(
  candidateId: string,
  applicationId: string
): NotificationBuilder {
  return new NotificationBuilder()
    .forCandidate(candidateId)
    .forApplication(applicationId)
    .withType('status_change')
    .withMaxRetries(3);
}

/**
 * Factory method para crear un builder preconfigurado para recordatorios
 */
export function createReminderNotificationBuilder(
  candidateId: string,
  applicationId: string
): NotificationBuilder {
  return new NotificationBuilder()
    .forCandidate(candidateId)
    .forApplication(applicationId)
    .withType('interview_reminder')
    .withPriority('high')
    .withMaxRetries(2);
}

/**
 * Factory method para crear un builder preconfigurado para alertas de deadline
 */
export function createDeadlineAlertBuilder(
  candidateId: string,
  applicationId: string
): NotificationBuilder {
  return new NotificationBuilder()
    .forCandidate(candidateId)
    .forApplication(applicationId)
    .withType('deadline_alert')
    .withPriority('high')
    .withMaxRetries(3);
}
