/**
 * Constantes de tiempo para la aplicación
 * Todos los valores están en milisegundos
 */

export const TIMEOUTS = {
  // Auto-save
  AUTO_SAVE_DELAY: 1000,
  SAVED_STATUS_DISPLAY: 3000,
  
  // Notificaciones
  NOTIFICATION_REFRESH: 30000, // 30 segundos
  RETRY_BASE_DELAY: 1000,
  
  // Delivery times por canal
  WHATSAPP_DELIVERY_MIN: 1000,
  WHATSAPP_DELIVERY_MAX: 3000,
  EMAIL_DELIVERY_MIN: 3000,
  EMAIL_DELIVERY_MAX: 8000,
  PUSH_DELIVERY_MIN: 500,
  PUSH_DELIVERY_MAX: 1500,
  
  // Read delays por canal
  WHATSAPP_READ_MIN: 30000, // 30 segundos
  WHATSAPP_READ_MAX: 300000, // 5 minutos
  EMAIL_READ_MIN: 300000, // 5 minutos
  EMAIL_READ_MAX: 3600000, // 1 hora
  PUSH_READ_MIN: 10000, // 10 segundos
  PUSH_READ_MAX: 120000, // 2 minutos
  
  // Recordatorios de entrevista
  INTERVIEW_REMINDER_24H: 24 * 60 * 60 * 1000,
  INTERVIEW_REMINDER_2H: 2 * 60 * 60 * 1000,
} as const;

export const DURATIONS = {
  ONE_SECOND_MS: 1000,
  ONE_MINUTE_MS: 60 * 1000,
  ONE_HOUR_MS: 60 * 60 * 1000,
  ONE_DAY_MS: 24 * 60 * 60 * 1000,
  ONE_WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  THIRTY_DAYS_MS: 30 * 24 * 60 * 60 * 1000,
} as const;

export const SUCCESS_RATES = {
  WHATSAPP: 0.95, // 95% éxito
  EMAIL: 0.90,    // 90% éxito
  PUSH: 0.85,     // 85% éxito
} as const;

export const URGENCY_MULTIPLIERS = {
  STATUS_CHANGE: 0.5,
  INTERVIEW_REMINDER: 0.3,
  DEADLINE_ALERT: 0.2,
  FEEDBACK_AVAILABLE: 1.0,
  DOCUMENT_REQUEST: 0.8,
} as const;
