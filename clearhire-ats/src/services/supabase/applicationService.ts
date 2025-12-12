/**
 * Servicio de Aplicaciones con Supabase
 * Maneja aplicaciones a trabajos y su seguimiento
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Application, Stage, OfferDetails } from '../../types/application';
import type { TrackingEvent } from '../../types/tracking';
import { mockApplications } from '../mock/mockData';

export class ApplicationService {
  /**
   * Obtener todas las aplicaciones del usuario
   */
  async getApplications(candidateId: string): Promise<Application[]> {
    if (!isSupabaseConfigured()) {
      console.log('📦 Usando mock data para aplicaciones');
      return mockApplications;
    }

    try {
      const { data, error } = await supabase!
        .from('applications')
        .select(`
          *,
          application_stages (
            *,
            stage_recommendations (*),
            test_results (
              *,
              test_result_details (*)
            )
          )
        `)
        .eq('candidate_id', candidateId)
        .order('applied_date', { ascending: false });

      if (error) throw error;

      return (data || []).map((app: any) => this.mapToApplication(app));
    } catch (error) {
      console.error('Error obteniendo aplicaciones:', error);
      return mockApplications;
    }
  }

  /**
   * Obtener una aplicación específica
   */
  async getApplication(applicationId: string): Promise<Application | null> {
    if (!isSupabaseConfigured()) {
      return mockApplications.find(app => app.id === applicationId) || null;
    }

    try {
      const { data, error } = await supabase!
        .from('applications')
        .select(`
          *,
          application_stages (
            *,
            stage_recommendations (*),
            test_results (
              *,
              test_result_details (*)
            )
          )
        `)
        .eq('id', applicationId)
        .single();

      if (error) throw error;

      return this.mapToApplication(data);
    } catch (error) {
      console.error('Error obteniendo aplicación:', error);
      return null;
    }
  }

  /**
   * Crear nueva aplicación
   */
  async createApplication(application: Omit<Application, 'id'>): Promise<Application> {
    if (!isSupabaseConfigured()) {
      console.log('📦 Mock mode: Aplicación no guardada');
      return { ...application, id: `mock-${Date.now()}` } as Application;
    }

    try {
      // Insertar aplicación
      const { data: appData, error: appError } = await supabase!
        .from('applications')
        .insert({
          candidate_id: application.candidateId,
          job_id: application.jobId,
          company: application.company,
          position: application.position,
          available_positions: application.availablePositions,
          status: application.status,
          current_stage_id: application.currentStageId,
          applied_date: application.appliedDate.toISOString(),
          last_update: application.lastUpdate.toISOString(),
          interview_confirmed: application.interviewConfirmed,
        })
        .select()
        .single();

      if (appError) throw appError;

      // Insertar stages
      if (application.stages.length > 0) {
        await this.upsertStages(appData.id, application.stages);
      }

      console.log('✅ Aplicación creada en Supabase');
      return await this.getApplication(appData.id) as Application;
    } catch (error) {
      console.error('Error creando aplicación:', error);
      throw error;
    }
  }

  /**
   * Actualizar aplicación
   */
  async updateApplication(applicationId: string, updates: Partial<Application>): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.log('📦 Mock mode: Aplicación no actualizada');
      return;
    }

    try {
      const { error } = await supabase!
        .from('applications')
        .update({
          status: updates.status,
          current_stage_id: updates.currentStageId,
          last_update: new Date().toISOString(),
          final_score: updates.finalScore,
          interview_date: updates.interviewDate?.toISOString(),
          interview_confirmed: updates.interviewConfirmed,
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Actualizar stages si se proporcionan
      if (updates.stages) {
        await this.upsertStages(applicationId, updates.stages);
      }

      console.log('✅ Aplicación actualizada');
    } catch (error) {
      console.error('Error actualizando aplicación:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS DE SEGUIMIENTO ====================

  /**
   * Procesa la aceptación de una oferta y actualiza el seguimiento
   */
  async processOfferAcceptance(applicationId: string, offerDetails: OfferDetails): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.log('📦 Mock mode: Procesando aceptación de oferta');
      return;
    }

    try {
      console.log(`🎯 Procesando aceptación de oferta para aplicación ${applicationId}`);

      // Actualizar aplicación con detalles de aceptación
      const { error: updateError } = await supabase!
        .from('applications')
        .update({
          status: 'offer_accepted',
          last_update: new Date().toISOString(),
          offer_accepted_at: offerDetails.acceptedAt?.toISOString(),
          offer_salary: offerDetails.salary,
          offer_currency: offerDetails.currency,
          offer_benefits: offerDetails.benefits,
          offer_start_date: offerDetails.startDate?.toISOString(),
          exclusivity_status: 'exclusive',
          last_tracking_update: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Crear evento de seguimiento
      await this.createTrackingEntry(applicationId, {
        id: `tracking-acceptance-${Date.now()}`,
        applicationId,
        eventType: 'offer_accepted',
        timestamp: new Date(),
        details: {
          salary: offerDetails.salary,
          currency: offerDetails.currency,
          benefits: offerDetails.benefits,
          acceptedAt: offerDetails.acceptedAt
        },
        triggeredBy: 'user',
        metadata: {
          processedAt: new Date().toISOString()
        }
      });

      console.log('✅ Aceptación de oferta procesada exitosamente');

    } catch (error) {
      console.error('❌ Error procesando aceptación de oferta:', error);
      throw error;
    }
  }

  /**
   * Retira todas las otras aplicaciones del candidato
   */
  async withdrawOtherApplications(candidateId: string, excludeApplicationId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.log('📦 Mock mode: Retirando otras aplicaciones');
      return;
    }

    try {
      console.log(`🚫 Retirando otras aplicaciones para candidato ${candidateId}`);

      // Obtener aplicaciones a retirar
      const { data: applicationsToWithdraw, error: fetchError } = await supabase!
        .from('applications')
        .select('id, company, position, status')
        .eq('candidate_id', candidateId)
        .neq('id', excludeApplicationId)
        .in('status', [
          'active', 'screening', 'interview_scheduled', 'interview_completed',
          'technical_evaluation', 'reference_check', 'finalist', 
          'background_check', 'offer_pending', 'offer_negotiating'
        ]);

      if (fetchError) throw fetchError;

      if (!applicationsToWithdraw || applicationsToWithdraw.length === 0) {
        console.log('📋 No hay aplicaciones para retirar');
        return;
      }

      console.log(`📋 Retirando ${applicationsToWithdraw.length} aplicaciones`);

      // Actualizar estado de aplicaciones
      const { error: updateError } = await supabase!
        .from('applications')
        .update({
          status: 'withdrawn',
          last_update: new Date().toISOString(),
          exclusivity_status: 'withdrawn',
          last_tracking_update: new Date().toISOString()
        })
        .eq('candidate_id', candidateId)
        .neq('id', excludeApplicationId)
        .in('status', [
          'active', 'screening', 'interview_scheduled', 'interview_completed',
          'technical_evaluation', 'reference_check', 'finalist', 
          'background_check', 'offer_pending', 'offer_negotiating'
        ]);

      if (updateError) throw updateError;

      // Crear eventos de seguimiento para cada aplicación retirada
      for (const app of applicationsToWithdraw) {
        await this.createTrackingEntry(app.id, {
          id: `tracking-withdraw-${app.id}-${Date.now()}`,
          applicationId: app.id,
          eventType: 'application_withdrawn',
          timestamp: new Date(),
          details: {
            reason: 'Candidato aceptó otra oferta',
            withdrawnAutomatically: true,
            previousStatus: app.status
          },
          triggeredBy: 'system',
          metadata: {
            triggeredByAcceptance: true,
            excludeApplicationId
          }
        });
      }

      console.log('✅ Otras aplicaciones retiradas exitosamente');

    } catch (error) {
      console.error('❌ Error retirando otras aplicaciones:', error);
      throw error;
    }
  }

  /**
   * Crea una entrada de seguimiento para una aplicación
   */
  async createTrackingEntry(applicationId: string, event: TrackingEvent): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.log('📦 Mock mode: Creando entrada de seguimiento', event);
      return;
    }

    try {
      const { error } = await supabase!
        .from('tracking_events')
        .insert({
          id: event.id,
          application_id: applicationId,
          event_type: event.eventType,
          timestamp: event.timestamp.toISOString(),
          details: event.details,
          triggered_by: event.triggeredBy,
          metadata: event.metadata
        });

      if (error) throw error;

      console.log(`📊 Evento de seguimiento creado: ${event.eventType}`);

    } catch (error) {
      console.error('❌ Error creando entrada de seguimiento:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de seguimiento de una aplicación
   */
  async getTrackingHistory(applicationId: string): Promise<TrackingEvent[]> {
    if (!isSupabaseConfigured()) {
      console.log('📦 Mock mode: Obteniendo historial de seguimiento');
      return [
        {
          id: 'mock-event-1',
          applicationId,
          eventType: 'offer_accepted',
          timestamp: new Date(),
          details: { mockData: true },
          triggeredBy: 'user'
        }
      ];
    }

    try {
      const { data, error } = await supabase!
        .from('tracking_events')
        .select('*')
        .eq('application_id', applicationId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return (data || []).map((event: any) => ({
        id: event.id,
        applicationId: event.application_id,
        eventType: event.event_type,
        timestamp: new Date(event.timestamp),
        details: event.details || {},
        triggeredBy: event.triggered_by,
        metadata: event.metadata
      }));

    } catch (error) {
      console.error('❌ Error obteniendo historial de seguimiento:', error);
      return [];
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private async upsertStages(applicationId: string, stages: Stage[]): Promise<void> {
    // Eliminar stages existentes
    await supabase!
      .from('application_stages')
      .delete()
      .eq('application_id', applicationId);

    // Insertar nuevos stages
    if (stages.length > 0) {
      const { error } = await supabase!
        .from('application_stages')
        .insert(
          stages.map(stage => ({
            application_id: applicationId,
            stage_id: stage.id,
            name: stage.name,
            stage_order: stage.order,
            status: stage.status,
            recruiter_id: stage.recruiter?.id,
            recruiter_name: stage.recruiter?.name,
            recruiter_title: stage.recruiter?.title,
            recruiter_avatar: stage.recruiter?.avatar,
            estimated_days: stage.estimatedDays,
            actual_days: stage.actualDays,
            score: stage.score,
            start_date: stage.startDate.toISOString(),
            end_date: stage.endDate?.toISOString(),
            feedback_category: stage.feedback?.category,
            feedback_explanation: stage.feedback?.aiExplanation,
          }))
        );

      if (error) throw error;

      // Insertar recomendaciones si existen
      for (const stage of stages) {
        if (stage.feedback?.recommendations) {
          const stageData = await supabase!
            .from('application_stages')
            .select('id')
            .eq('application_id', applicationId)
            .eq('stage_id', stage.id)
            .single();

          if (stageData.data) {
            await supabase!
              .from('stage_recommendations')
              .insert(
                stage.feedback.recommendations.map(rec => ({
                  stage_id: stageData.data.id,
                  skill: rec.skill,
                  resource: rec.resource,
                  resource_url: rec.resourceUrl,
                  priority: rec.priority,
                }))
              );
          }
        }
      }
    }
  }

  private mapToApplication(data: any): Application {
    return {
      id: data.id,
      candidateId: data.candidate_id,
      jobId: data.job_id,
      company: data.company,
      position: data.position,
      availablePositions: data.available_positions,
      status: data.status,
      currentStageId: data.current_stage_id,
      appliedDate: new Date(data.applied_date),
      lastUpdate: new Date(data.last_update),
      finalScore: data.final_score,
      interviewDate: data.interview_date ? new Date(data.interview_date) : undefined,
      interviewConfirmed: data.interview_confirmed,
      isExclusive: data.is_exclusive,
      stages: (data.application_stages || []).map((stage: any) => ({
        id: stage.stage_id,
        name: stage.name,
        order: stage.stage_order,
        status: stage.status,
        recruiter: stage.recruiter_id ? {
          id: stage.recruiter_id,
          name: stage.recruiter_name,
          title: stage.recruiter_title,
          avatar: stage.recruiter_avatar,
        } : undefined,
        estimatedDays: stage.estimated_days,
        actualDays: stage.actual_days,
        score: stage.score,
        startDate: new Date(stage.start_date),
        endDate: stage.end_date ? new Date(stage.end_date) : undefined,
        feedback: stage.feedback_category ? {
          category: stage.feedback_category,
          aiExplanation: stage.feedback_explanation,
          recommendations: stage.stage_recommendations || [],
        } : undefined,
      })),
    };
  }
}

// Exportar instancia singleton
export const applicationService = new ApplicationService();
