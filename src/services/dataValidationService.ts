/**
 * Servicio de Validación de Integridad de Datos
 * Valida la consistencia e integridad de datos críticos del sistema
 */

import { dataService } from './dataService';
import { auditService } from './auditService';
import { applicationService } from './supabase/applicationService';
import type { Application, ApplicationStatus } from '../types/application';
import type { AcceptanceData } from '../types/tracking';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  validate: (data: any) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface DataIntegrityReport {
  applicationId: string;
  timestamp: Date;
  overallStatus: 'valid' | 'warnings' | 'errors';
  validationResults: {
    ruleId: string;
    ruleName: string;
    result: ValidationResult;
  }[];
  summary: {
    totalRules: number;
    passedRules: number;
    failedRules: number;
    warningRules: number;
  };
  recommendations: string[];
}

class DataValidationService {
  private validationRules: Map<string, ValidationRule> = new Map();

  constructor() {
    this.initializeValidationRules();
  }

  /**
   * Valida integridad de datos antes de persistir
   */
  async validateBeforePersist(data: any, dataType: string): Promise<ValidationResult> {
    console.log(`🔍 Validando datos antes de persistir: ${dataType}`);

    try {
      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: []
      };

      // Aplicar reglas específicas según el tipo de datos
      const applicableRules = this.getApplicableRules(dataType);

      for (const rule of applicableRules) {
        const ruleResult = rule.validate(data);
        
        result.errors.push(...ruleResult.errors);
        result.warnings.push(...ruleResult.warnings);

        if (!ruleResult.isValid) {
          result.isValid = false;
        }
      }

      // Log resultado
      if (!result.isValid) {
        console.error(`❌ Validación falló para ${dataType}:`, result.errors);
        
        // Registrar en auditoría
        await auditService.logStateChange(
          data.applicationId || 'unknown',
          'validation_pending',
          'validation_failed',
          `Validación falló: ${result.errors.map(e => e.message).join(', ')}`
        );
      } else if (result.warnings.length > 0) {
        console.warn(`⚠️ Validación con advertencias para ${dataType}:`, result.warnings);
      } else {
        console.log(`✅ Validación exitosa para ${dataType}`);
      }

      return result;

    } catch (error) {
      console.error('❌ Error durante validación:', error);
      return {
        isValid: false,
        errors: [{
          field: 'system',
          message: `Error interno de validación: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          code: 'VALIDATION_ERROR'
        }],
        warnings: []
      };
    }
  }

  /**
   * Detecta inconsistencias en los datos
   */
  async detectInconsistencies(applicationId: string): Promise<string[]> {
    console.log(`🔍 Detectando inconsistencias para aplicación: ${applicationId}`);

    const inconsistencies: string[] = [];

    try {
      const application = await dataService.getApplication(applicationId);
      if (!application) {
        inconsistencies.push('Aplicación no encontrada');
        return inconsistencies;
      }

      // Verificar consistencia de estados
      const stateInconsistencies = await this.checkStateConsistency(application);
      inconsistencies.push(...stateInconsistencies);

      // Verificar consistencia de fechas
      const dateInconsistencies = await this.checkDateConsistency(application);
      inconsistencies.push(...dateInconsistencies);

      // Verificar consistencia de ofertas
      const offerInconsistencies = await this.checkOfferConsistency(application);
      inconsistencies.push(...offerInconsistencies);

      // Verificar consistencia de seguimiento
      const trackingInconsistencies = await this.checkTrackingConsistency(application);
      inconsistencies.push(...trackingInconsistencies);

      if (inconsistencies.length > 0) {
        console.warn(`⚠️ ${inconsistencies.length} inconsistencias detectadas`);
        
        // Registrar en auditoría
        await auditService.logStateChange(
          applicationId,
          'consistent',
          'inconsistent',
          `Inconsistencias detectadas: ${inconsistencies.join(', ')}`
        );
      } else {
        console.log('✅ No se detectaron inconsistencias');
      }

      return inconsistencies;

    } catch (error) {
      console.error('❌ Error detectando inconsistencias:', error);
      return [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`];
    }
  }

  /**
   * Genera reporte completo de integridad de datos
   */
  async generateIntegrityReport(applicationId: string): Promise<DataIntegrityReport> {
    console.log(`📊 Generando reporte de integridad para aplicación: ${applicationId}`);

    try {
      const application = await dataService.getApplication(applicationId);
      if (!application) {
        throw new Error('Aplicación no encontrada');
      }

      const validationResults: DataIntegrityReport['validationResults'] = [];
      let passedRules = 0;
      let failedRules = 0;
      let warningRules = 0;

      // Ejecutar todas las reglas de validación
      for (const rule of this.validationRules.values()) {
        const result = rule.validate(application);
        
        validationResults.push({
          ruleId: rule.id,
          ruleName: rule.name,
          result
        });

        if (result.isValid && result.warnings.length === 0) {
          passedRules++;
        } else if (!result.isValid) {
          failedRules++;
        } else {
          warningRules++;
        }
      }

      // Determinar estado general
      let overallStatus: 'valid' | 'warnings' | 'errors' = 'valid';
      if (failedRules > 0) {
        overallStatus = 'errors';
      } else if (warningRules > 0) {
        overallStatus = 'warnings';
      }

      // Generar recomendaciones
      const recommendations = await this.generateRecommendations(validationResults);

      const report: DataIntegrityReport = {
        applicationId,
        timestamp: new Date(),
        overallStatus,
        validationResults,
        summary: {
          totalRules: this.validationRules.size,
          passedRules,
          failedRules,
          warningRules
        },
        recommendations
      };

      console.log(`✅ Reporte generado: ${overallStatus} (${passedRules}/${this.validationRules.size} reglas pasaron)`);

      return report;

    } catch (error) {
      console.error('❌ Error generando reporte de integridad:', error);
      throw error;
    }
  }

  /**
   * Valida datos de aceptación de propuesta
   */
  async validateProposalAcceptance(
    applicationId: string,
    acceptanceData: AcceptanceData
  ): Promise<ValidationResult> {
    console.log(`🔍 Validando aceptación de propuesta: ${applicationId}`);

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    try {
      const application = await dataService.getApplication(applicationId);
      if (!application) {
        result.isValid = false;
        result.errors.push({
          field: 'applicationId',
          message: 'Aplicación no encontrada',
          code: 'APPLICATION_NOT_FOUND',
          value: applicationId
        });
        return result;
      }

      // Validar fecha de aceptación
      if (!acceptanceData.acceptedAt) {
        result.errors.push({
          field: 'acceptedAt',
          message: 'Fecha de aceptación es requerida',
          code: 'REQUIRED_FIELD'
        });
        result.isValid = false;
      } else if (acceptanceData.acceptedAt > new Date()) {
        result.errors.push({
          field: 'acceptedAt',
          message: 'Fecha de aceptación no puede ser en el futuro',
          code: 'INVALID_DATE',
          value: acceptanceData.acceptedAt
        });
        result.isValid = false;
      }

      // Validar estado de la aplicación
      if (application.status !== 'offer_pending') {
        result.errors.push({
          field: 'status',
          message: `Estado de aplicación inválido para aceptación: ${application.status}`,
          code: 'INVALID_STATUS',
          value: application.status
        });
        result.isValid = false;
      }

      // Validar oferta no expirada
      if (application.offerDetails?.expiresAt && 
          new Date(application.offerDetails.expiresAt) < acceptanceData.acceptedAt) {
        result.errors.push({
          field: 'offerDetails.expiresAt',
          message: 'La oferta ha expirado',
          code: 'OFFER_EXPIRED',
          value: application.offerDetails.expiresAt
        });
        result.isValid = false;
      }

      // Validar notas del candidato (opcional pero con límites)
      if (acceptanceData.candidateNotes && acceptanceData.candidateNotes.length > 1000) {
        result.warnings.push({
          field: 'candidateNotes',
          message: 'Notas del candidato son muy largas (>1000 caracteres)',
          code: 'FIELD_TOO_LONG',
          value: acceptanceData.candidateNotes.length
        });
      }

      // Validar términos negociados
      if (acceptanceData.negotiatedTerms) {
        const termsValidation = this.validateNegotiatedTerms(acceptanceData.negotiatedTerms);
        result.errors.push(...termsValidation.errors);
        result.warnings.push(...termsValidation.warnings);
        if (!termsValidation.isValid) {
          result.isValid = false;
        }
      }

      return result;

    } catch (error) {
      console.error('❌ Error validando aceptación de propuesta:', error);
      return {
        isValid: false,
        errors: [{
          field: 'system',
          message: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`,
          code: 'VALIDATION_ERROR'
        }],
        warnings: []
      };
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Inicializa las reglas de validación
   */
  private initializeValidationRules(): void {
    // Regla: Estado de aplicación válido
    this.validationRules.set('valid_status', {
      id: 'valid_status',
      name: 'Estado de Aplicación Válido',
      description: 'Verifica que el estado de la aplicación sea válido',
      severity: 'critical',
      validate: (application: Application) => {
        const validStatuses: ApplicationStatus[] = [
          'active', 'screening', 'interview_scheduled', 'interview_completed',
          'technical_evaluation', 'reference_check', 'finalist', 'background_check',
          'offer_pending', 'offer_accepted', 'offer_declined', 'offer_negotiating',
          'approved', 'hired', 'rejected', 'withdrawn', 'on_hold', 'expired'
        ];

        const isValid = validStatuses.includes(application.status);
        
        return {
          isValid,
          errors: isValid ? [] : [{
            field: 'status',
            message: `Estado inválido: ${application.status}`,
            code: 'INVALID_STATUS',
            value: application.status
          }],
          warnings: []
        };
      }
    });

    // Regla: Fechas consistentes
    this.validationRules.set('consistent_dates', {
      id: 'consistent_dates',
      name: 'Fechas Consistentes',
      description: 'Verifica que las fechas sean lógicamente consistentes',
      severity: 'critical',
      validate: (application: Application) => {
        const errors: ValidationError[] = [];
        
        if (application.lastUpdate < application.appliedDate) {
          errors.push({
            field: 'lastUpdate',
            message: 'Fecha de última actualización no puede ser anterior a fecha de aplicación',
            code: 'INVALID_DATE_ORDER'
          });
        }

        if (application.interviewDate && application.interviewDate < application.appliedDate) {
          errors.push({
            field: 'interviewDate',
            message: 'Fecha de entrevista no puede ser anterior a fecha de aplicación',
            code: 'INVALID_DATE_ORDER'
          });
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings: []
        };
      }
    });

    // Regla: Exclusividad válida
    this.validationRules.set('valid_exclusivity', {
      id: 'valid_exclusivity',
      name: 'Exclusividad Válida',
      description: 'Verifica que el estado de exclusividad sea consistente',
      severity: 'warning',
      validate: (application: Application) => {
        const warnings: ValidationWarning[] = [];
        
        const exclusiveStates: ApplicationStatus[] = ['offer_accepted', 'approved', 'hired'];
        const isExclusiveState = exclusiveStates.includes(application.status);
        
        if (isExclusiveState && application.exclusivityStatus !== 'exclusive') {
          warnings.push({
            field: 'exclusivityStatus',
            message: `Estado ${application.status} debería tener exclusivityStatus 'exclusive'`,
            code: 'INCONSISTENT_EXCLUSIVITY'
          });
        }

        if (!isExclusiveState && application.exclusivityStatus === 'exclusive') {
          warnings.push({
            field: 'exclusivityStatus',
            message: `Estado ${application.status} no debería tener exclusivityStatus 'exclusive'`,
            code: 'INCONSISTENT_EXCLUSIVITY'
          });
        }

        return {
          isValid: true,
          errors: [],
          warnings
        };
      }
    });

    // Regla: Oferta válida
    this.validationRules.set('valid_offer', {
      id: 'valid_offer',
      name: 'Oferta Válida',
      description: 'Verifica que los detalles de la oferta sean válidos',
      severity: 'critical',
      validate: (application: Application) => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        if (application.status === 'offer_pending' || application.status === 'offer_accepted') {
          if (!application.offerDetails) {
            errors.push({
              field: 'offerDetails',
              message: 'Detalles de oferta requeridos para estado de oferta',
              code: 'MISSING_OFFER_DETAILS'
            });
          } else {
            if (!application.offerDetails.salary || application.offerDetails.salary <= 0) {
              errors.push({
                field: 'offerDetails.salary',
                message: 'Salario debe ser mayor a 0',
                code: 'INVALID_SALARY',
                value: application.offerDetails.salary
              });
            }

            if (application.offerDetails.expiresAt && 
                application.offerDetails.expiresAt <= application.offerDetails.offeredAt) {
              errors.push({
                field: 'offerDetails.expiresAt',
                message: 'Fecha de expiración debe ser posterior a fecha de oferta',
                code: 'INVALID_DATE_ORDER'
              });
            }
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings
        };
      }
    });

    console.log(`✅ ${this.validationRules.size} reglas de validación inicializadas`);
  }

  /**
   * Obtiene reglas aplicables para un tipo de datos
   */
  private getApplicableRules(_dataType: string): ValidationRule[] {
    // En implementación real, esto sería más sofisticado
    return Array.from(this.validationRules.values());
  }

  /**
   * Verifica consistencia de estados
   */
  private async checkStateConsistency(application: Application): Promise<string[]> {
    const inconsistencies: string[] = [];

    // Verificar transiciones de estado válidas
    const trackingHistory = await applicationService.getTrackingHistory(application.id);
    const stateChanges = trackingHistory
      .filter(event => event.eventType === 'status_changed')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    for (let i = 1; i < stateChanges.length; i++) {
      const prevEvent = stateChanges[i - 1];
      const currEvent = stateChanges[i];

      if (!this.isValidStateTransition(
        prevEvent.details.toState,
        currEvent.details.fromState
      )) {
        inconsistencies.push(
          `Transición de estado inválida: ${prevEvent.details.toState} → ${currEvent.details.fromState}`
        );
      }
    }

    return inconsistencies;
  }

  /**
   * Verifica consistencia de fechas
   */
  private async checkDateConsistency(application: Application): Promise<string[]> {
    const inconsistencies: string[] = [];

    if (application.lastUpdate < application.appliedDate) {
      inconsistencies.push('Fecha de última actualización anterior a fecha de aplicación');
    }

    if (application.interviewDate && application.interviewDate < application.appliedDate) {
      inconsistencies.push('Fecha de entrevista anterior a fecha de aplicación');
    }

    return inconsistencies;
  }

  /**
   * Verifica consistencia de ofertas
   */
  private async checkOfferConsistency(application: Application): Promise<string[]> {
    const inconsistencies: string[] = [];

    if ((application.status === 'offer_pending' || application.status === 'offer_accepted') && 
        !application.offerDetails) {
      inconsistencies.push('Estado de oferta sin detalles de oferta');
    }

    if (application.offerDetails?.expiresAt && 
        application.offerDetails.expiresAt <= application.offerDetails.offeredAt) {
      inconsistencies.push('Fecha de expiración de oferta inválida');
    }

    return inconsistencies;
  }

  /**
   * Verifica consistencia de seguimiento
   */
  private async checkTrackingConsistency(application: Application): Promise<string[]> {
    const inconsistencies: string[] = [];

    if (application.status === 'offer_accepted' && !application.lastTrackingUpdate) {
      inconsistencies.push('Oferta aceptada sin actualización de seguimiento');
    }

    return inconsistencies;
  }

  /**
   * Valida términos negociados
   */
  private validateNegotiatedTerms(terms: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (terms.salary && terms.salary <= 0) {
      result.errors.push({
        field: 'negotiatedTerms.salary',
        message: 'Salario negociado debe ser mayor a 0',
        code: 'INVALID_SALARY',
        value: terms.salary
      });
      result.isValid = false;
    }

    if (terms.startDate && terms.startDate < new Date()) {
      result.warnings.push({
        field: 'negotiatedTerms.startDate',
        message: 'Fecha de inicio negociada es en el pasado',
        code: 'PAST_DATE',
        value: terms.startDate
      });
    }

    return result;
  }

  /**
   * Verifica si una transición de estado es válida
   */
  private isValidStateTransition(fromState: string, toState: string): boolean {
    // Definir transiciones válidas (simplificado)
    const validTransitions: Record<string, string[]> = {
      'offer_pending': ['offer_accepted', 'offer_declined', 'expired'],
      'offer_accepted': ['approved', 'background_check'],
      'approved': ['hired'],
      'background_check': ['approved', 'rejected']
    };

    return validTransitions[fromState]?.includes(toState) ?? true;
  }

  /**
   * Genera recomendaciones basadas en resultados de validación
   */
  private async generateRecommendations(
    validationResults: DataIntegrityReport['validationResults']
  ): Promise<string[]> {
    const recommendations: string[] = [];

    for (const result of validationResults) {
      if (!result.result.isValid) {
        recommendations.push(`Corregir errores en regla: ${result.ruleName}`);
      } else if (result.result.warnings.length > 0) {
        recommendations.push(`Revisar advertencias en regla: ${result.ruleName}`);
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Todos los datos están íntegros y consistentes');
    }

    return recommendations;
  }
}

// Exportar instancia singleton
export const dataValidationService = new DataValidationService();