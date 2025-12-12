/**
 * Servicio de Datos Centralizado
 * Maneja automáticamente el modo (Supabase o Mock)
 * Toda la aplicación usa este servicio único
 */

import { isSupabaseConfigured } from '../lib/supabase';
import { profileService } from './supabase/profileService';
import { applicationService } from './supabase/applicationService';
import { mockProfile, mockBadges, getAllMockApplications, addMockApplication, findMockApplicationById } from './mock/mockData';
import type { Profile, Badge } from '../types/profile';
import type { Application } from '../types/application';
import type { JobOffer } from '../types/salary';

class DataService {
  private mode: 'supabase' | 'mock' = 'mock';

  constructor() {
    this.detectMode();
  }

  /**
   * Detectar modo de operación
   */
  private detectMode() {
    this.mode = isSupabaseConfigured() ? 'supabase' : 'mock';
    console.log(`🔧 Modo de datos: ${this.mode.toUpperCase()}`);
  }

  /**
   * Verificar si está en modo Supabase
   */
  isSupabaseMode(): boolean {
    return this.mode === 'supabase';
  }

  /**
   * Obtener usuario actual (con fallback)
   */
  getCurrentUserId(): string {
    // Intentar obtener del almacenamiento local o sesión
    try {
      const user = localStorage.getItem('supabase.auth.token');
      if (user) return JSON.parse(user).currentSession?.user?.id || 'mock-user';
      return 'mock-user';
    } catch {
      return 'mock-user';
    }
  }

  // ==================== PERFILES ====================

  /**
   * Obtener perfil del usuario
   */
  async getProfile(userId: string): Promise<Profile | null> {
    if (this.mode === 'supabase') {
      return await profileService.getProfile(userId);
    }
    return mockProfile;
  }

  /**
   * Guardar perfil
   */
  async saveProfile(userId: string, profile: Profile): Promise<void> {
    if (this.mode === 'supabase') {
      await profileService.upsertProfile(userId, profile);
      console.log('✅ Perfil guardado en Supabase');
    } else {
      console.log('📦 Mock mode: Perfil no guardado');
    }
  }

  // ==================== APLICACIONES ====================

  /**
   * Obtener todas las aplicaciones
   */
  async getApplications(candidateId: string): Promise<Application[]> {
    if (this.mode === 'supabase') {
      return await applicationService.getApplications(candidateId);
    }
    return getAllMockApplications();
  }

  /**
   * Obtener una aplicación específica
   */
  async getApplication(applicationId: string): Promise<Application | null> {
    if (this.mode === 'supabase') {
      return await applicationService.getApplication(applicationId);
    }
    return findMockApplicationById(applicationId) || null;
  }

  /**
   * Crear nueva aplicación
   */
  async createApplication(application: Omit<Application, 'id'>): Promise<Application> {
    if (this.mode === 'supabase') {
      return await applicationService.createApplication(application);
    }
    // En modo mock, agregamos la aplicación al estado runtime
    const newApp = { ...application, id: `app-${Date.now()}` } as Application;
    addMockApplication(newApp);
    console.log('✅ Mock mode: Aplicación agregada al estado runtime');
    return newApp;
  }

  /**
   * Actualizar aplicación
   */
  async updateApplication(applicationId: string, updates: Partial<Application>): Promise<void> {
    if (this.mode === 'supabase') {
      await applicationService.updateApplication(applicationId, updates);
      console.log('✅ Aplicación actualizada en Supabase');
    } else {
      console.log('📦 Mock mode: Aplicación no actualizada');
    }
  }

  // ==================== BADGES ====================

  /**
   * Obtener badges del usuario
   */
  async getBadges(profileId: string): Promise<Badge[]> {
    if (this.mode === 'supabase') {
      const { badgeService } = await import('./supabase/badgeService');
      return await badgeService.getBadges(profileId);
    }
    return mockBadges;
  }

  // ==================== OFERTAS ====================

  /**
   * Obtener ofertas del candidato
   */
  async getOffers(candidateId: string): Promise<JobOffer[]> {
    if (this.mode === 'supabase') {
      const { offerService } = await import('./supabase/offerService');
      return await offerService.getOffers(candidateId);
    }
    return [];
  }

  /**
   * Actualizar estado de una oferta
   */
  async updateOfferStatus(offerId: string, status: string): Promise<void> {
    if (this.mode === 'supabase') {
      const { offerService } = await import('./supabase/offerService');
      await offerService.updateOfferStatus(offerId, status);
    }
  }

  // ==================== MÉTODOS DE ACEPTACIÓN DE PROPUESTAS ====================

  /**
   * Acepta una propuesta laboral
   */
  async acceptProposal(proposalId: string, candidateId: string, acceptanceData: any): Promise<any> {
    const { proposalAcceptanceService } = await import('./proposalAcceptanceService');
    return await proposalAcceptanceService.acceptProposal(proposalId, candidateId, acceptanceData);
  }

  /**
   * Obtiene historial de seguimiento
   */
  async getTrackingHistory(applicationId: string): Promise<any[]> {
    const { trackingHistoryService } = await import('./trackingHistoryService');
    return await trackingHistoryService.getTrackingHistory(applicationId);
  }

  /**
   * Envía notificación de aceptación
   */
  async sendAcceptanceNotification(recipientType: 'candidate' | 'recruiter', recipientId: string, notificationData: any): Promise<any> {
    const { notificationService } = await import('./notificationService');
    return await notificationService.sendOfferAcceptanceNotification(recipientType, recipientId, notificationData);
  }

  /**
   * Programa recordatorios automáticos
   */
  async scheduleReminders(applicationId: string, nextStages: any[]): Promise<void> {
    const { reminderService } = await import('./reminderService');
    return await reminderService.scheduleFollowUpReminders(applicationId, nextStages);
  }

  /**
   * Registra auditoría de aceptación
   */
  async logAcceptanceAudit(auditData: any): Promise<void> {
    const { auditService } = await import('./auditService');
    return await auditService.logOfferAcceptance(auditData);
  }

  /**
   * Valida integridad de datos
   */
  async validateDataIntegrity(applicationId: string): Promise<any> {
    const { dataValidationService } = await import('./dataValidationService');
    return await dataValidationService.generateIntegrityReport(applicationId);
  }
}

// Exportar instancia singleton
export const dataService = new DataService();
