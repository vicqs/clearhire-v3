/**
 * Value Objects para el dominio de la aplicación
 * Estos objetos encapsulan lógica de negocio y validaciones
 */

import type { ApplicationStatus } from './application';
import type { NotificationType } from './notifications';

/**
 * Representa una transición de estado en una aplicación
 */
export class StatusTransition {
  constructor(
    public readonly from: ApplicationStatus,
    public readonly to: ApplicationStatus
  ) {
    this.validate();
  }

  /**
   * Clave única para identificar esta transición
   */
  get key(): string {
    return `${this.from}_to_${this.to}`;
  }

  /**
   * Indica si esta transición es un rechazo
   */
  get isRejection(): boolean {
    return this.to === 'rejected';
  }

  /**
   * Indica si esta transición es una promoción/avance positivo
   */
  get isPromotion(): boolean {
    const promotions: ApplicationStatus[] = [
      'approved',
      'hired',
      'offer_accepted',
      'finalist',
      'interview_scheduled'
    ];
    return promotions.includes(this.to);
  }

  /**
   * Indica si esta transición es crítica y requiere notificación inmediata
   */
  get isCritical(): boolean {
    return this.isRejection || this.isPromotion;
  }

  /**
   * Obtiene la prioridad de notificación para esta transición
   */
  get priority(): 'high' | 'medium' | 'low' {
    if (this.isCritical) return 'high';
    if (this.to === 'on_hold' || this.to === 'withdrawn') return 'low';
    return 'medium';
  }

  /**
   * Valida que la transición sea válida
   */
  private validate(): void {
    if (this.from === this.to) {
      throw new Error('Status transition must change the status');
    }
    
    // Validar transiciones inválidas
    const invalidTransitions = [
      { from: 'hired', to: 'screening' },
      { from: 'rejected', to: 'active' },
      { from: 'withdrawn', to: 'active' },
    ];
    
    const isInvalid = invalidTransitions.some(
      t => t.from === this.from && t.to === this.to
    );
    
    if (isInvalid) {
      throw new Error(`Invalid status transition: ${this.from} -> ${this.to}`);
    }
  }

  /**
   * Compara dos transiciones
   */
  equals(other: StatusTransition): boolean {
    return this.from === other.from && this.to === other.to;
  }

  toString(): string {
    return `${this.from} → ${this.to}`;
  }
}

/**
 * Contexto de notificación con información del candidato y posición
 */
export class NotificationContext {
  constructor(
    public readonly candidateName: string,
    public readonly positionTitle: string,
    public readonly companyName: string,
    public readonly recruiterName?: string
  ) {
    this.validate();
  }

  /**
   * Valida que todos los campos requeridos estén presentes
   */
  private validate(): void {
    if (!this.candidateName?.trim()) {
      throw new Error('Candidate name is required');
    }
    if (!this.positionTitle?.trim()) {
      throw new Error('Position title is required');
    }
    if (!this.companyName?.trim()) {
      throw new Error('Company name is required');
    }
  }

  /**
   * Obtiene el nombre del reclutador o un valor por defecto
   */
  get recruiterDisplayName(): string {
    return this.recruiterName || 'Equipo de RH';
  }

  /**
   * Convierte a un objeto plano para templates
   */
  toTemplateVariables(): Record<string, string> {
    return {
      candidateName: this.candidateName,
      positionTitle: this.positionTitle,
      companyName: this.companyName,
      recruiterName: this.recruiterDisplayName,
    };
  }

  toString(): string {
    return `${this.candidateName} - ${this.positionTitle} @ ${this.companyName}`;
  }
}

/**
 * Evento de cambio de estado
 */
export class StatusChangeEvent {
  constructor(
    public readonly candidateId: string,
    public readonly applicationId: string,
    public readonly transition: StatusTransition,
    public readonly context: NotificationContext,
    public readonly timestamp: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.candidateId?.trim()) {
      throw new Error('Candidate ID is required');
    }
    if (!this.applicationId?.trim()) {
      throw new Error('Application ID is required');
    }
  }

  /**
   * Obtiene el tipo de notificación para este evento
   */
  get notificationType(): NotificationType {
    return 'status_change';
  }

  /**
   * Obtiene la prioridad de la notificación
   */
  get priority(): 'high' | 'medium' | 'low' {
    return this.transition.priority;
  }

  toString(): string {
    return `[${this.timestamp.toISOString()}] ${this.context} - ${this.transition}`;
  }
}

/**
 * Rango de tiempo para horarios silenciosos
 */
export class TimeRange {
  constructor(
    public readonly start: string, // formato HH:MM
    public readonly end: string,   // formato HH:MM
    public readonly timezone: string = 'America/Mexico_City'
  ) {
    this.validate();
  }

  private validate(): void {
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!timeRegex.test(this.start)) {
      throw new Error(`Invalid start time format: ${this.start}`);
    }
    if (!timeRegex.test(this.end)) {
      throw new Error(`Invalid end time format: ${this.end}`);
    }
  }

  /**
   * Verifica si una fecha está dentro del rango
   */
  contains(date: Date): boolean {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const currentTime = hours * 60 + minutes;
    
    const [startHours, startMinutes] = this.start.split(':').map(Number);
    const startTime = startHours * 60 + startMinutes;
    
    const [endHours, endMinutes] = this.end.split(':').map(Number);
    const endTime = endHours * 60 + endMinutes;
    
    // Manejar rangos que cruzan medianoche
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }
    
    return currentTime >= startTime && currentTime <= endTime;
  }

  toString(): string {
    return `${this.start} - ${this.end} (${this.timezone})`;
  }
}

/**
 * Identificador único de notificación
 */
export class NotificationId {
  private constructor(public readonly value: string) {}

  static generate(): NotificationId {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return new NotificationId(`notif_${timestamp}_${random}`);
  }

  static fromString(value: string): NotificationId {
    if (!value.startsWith('notif_')) {
      throw new Error('Invalid notification ID format');
    }
    return new NotificationId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: NotificationId): boolean {
    return this.value === other.value;
  }
}

/**
 * Monto de dinero con moneda
 */
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new Error('Amount cannot be negative');
    }
    if (!this.currency?.trim()) {
      throw new Error('Currency is required');
    }
  }

  /**
   * Suma dos montos (deben ser de la misma moneda)
   */
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot add different currencies: ${this.currency} and ${other.currency}`);
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * Resta dos montos (deben ser de la misma moneda)
   */
  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot subtract different currencies: ${this.currency} and ${other.currency}`);
    }
    return new Money(Math.max(0, this.amount - other.amount), this.currency);
  }

  /**
   * Multiplica por un factor
   */
  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  /**
   * Calcula un porcentaje
   */
  percentage(percent: number): Money {
    return new Money((this.amount * percent) / 100, this.currency);
  }

  /**
   * Formatea el monto según el país
   */
  format(country: string): string {
    const formatters: Record<string, Intl.NumberFormat> = {
      CR: new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }),
      MX: new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }),
      CO: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }),
      BR: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }),
      US: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })
    };

    const formatter = formatters[country] || formatters.US;
    return formatter.format(this.amount);
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
