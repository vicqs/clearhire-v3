/**
 * Servicio de Historial de Seguimiento
 * Maneja consultas optimizadas y análisis del historial de tracking
 */

import { applicationService } from './supabase/applicationService';
import { dataService } from './dataService';
import type { TrackingEvent } from '../types/tracking';
import type { Application } from '../types/application';

export interface TrackingHistoryFilter {
  eventTypes?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  triggeredBy?: 'system' | 'user' | 'recruiter';
  limit?: number;
  offset?: number;
}

export interface TrackingHistoryStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  averageProcessingTime: number;
  lastActivity: Date | null;
  timelineData: TimelineEntry[];
}

export interface TimelineEntry {
  date: Date;
  eventType: string;
  title: string;
  description: string;
  details: Record<string, any>;
  triggeredBy: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
}

class TrackingHistoryService {
  /**
   * Obtiene el historial de seguimiento con filtros y paginación
   */
  async getTrackingHistory(
    applicationId: string, 
    filters: TrackingHistoryFilter = {}
  ): Promise<TrackingEvent[]> {
    try {
      console.log(`📊 Obteniendo historial de seguimiento para aplicación ${applicationId}`);

      // Obtener eventos base
      let events = await applicationService.getTrackingHistory(applicationId);

      // Aplicar filtros
      events = this.applyFilters(events, filters);

      // Aplicar paginación
      if (filters.offset || filters.limit) {
        const offset = filters.offset || 0;
        const limit = filters.limit || 50;
        events = events.slice(offset, offset + limit);
      }

      console.log(`✅ Obtenidos ${events.length} eventos de seguimiento`);
      return events;

    } catch (error) {
      console.error('❌ Error obteniendo historial de seguimiento:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas del historial de seguimiento
   */
  async getTrackingStats(applicationId: string): Promise<TrackingHistoryStats> {
    try {
      const events = await applicationService.getTrackingHistory(applicationId);
      
      // Calcular estadísticas
      const eventsByType = events.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const lastActivity = events.length > 0 
        ? new Date(Math.max(...events.map(e => e.timestamp.getTime())))
        : null;

      // Calcular tiempo promedio de procesamiento (mock)
      const averageProcessingTime = this.calculateAverageProcessingTime(events);

      // Generar datos de timeline
      const timelineData = this.generateTimelineData(events);

      return {
        totalEvents: events.length,
        eventsByType,
        averageProcessingTime,
        lastActivity,
        timelineData
      };

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas de seguimiento:', error);
      return {
        totalEvents: 0,
        eventsByType: {},
        averageProcessingTime: 0,
        lastActivity: null,
        timelineData: []
      };
    }
  }

  /**
   * Obtiene el historial completo de un candidato (todas sus aplicaciones)
   */
  async getCandidateTrackingHistory(candidateId: string): Promise<{
    applications: Application[];
    allEvents: TrackingEvent[];
    stats: TrackingHistoryStats;
  }> {
    try {
      console.log(`📋 Obteniendo historial completo del candidato ${candidateId}`);

      const applications = await dataService.getApplications(candidateId);
      const allEvents: TrackingEvent[] = [];

      // Obtener eventos de todas las aplicaciones
      for (const app of applications) {
        const appEvents = await applicationService.getTrackingHistory(app.id);
        allEvents.push(...appEvents);
      }

      // Ordenar eventos por fecha (más recientes primero)
      allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Calcular estadísticas globales
      const stats = await this.calculateGlobalStats(allEvents);

      return {
        applications,
        allEvents,
        stats
      };

    } catch (error) {
      console.error('❌ Error obteniendo historial del candidato:', error);
      return {
        applications: [],
        allEvents: [],
        stats: {
          totalEvents: 0,
          eventsByType: {},
          averageProcessingTime: 0,
          lastActivity: null,
          timelineData: []
        }
      };
    }
  }

  /**
   * Busca eventos específicos en el historial
   */
  async searchTrackingEvents(
    applicationId: string, 
    searchTerm: string
  ): Promise<TrackingEvent[]> {
    try {
      const events = await applicationService.getTrackingHistory(applicationId);
      
      const searchLower = searchTerm.toLowerCase();
      
      return events.filter(event => 
        event.eventType.toLowerCase().includes(searchLower) ||
        JSON.stringify(event.details).toLowerCase().includes(searchLower) ||
        event.triggeredBy.toLowerCase().includes(searchLower)
      );

    } catch (error) {
      console.error('❌ Error buscando eventos:', error);
      return [];
    }
  }

  /**
   * Exporta el historial de seguimiento en formato JSON
   */
  async exportTrackingHistory(applicationId: string): Promise<string> {
    try {
      const events = await applicationService.getTrackingHistory(applicationId);
      const application = await dataService.getApplication(applicationId);
      
      const exportData = {
        application: {
          id: application?.id,
          company: application?.company,
          position: application?.position,
          status: application?.status
        },
        events,
        exportedAt: new Date().toISOString(),
        totalEvents: events.length
      };

      return JSON.stringify(exportData, null, 2);

    } catch (error) {
      console.error('❌ Error exportando historial:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Aplica filtros a los eventos
   */
  private applyFilters(events: TrackingEvent[], filters: TrackingHistoryFilter): TrackingEvent[] {
    let filteredEvents = [...events];

    // Filtrar por tipos de evento
    if (filters.eventTypes && filters.eventTypes.length > 0) {
      filteredEvents = filteredEvents.filter(event => 
        filters.eventTypes!.includes(event.eventType)
      );
    }

    // Filtrar por rango de fechas
    if (filters.dateFrom) {
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp <= filters.dateTo!
      );
    }

    // Filtrar por quien lo disparó
    if (filters.triggeredBy) {
      filteredEvents = filteredEvents.filter(event => 
        event.triggeredBy === filters.triggeredBy
      );
    }

    return filteredEvents;
  }

  /**
   * Calcula el tiempo promedio de procesamiento
   */
  private calculateAverageProcessingTime(events: TrackingEvent[]): number {
    if (events.length < 2) return 0;

    const intervals: number[] = [];
    
    for (let i = 1; i < events.length; i++) {
      const timeDiff = events[i-1].timestamp.getTime() - events[i].timestamp.getTime();
      intervals.push(Math.abs(timeDiff));
    }

    const average = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    return Math.round(average / (1000 * 60 * 60)); // Convertir a horas
  }

  /**
   * Genera datos para timeline visual
   */
  private generateTimelineData(events: TrackingEvent[]): TimelineEntry[] {
    return events.map(event => ({
      date: event.timestamp,
      eventType: event.eventType,
      title: this.getEventTitle(event.eventType),
      description: this.getEventDescription(event),
      details: event.details,
      triggeredBy: event.triggeredBy,
      status: this.getEventStatus(event)
    }));
  }

  /**
   * Obtiene el título legible de un evento
   */
  private getEventTitle(eventType: string): string {
    const titles: Record<string, string> = {
      'offer_accepted': 'Oferta Aceptada',
      'status_changed': 'Estado Actualizado',
      'stage_completed': 'Etapa Completada',
      'notification_sent': 'Notificación Enviada',
      'application_withdrawn': 'Aplicación Retirada'
    };

    return titles[eventType] || eventType;
  }

  /**
   * Genera descripción del evento
   */
  private getEventDescription(event: TrackingEvent): string {
    switch (event.eventType) {
      case 'offer_accepted':
        return `Candidato aceptó la oferta laboral`;
      case 'application_withdrawn':
        return `Aplicación retirada: ${event.details.reason || 'Sin razón especificada'}`;
      case 'status_changed':
        return `Estado cambió de ${event.details.fromStatus || 'N/A'} a ${event.details.toStatus || 'N/A'}`;
      case 'notification_sent':
        return `Notificación enviada: ${event.details.type || 'Tipo no especificado'}`;
      default:
        return `Evento de tipo ${event.eventType}`;
    }
  }

  /**
   * Determina el estado visual del evento
   */
  private getEventStatus(event: TrackingEvent): 'completed' | 'in_progress' | 'pending' | 'failed' {
    if (event.details.error) return 'failed';
    if (event.eventType === 'offer_accepted') return 'completed';
    if (event.eventType === 'application_withdrawn') return 'completed';
    if (event.eventType === 'notification_sent') return 'completed';
    return 'completed';
  }

  /**
   * Calcula estadísticas globales para un candidato
   */
  private async calculateGlobalStats(allEvents: TrackingEvent[]): Promise<TrackingHistoryStats> {
    const eventsByType = allEvents.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const lastActivity = allEvents.length > 0 
      ? new Date(Math.max(...allEvents.map(e => e.timestamp.getTime())))
      : null;

    const averageProcessingTime = this.calculateAverageProcessingTime(allEvents);
    const timelineData = this.generateTimelineData(allEvents.slice(0, 20)); // Últimos 20 eventos

    return {
      totalEvents: allEvents.length,
      eventsByType,
      averageProcessingTime,
      lastActivity,
      timelineData
    };
  }
}

// Exportar instancia singleton
export const trackingHistoryService = new TrackingHistoryService();