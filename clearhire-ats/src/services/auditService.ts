/**
 * Servicio de Auditoría
 * Maneja el registro completo de auditoría y trazabilidad del sistema
 */

import { dataService } from './dataService';
import { applicationService } from './supabase/applicationService';
import type {
  AuditService as IAuditService,
  OfferAcceptanceAudit,
  AuditEntry
} from '../types/tracking';

export interface AuditConfig {
  enableAuditLogging: boolean;
  retentionDays: number;
  logLevel: 'minimal' | 'standard' | 'detailed';
  includeMetadata: boolean;
  enableRealTimeAlerts: boolean;
}

export interface AuditQuery {
  applicationId?: string;
  eventTypes?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
  limit?: number;
  offset?: number;
}

export interface AuditSummary {
  totalEntries: number;
  entriesByType: Record<string, number>;
  entriesByUser: Record<string, number>;
  dateRange: {
    earliest: Date | null;
    latest: Date | null;
  };
  criticalEvents: AuditEntry[];
}

class AuditServiceImpl implements IAuditService {
  private auditEntries: Map<string, AuditEntry> = new Map();
  
  private config: AuditConfig = {
    enableAuditLogging: true,
    retentionDays: 365,
    logLevel: 'standard',
    includeMetadata: true,
    enableRealTimeAlerts: true
  };

  /**
   * Registra auditoría de aceptación de oferta
   */
  async logOfferAcceptance(auditData: OfferAcceptanceAudit): Promise<void> {
    if (!this.config.enableAuditLogging) {
      return;
    }

    console.log(`📋 Registrando auditoría de aceptación de oferta: ${auditData.acceptanceId}`);

    try {
      const auditEntry: AuditEntry = {
        id: `audit-acceptance-${auditData.acceptanceId}`,
        applicationId: auditData.applicationId,
        eventType: 'offer_accepted',
        timestamp: auditData.timestamp,
        userId: auditData.candidateId,
        details: {
          acceptanceId: auditData.acceptanceId,
          offerId: auditData.offerId,
          candidateId: auditData.candidateId,
          acceptedTerms: auditData.acceptedTerms,
          ipAddress: auditData.ipAddress,
          userAgent: auditData.userAgent
        },
        previousState: null,
        newState: 'offer_accepted',
        reason: 'Candidato aceptó oferta laboral'
      };

      await this.saveAuditEntry(auditEntry);
      
      // Crear evento de seguimiento relacionado
      await applicationService.createTrackingEntry(auditData.applicationId, {
        id: `tracking-audit-${auditData.acceptanceId}`,
        applicationId: auditData.applicationId,
        eventType: 'offer_accepted',
        timestamp: auditData.timestamp,
        details: {
          auditEntryId: auditEntry.id,
          acceptanceId: auditData.acceptanceId
        },
        triggeredBy: 'user',
        metadata: {
          auditLogged: true,
          ipAddress: auditData.ipAddress
        }
      });

      // Verificar si requiere alerta en tiempo real
      if (this.config.enableRealTimeAlerts && this.isCriticalEvent(auditEntry)) {
        await this.sendRealTimeAlert(auditEntry);
      }

      console.log(`✅ Auditoría de aceptación registrada: ${auditEntry.id}`);

    } catch (error) {
      console.error('❌ Error registrando auditoría de aceptación:', error);
      throw error;
    }
  }

  /**
   * Registra cambio de estado en auditoría
   */
  async logStateChange(
    applicationId: string,
    fromState: string,
    toState: string,
    reason: string
  ): Promise<void> {
    if (!this.config.enableAuditLogging) {
      return;
    }

    console.log(`📊 Registrando cambio de estado: ${fromState} → ${toState}`);

    try {
      const auditEntry: AuditEntry = {
        id: `audit-state-${applicationId}-${Date.now()}`,
        applicationId,
        eventType: 'state_changed',
        timestamp: new Date(),
        details: {
          fromState,
          toState,
          reason,
          changedAt: new Date().toISOString()
        },
        previousState: fromState,
        newState: toState,
        reason
      };

      await this.saveAuditEntry(auditEntry);

      // Crear evento de seguimiento
      await applicationService.createTrackingEntry(applicationId, {
        id: `tracking-state-${applicationId}-${Date.now()}`,
        applicationId,
        eventType: 'status_changed',
        timestamp: new Date(),
        details: {
          fromState,
          toState,
          auditEntryId: auditEntry.id
        },
        triggeredBy: 'system',
        metadata: {
          auditLogged: true,
          reason
        }
      });

      console.log(`✅ Cambio de estado registrado en auditoría: ${auditEntry.id}`);

    } catch (error) {
      console.error('❌ Error registrando cambio de estado:', error);
      throw error;
    }
  }

  /**
   * Obtiene trail de auditoría para una aplicación
   */
  async getAuditTrail(applicationId: string): Promise<AuditEntry[]> {
    console.log(`📖 Obteniendo trail de auditoría para aplicación: ${applicationId}`);

    try {
      if (dataService.isSupabaseMode()) {
        return await this.getAuditTrailFromDatabase(applicationId);
      } else {
        // Modo mock: filtrar entradas en memoria
        const entries = Array.from(this.auditEntries.values())
          .filter(entry => entry.applicationId === applicationId)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        console.log(`📦 Mock: ${entries.length} entradas de auditoría encontradas`);
        return entries;
      }

    } catch (error) {
      console.error('❌ Error obteniendo trail de auditoría:', error);
      return [];
    }
  }

  /**
   * Busca entradas de auditoría con filtros
   */
  async searchAuditEntries(query: AuditQuery): Promise<AuditEntry[]> {
    console.log('🔍 Buscando entradas de auditoría con filtros:', query);

    try {
      let entries: AuditEntry[];

      if (dataService.isSupabaseMode()) {
        entries = await this.searchAuditEntriesInDatabase(query);
      } else {
        entries = Array.from(this.auditEntries.values());
      }

      // Aplicar filtros
      entries = this.applyAuditFilters(entries, query);

      // Aplicar paginación
      if (query.offset || query.limit) {
        const offset = query.offset || 0;
        const limit = query.limit || 100;
        entries = entries.slice(offset, offset + limit);
      }

      console.log(`✅ ${entries.length} entradas encontradas`);
      return entries;

    } catch (error) {
      console.error('❌ Error buscando entradas de auditoría:', error);
      return [];
    }
  }

  /**
   * Obtiene resumen de auditoría
   */
  async getAuditSummary(applicationId?: string): Promise<AuditSummary> {
    console.log('📊 Generando resumen de auditoría');

    try {
      let entries: AuditEntry[];

      if (applicationId) {
        entries = await this.getAuditTrail(applicationId);
      } else {
        entries = Array.from(this.auditEntries.values());
      }

      const entriesByType = entries.reduce((acc, entry) => {
        acc[entry.eventType] = (acc[entry.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const entriesByUser = entries.reduce((acc, entry) => {
        if (entry.userId) {
          acc[entry.userId] = (acc[entry.userId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const timestamps = entries.map(e => e.timestamp.getTime());
      const dateRange = {
        earliest: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null,
        latest: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
      };

      const criticalEvents = entries.filter(entry => this.isCriticalEvent(entry));

      return {
        totalEntries: entries.length,
        entriesByType,
        entriesByUser,
        dateRange,
        criticalEvents
      };

    } catch (error) {
      console.error('❌ Error generando resumen de auditoría:', error);
      return {
        totalEntries: 0,
        entriesByType: {},
        entriesByUser: {},
        dateRange: { earliest: null, latest: null },
        criticalEvents: []
      };
    }
  }

  /**
   * Exporta auditoría en formato JSON
   */
  async exportAuditTrail(applicationId: string): Promise<string> {
    console.log(`📤 Exportando trail de auditoría para aplicación: ${applicationId}`);

    try {
      const auditTrail = await this.getAuditTrail(applicationId);
      const summary = await this.getAuditSummary(applicationId);

      const exportData = {
        applicationId,
        exportedAt: new Date().toISOString(),
        summary,
        auditTrail,
        metadata: {
          totalEntries: auditTrail.length,
          exportedBy: 'system', // En implementación real, obtener del contexto de usuario
          configUsed: this.config
        }
      };

      return JSON.stringify(exportData, null, 2);

    } catch (error) {
      console.error('❌ Error exportando trail de auditoría:', error);
      throw error;
    }
  }

  /**
   * Verifica integridad de datos de auditoría
   */
  async verifyAuditIntegrity(applicationId: string): Promise<{
    isValid: boolean;
    issues: string[];
    summary: {
      totalEntries: number;
      missingEntries: number;
      duplicateEntries: number;
      inconsistentStates: number;
    };
  }> {
    console.log(`🔍 Verificando integridad de auditoría para aplicación: ${applicationId}`);

    try {
      const auditTrail = await this.getAuditTrail(applicationId);
      const issues: string[] = [];
      let missingEntries = 0;
      let duplicateEntries = 0;
      let inconsistentStates = 0;

      // Verificar duplicados
      const entryIds = auditTrail.map(e => e.id);
      const uniqueIds = new Set(entryIds);
      duplicateEntries = entryIds.length - uniqueIds.size;

      if (duplicateEntries > 0) {
        issues.push(`Se encontraron ${duplicateEntries} entradas duplicadas`);
      }

      // Verificar secuencia de estados
      const stateChanges = auditTrail
        .filter(e => e.eventType === 'state_changed')
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      for (let i = 1; i < stateChanges.length; i++) {
        const prev = stateChanges[i - 1];
        const curr = stateChanges[i];

        if (prev.newState !== curr.previousState) {
          inconsistentStates++;
          issues.push(`Estado inconsistente entre ${prev.id} y ${curr.id}`);
        }
      }

      // Verificar entradas críticas faltantes
      const hasOfferAcceptance = auditTrail.some(e => e.eventType === 'offer_accepted');
      const application = await dataService.getApplication(applicationId);

      if (application?.status === 'offer_accepted' && !hasOfferAcceptance) {
        missingEntries++;
        issues.push('Falta entrada de auditoría para aceptación de oferta');
      }

      const isValid = issues.length === 0;

      console.log(`${isValid ? '✅' : '⚠️'} Verificación de integridad completada: ${issues.length} problemas encontrados`);

      return {
        isValid,
        issues,
        summary: {
          totalEntries: auditTrail.length,
          missingEntries,
          duplicateEntries,
          inconsistentStates
        }
      };

    } catch (error) {
      console.error('❌ Error verificando integridad de auditoría:', error);
      return {
        isValid: false,
        issues: [`Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        summary: {
          totalEntries: 0,
          missingEntries: 0,
          duplicateEntries: 0,
          inconsistentStates: 0
        }
      };
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Guarda entrada de auditoría
   */
  private async saveAuditEntry(entry: AuditEntry): Promise<void> {
    // Guardar en memoria (modo mock)
    this.auditEntries.set(entry.id, entry);

    // En modo Supabase, guardar en base de datos
    if (dataService.isSupabaseMode()) {
      await this.saveAuditEntryToDatabase(entry);
    } else {
      console.log('📦 Mock: Entrada de auditoría guardada', {
        id: entry.id,
        eventType: entry.eventType,
        applicationId: entry.applicationId
      });
    }
  }

  /**
   * Guarda entrada en base de datos (implementación mock)
   */
  private async saveAuditEntryToDatabase(entry: AuditEntry): Promise<void> {
    console.log('💾 Guardando entrada de auditoría en BD:', entry.id);
    // En implementación real, usar Supabase client
  }

  /**
   * Obtiene trail de auditoría desde base de datos (implementación mock)
   */
  private async getAuditTrailFromDatabase(applicationId: string): Promise<AuditEntry[]> {
    console.log('📖 Obteniendo trail desde BD para:', applicationId);
    // En implementación real, consultar Supabase
    return [];
  }

  /**
   * Busca entradas en base de datos (implementación mock)
   */
  private async searchAuditEntriesInDatabase(query: AuditQuery): Promise<AuditEntry[]> {
    console.log('🔍 Buscando en BD con query:', query);
    // En implementación real, construir query de Supabase
    return [];
  }

  /**
   * Aplica filtros a las entradas de auditoría
   */
  private applyAuditFilters(entries: AuditEntry[], query: AuditQuery): AuditEntry[] {
    let filtered = [...entries];

    if (query.applicationId) {
      filtered = filtered.filter(e => e.applicationId === query.applicationId);
    }

    if (query.eventTypes && query.eventTypes.length > 0) {
      filtered = filtered.filter(e => query.eventTypes!.includes(e.eventType));
    }

    if (query.dateFrom) {
      filtered = filtered.filter(e => e.timestamp >= query.dateFrom!);
    }

    if (query.dateTo) {
      filtered = filtered.filter(e => e.timestamp <= query.dateTo!);
    }

    if (query.userId) {
      filtered = filtered.filter(e => e.userId === query.userId);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Determina si un evento es crítico
   */
  private isCriticalEvent(entry: AuditEntry): boolean {
    const criticalEvents = ['offer_accepted', 'data_updated', 'error_occurred'];
    return criticalEvents.includes(entry.eventType);
  }

  /**
   * Envía alerta en tiempo real para eventos críticos
   */
  private async sendRealTimeAlert(entry: AuditEntry): Promise<void> {
    console.log('🚨 Enviando alerta en tiempo real para evento crítico:', entry.id);
    
    // En implementación real, enviar a sistema de alertas
    console.log('📦 Mock: Alerta enviada', {
      eventType: entry.eventType,
      applicationId: entry.applicationId,
      timestamp: entry.timestamp.toISOString()
    });
  }

  /**
   * Actualiza configuración del servicio
   */
  updateConfig(newConfig: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuración de auditoría actualizada:', this.config);
  }

  /**
   * Obtiene configuración actual
   */
  getConfig(): AuditConfig {
    return { ...this.config };
  }

  /**
   * Limpia todas las entradas de auditoría (para testing)
   */
  clearAll(): void {
    this.auditEntries.clear();
    console.log('🧹 Todas las entradas de auditoría limpiadas');
  }
}

// Exportar instancia singleton
export const auditService = new AuditServiceImpl();