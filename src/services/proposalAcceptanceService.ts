/**
 * Servicio de Aceptación de Propuestas
 * Orquesta el proceso completo de aceptación de ofertas laborales
 */

import { dataService } from './dataService';
import type {
  ProposalAcceptanceService,
  AcceptanceData,
  AcceptanceResult,
  ValidationResult,
  TransactionStep,
  TransactionContext,
  TrackingEvent
} from '../types/tracking';
import type { Application, ApplicationStatus } from '../types/application';

class ProposalAcceptanceServiceImpl implements ProposalAcceptanceService {
  private transactionContext: TransactionContext | null = null;

  /**
   * Acepta una propuesta laboral y ejecuta todo el flujo de seguimiento
   */
  async acceptProposal(
    proposalId: string,
    candidateId: string,
    acceptanceData: AcceptanceData
  ): Promise<AcceptanceResult> {
    console.log(`🎯 Iniciando aceptación de propuesta ${proposalId} para candidato ${candidateId}`);

    try {
      // 1. Validar la propuesta antes de proceder
      const validation = await this.validateAcceptance(proposalId, candidateId);
      if (!validation.isValid) {
        return {
          success: false,
          acceptanceId: '',
          updatedApplication: {} as Application,
          notifications: [],
          errors: validation.errors
        };
      }

      // 2. Inicializar contexto de transacción
      this.transactionContext = {
        steps: [],
        currentStep: 0,
        rollbackExecuted: false
      };

      // 3. Ejecutar transacción completa
      const result = await this.executeAcceptanceTransaction(proposalId, candidateId, acceptanceData);

      console.log(`✅ Propuesta ${proposalId} aceptada exitosamente`);
      return result;

    } catch (error) {
      console.error(`❌ Error aceptando propuesta ${proposalId}:`, error);

      // Ejecutar rollback si hay contexto de transacción
      if (this.transactionContext && !this.transactionContext.rollbackExecuted) {
        await this.executeRollback();
      }

      return {
        success: false,
        acceptanceId: '',
        updatedApplication: {} as Application,
        notifications: [],
        errors: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`]
      };
    }
  }

  /**
   * Valida si una propuesta puede ser aceptada
   */
  async validateAcceptance(proposalId: string, candidateId: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Verificar que la propuesta existe
      const applications = await dataService.getApplications(candidateId);
      const targetApplication = applications.find(app =>
        app.offerDetails && app.id === proposalId
      );

      if (!targetApplication) {
        errors.push('La propuesta especificada no existe o no pertenece al candidato');
        return { isValid: false, errors, warnings };
      }

      // 2. Verificar estado de la aplicación
      if (targetApplication.status !== 'offer_pending') {
        errors.push(`La propuesta no está en estado pendiente. Estado actual: ${targetApplication.status}`);
      }

      // 3. Verificar que la oferta no ha expirado
      if (targetApplication.offerDetails?.expiresAt &&
        new Date(targetApplication.offerDetails.expiresAt) < new Date()) {
        errors.push('La oferta ha expirado y no puede ser aceptada');
      }

      // 4. Verificar exclusividad - si ya tiene una oferta aceptada
      const hasAcceptedOffer = applications.some(app =>
        app.status === 'offer_accepted' && app.id !== proposalId
      );

      if (hasAcceptedOffer) {
        errors.push('Ya tienes una oferta aceptada. No puedes aceptar múltiples ofertas simultáneamente');
      }

      // 5. Advertencias (no bloquean la aceptación)
      const pendingOffers = applications.filter(app =>
        app.status === 'offer_pending' && app.id !== proposalId
      );

      if (pendingOffers.length > 0) {
        warnings.push(`Tienes ${pendingOffers.length} ofertas pendientes que serán automáticamente retiradas`);
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Error validando aceptación:', error);
      return {
        isValid: false,
        errors: ['Error interno validando la propuesta'],
        warnings
      };
    }
  }

  /**
   * Ejecuta la transacción completa de aceptación
   */
  private async executeAcceptanceTransaction(
    proposalId: string,
    candidateId: string,
    acceptanceData: AcceptanceData
  ): Promise<AcceptanceResult> {
    const acceptanceId = `acceptance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let updatedApplication: Application = {} as Application;
    const notifications: any[] = [];

    // Paso 1: Actualizar aplicación principal
    const updateMainAppStep: TransactionStep = {
      name: 'updateMainApplication',
      execute: async () => {
        console.log('📝 Actualizando aplicación principal...');

        const applications = await dataService.getApplications(candidateId);
        const application = applications.find(app => app.id === proposalId);

        if (!application) {
          throw new Error('Aplicación no encontrada');
        }

        // Actualizar estado y detalles de aceptación
        const updates: Partial<Application> = {
          status: 'offer_accepted' as ApplicationStatus,
          lastUpdate: new Date(),
          exclusivityStatus: 'exclusive',
          lastTrackingUpdate: new Date()
        };

        // Agregar detalles de aceptación a la oferta
        if (application.offerDetails) {
          updates.offerDetails = {
            ...application.offerDetails,
            acceptedAt: acceptanceData.acceptedAt
          };
        }

        // Crear entrada de historial de aceptación
        const acceptanceEntry = {
          id: acceptanceId,
          offerId: proposalId,
          acceptedAt: acceptanceData.acceptedAt,
          acceptedTerms: application.offerDetails!,
          candidateNotes: acceptanceData.candidateNotes,
          status: 'active' as const
        };

        updates.acceptanceHistory = [acceptanceEntry];

        await dataService.updateApplication(proposalId, updates);

        // Obtener aplicación actualizada
        updatedApplication = { ...application, ...updates };
        console.log('✅ Aplicación principal actualizada');
      },
      rollback: async () => {
        console.log('🔄 Revirtiendo actualización de aplicación principal...');
        await dataService.updateApplication(proposalId, {
          status: 'offer_pending' as ApplicationStatus,
          exclusivityStatus: 'none',
          acceptanceHistory: [],
          lastTrackingUpdate: new Date()
        });
      }
    };

    // Paso 2: Retirar otras aplicaciones (exclusividad)
    const withdrawOthersStep: TransactionStep = {
      name: 'withdrawOtherApplications',
      execute: async () => {
        console.log('🚫 Retirando otras aplicaciones del candidato...');
        await this.withdrawOtherApplications(candidateId, proposalId);
        console.log('✅ Otras aplicaciones retiradas');
      },
      rollback: async () => {
        console.log('🔄 Revirtiendo retiro de otras aplicaciones...');
        // En implementación real, restauraríamos los estados anteriores
        console.log('📦 Mock: Rollback de retiro de aplicaciones');
      }
    };

    // Paso 3: Crear evento de seguimiento
    const createTrackingStep: TransactionStep = {
      name: 'createTrackingEvent',
      execute: async () => {
        console.log('📊 Creando evento de seguimiento...');

        const trackingEvent: TrackingEvent = {
          id: `tracking-${Date.now()}`,
          applicationId: proposalId,
          eventType: 'offer_accepted',
          timestamp: acceptanceData.acceptedAt,
          details: {
            acceptanceId,
            candidateNotes: acceptanceData.candidateNotes,
            negotiatedTerms: acceptanceData.negotiatedTerms
          },
          triggeredBy: 'user',
          metadata: {
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
            timestamp: new Date().toISOString()
          }
        };

        if (dataService.isSupabaseMode()) {
          try {
            // Importación dinámica para evitar ciclos
            const { applicationService } = await import('./supabase/applicationService');
            await applicationService.createTrackingEntry(proposalId, trackingEvent);
          } catch (e) {
            console.error('Error guardando tracking event:', e);
          }
        } else {
          console.log('📦 Mock: Evento de seguimiento creado', trackingEvent);
        }

        console.log('✅ Evento de seguimiento creado');
      },
      rollback: async () => {
        console.log('🔄 Revirtiendo evento de seguimiento...');
        // En implementación real, eliminaríamos el evento de la BD
      }
    };

    // Agregar pasos a la transacción
    this.transactionContext!.steps = [updateMainAppStep, withdrawOthersStep, createTrackingStep];

    // Ejecutar todos los pasos
    for (let i = 0; i < this.transactionContext!.steps.length; i++) {
      this.transactionContext!.currentStep = i;
      await this.transactionContext!.steps[i].execute();
    }

    return {
      success: true,
      acceptanceId,
      updatedApplication,
      notifications,
      errors: []
    };
  }

  /**
   * Ejecuta rollback de la transacción
   */
  private async executeRollback(): Promise<void> {
    if (!this.transactionContext || this.transactionContext.rollbackExecuted) {
      return;
    }

    console.log('🔄 Ejecutando rollback de transacción...');

    try {
      // Ejecutar rollback en orden inverso
      for (let i = this.transactionContext.currentStep; i >= 0; i--) {
        await this.transactionContext.steps[i].rollback();
      }

      this.transactionContext.rollbackExecuted = true;
      console.log('✅ Rollback completado');

    } catch (rollbackError) {
      console.error('❌ Error durante rollback:', rollbackError);
      // En un sistema real, esto requeriría intervención manual
    }
  }

  /**
   * Rollback manual de una aceptación (para casos de emergencia)
   */
  async rollbackAcceptance(acceptanceId: string): Promise<void> {
    console.log(`🔄 Iniciando rollback manual de aceptación ${acceptanceId}`);

    try {
      // En implementación real, buscaríamos la aceptación por ID y revertiríamos todos los cambios
      console.log('📦 Mock: Rollback manual ejecutado');

    } catch (error) {
      console.error('❌ Error en rollback manual:', error);
      throw error;
    }
  }

  /**
   * Obtener estado de una transacción
   */
  getTransactionStatus(): TransactionContext | null {
    return this.transactionContext;
  }

  /**
   * Limpiar contexto de transacción
   */
  clearTransactionContext(): void {
    this.transactionContext = null;
  }

  /**
   * Retira todas las otras aplicaciones del candidato cuando acepta una oferta
   */
  private async withdrawOtherApplications(candidateId: string, excludeApplicationId: string): Promise<void> {
    try {
      const applications = await dataService.getApplications(candidateId);

      // Filtrar aplicaciones que deben ser retiradas
      const applicationsToWithdraw = applications.filter(app =>
        app.id !== excludeApplicationId &&
        this.shouldWithdrawApplication(app.status)
      );

      console.log(`📋 Encontradas ${applicationsToWithdraw.length} aplicaciones para retirar`);

      // Retirar cada aplicación
      for (const application of applicationsToWithdraw) {
        await this.withdrawSingleApplication(application);
      }

    } catch (error) {
      console.error('❌ Error retirando otras aplicaciones:', error);
      throw error;
    }
  }

  /**
   * Determina si una aplicación debe ser retirada basado en su estado
   */
  private shouldWithdrawApplication(status: ApplicationStatus): boolean {
    // Estados que deben ser retirados cuando se acepta otra oferta
    const withdrawableStates: ApplicationStatus[] = [
      'active',
      'screening',
      'interview_scheduled',
      'interview_completed',
      'technical_evaluation',
      'reference_check',
      'finalist',
      'background_check',
      'offer_pending',
      'offer_negotiating'
    ];

    return withdrawableStates.includes(status);
  }

  /**
   * Retira una aplicación específica
   */
  private async withdrawSingleApplication(application: Application): Promise<void> {
    try {
      console.log(`🚫 Retirando aplicación ${application.id} - ${application.company} (${application.position})`);

      const updates: Partial<Application> = {
        status: 'withdrawn' as ApplicationStatus,
        lastUpdate: new Date(),
        exclusivityStatus: 'withdrawn',
        lastTrackingUpdate: new Date()
      };

      // Crear evento de seguimiento para el retiro
      const trackingEvent: TrackingEvent = {
        id: `tracking-withdraw-${Date.now()}`,
        applicationId: application.id,
        eventType: 'application_withdrawn',
        timestamp: new Date(),
        details: {
          reason: 'Candidato aceptó otra oferta',
          withdrawnAutomatically: true
        },
        triggeredBy: 'system',
        metadata: {
          triggeredByAcceptance: true,
          timestamp: new Date().toISOString()
        }
      };

      // Agregar evento al historial de tracking
      const existingEvents = application.trackingEvents || [];
      updates.trackingEvents = [...existingEvents, trackingEvent];

      await dataService.updateApplication(application.id, updates);

      console.log(`✅ Aplicación ${application.id} retirada exitosamente`);

    } catch (error) {
      console.error(`❌ Error retirando aplicación ${application.id}:`, error);
      throw error;
    }
  }

  /**
   * Valida el estado de exclusividad de un candidato
   */
  async validateExclusivityStatus(candidateId: string): Promise<{
    canAcceptOffers: boolean;
    exclusiveApplication?: Application;
    pendingApplications: Application[];
  }> {
    try {
      const applications = await dataService.getApplications(candidateId);

      // Buscar aplicación exclusiva (oferta aceptada)
      const exclusiveApplication = applications.find(app =>
        app.status === 'offer_accepted' ||
        app.status === 'approved' ||
        app.status === 'hired'
      );

      // Contar aplicaciones pendientes
      const pendingApplications = applications.filter(app =>
        this.shouldWithdrawApplication(app.status)
      );

      return {
        canAcceptOffers: !exclusiveApplication,
        exclusiveApplication,
        pendingApplications
      };

    } catch (error) {
      console.error('❌ Error validando estado de exclusividad:', error);
      throw error;
    }
  }

  /**
   * Marca una aplicación como exclusiva
   */
  async markApplicationAsExclusive(applicationId: string): Promise<void> {
    try {
      const updates: Partial<Application> = {
        exclusivityStatus: 'exclusive',
        isExclusive: true,
        lastTrackingUpdate: new Date()
      };

      await dataService.updateApplication(applicationId, updates);
      console.log(`🎯 Aplicación ${applicationId} marcada como exclusiva`);

    } catch (error) {
      console.error(`❌ Error marcando aplicación ${applicationId} como exclusiva:`, error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const proposalAcceptanceService = new ProposalAcceptanceServiceImpl();