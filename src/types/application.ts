// Application & Tracking Types

import type { AcceptanceHistoryEntry, TrackingEvent } from './tracking';

export type ApplicationStatus = 
  // Fase 1: Proceso Inicial (Múltiples postulaciones permitidas)
  | 'active'                    // Postulación activa en proceso
  | 'screening'                 // En revisión inicial de CV
  | 'interview_scheduled'       // Entrevista agendada
  | 'interview_completed'       // Entrevista completada, esperando decisión
  | 'technical_evaluation'      // En evaluación técnica
  | 'reference_check'           // Verificación de referencias
  
  // Fase 2: Pre-Oferta (Múltiples postulaciones aún permitidas)
  | 'finalist'                  // Finalista, empresa está decidiendo
  | 'background_check'          // Verificación de antecedentes
  
  // Fase 3: Oferta (PUNTO CRÍTICO - Solo una postulación después de aceptar)
  | 'offer_pending'             // Oferta formal pendiente de respuesta
  | 'offer_accepted'            // ⚠️ OFERTA ACEPTADA - Solo puede tener UNA en este estado
  | 'offer_declined'            // Oferta rechazada por el candidato
  | 'offer_negotiating'         // Negociando términos de la oferta
  
  // Fase 4: Estados Finales
  | 'approved'                  // Aprobado para contratación (después de aceptar oferta)
  | 'hired'                     // Contratado (proceso completado)
  | 'rejected'                  // Rechazado por la empresa
  | 'withdrawn'                 // Retirado por el candidato
  | 'on_hold'                   // En espera (empresa pausó el proceso)
  | 'expired';                  // Oferta expiró sin respuesta

export type StageStatus = 
  | 'pending'               // Pendiente de iniciar
  | 'in_progress'           // En progreso
  | 'completed'             // Completado exitosamente
  | 'rejected'              // Rechazado en esta etapa
  | 'scheduled'             // Agendado (para entrevistas)
  | 'awaiting_feedback'     // Esperando retroalimentación
  | 'under_review'          // Bajo revisión por la empresa
  | 'awaiting_candidate'    // Esperando acción del candidato
  | 'awaiting_company'      // Esperando decisión de la empresa
  | 'passed'                // Pasó esta etapa exitosamente
  | 'failed';               // No pasó esta etapa

export interface RecruiterInfo {
  id: string;
  name: string;
  avatar: string;
  title: string;
}

export interface Recommendation {
  id: string;
  skill: string;
  resource: string;
  resourceUrl: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TestResult {
  id: string;
  type: 'technical' | 'psychometric' | 'personality' | 'skills' | 'cognitive';
  name: string;
  score: number;
  maxScore: number;
  percentile?: number;
  completedAt: Date;
  details?: {
    category: string;
    score: number;
    feedback?: string;
  }[];
  certificateUrl?: string;
}

export interface StageFeedback {
  category: string;
  aiExplanation: string;
  recommendations: Recommendation[];
}

export interface Stage {
  id: string;
  name: string;
  order: number;
  status: StageStatus;
  recruiter?: RecruiterInfo;
  estimatedDays: number;
  actualDays?: number;
  score?: number;
  startDate: Date;
  endDate?: Date;
  feedback?: StageFeedback;
  testResults?: TestResult[];  // Resultados de pruebas técnicas/psicométricas
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  company: string;
  position: string;
  availablePositions: number;
  status: ApplicationStatus;
  stages: Stage[];
  currentStageId: string;
  appliedDate: Date;
  lastUpdate: Date;
  finalScore?: number;
  interviewDate?: Date;
  interviewConfirmed: boolean;
  offerDetails?: OfferDetails;
  isExclusive?: boolean; // True si esta es la única postulación activa permitida
  
  // Nuevos campos para seguimiento
  acceptanceHistory?: AcceptanceHistoryEntry[];
  trackingEvents?: TrackingEvent[];
  exclusivityStatus?: 'none' | 'exclusive' | 'withdrawn';
  lastTrackingUpdate?: Date;
}

export interface OfferDetails {
  offeredAt: Date;
  expiresAt: Date;
  salary: number;
  currency: string;
  benefits: string[];
  startDate?: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
  declineReason?: string;
}

// Estados que permiten múltiples postulaciones activas
export const MULTI_APPLICATION_STATES: ApplicationStatus[] = [
  'active',
  'screening',
  'interview_scheduled',
  'interview_completed',
  'technical_evaluation',
  'reference_check',
  'finalist',
  'background_check',
  'offer_negotiating',
];

// Estados que requieren exclusividad (solo una postulación)
export const EXCLUSIVE_STATES: ApplicationStatus[] = [
  'offer_accepted',
  'approved',
  'hired',
];

// Estados finales (proceso terminado)
export const FINAL_STATES: ApplicationStatus[] = [
  'hired',
  'rejected',
  'withdrawn',
  'expired',
  'offer_declined',
];

// Función para verificar si un candidato puede tener múltiples postulaciones activas
export const canHaveMultipleApplications = (applications: Application[]): boolean => {
  // Si tiene alguna aplicación en estado exclusivo, no puede tener otras activas
  const hasExclusiveApplication = applications.some(app => 
    EXCLUSIVE_STATES.includes(app.status)
  );
  
  return !hasExclusiveApplication;
};

// Función para verificar si una aplicación está en estado crítico
export const isInCriticalState = (status: ApplicationStatus): boolean => {
  return status === 'offer_pending' || EXCLUSIVE_STATES.includes(status);
};

// Función para obtener el label en español del estado
export const getStatusLabel = (status: ApplicationStatus): string => {
  const labels: Record<ApplicationStatus, string> = {
    active: 'Activa',
    screening: 'Revisión de CV',
    interview_scheduled: 'Entrevista Agendada',
    interview_completed: 'Entrevista Completada',
    technical_evaluation: 'Evaluación Técnica',
    reference_check: 'Verificación de Referencias',
    finalist: 'Finalista',
    background_check: 'Verificación de Antecedentes',
    offer_pending: 'Oferta Pendiente',
    offer_accepted: 'Oferta Aceptada',
    offer_declined: 'Oferta Rechazada',
    offer_negotiating: 'Negociando Oferta',
    approved: 'Aprobado',
    hired: 'Contratado',
    rejected: 'Rechazado',
    withdrawn: 'Retirado',
    on_hold: 'En Espera',
    expired: 'Expirado',
  };
  
  return labels[status] || status;
};

// Función para obtener el color del estado
export const getStatusColor = (status: ApplicationStatus): string => {
  if (EXCLUSIVE_STATES.includes(status)) {
    return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
  }
  
  if (FINAL_STATES.includes(status)) {
    if (status === 'hired') {
      return 'text-success-600 bg-success-100 dark:text-success-400 dark:bg-success-900/30';
    }
    if (status === 'rejected' || status === 'expired') {
      return 'text-danger-600 bg-danger-100 dark:text-danger-400 dark:bg-danger-900/30';
    }
    return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800';
  }
  
  if (status === 'offer_pending') {
    return 'text-warning-600 bg-warning-100 dark:text-warning-400 dark:bg-warning-900/30';
  }
  
  return 'text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-900/30';
};
