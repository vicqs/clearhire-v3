/**
 * Servicio de Ofertas con Supabase
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { JobOffer } from '../../types/salary';

export class OfferService {

    /**
     * Obtener ofertas para un candidato
     * (Nota: En un sistema real, filtraríamos por candidato. 
     * Por ahora, retornamos todas las ofertas disponibles en la tabla job_offers)
     */
    async getOffers(_profileId: string): Promise<JobOffer[]> {
        if (!isSupabaseConfigured()) {
            return [];
        }

        try {
            const { data, error } = await supabase!
                .from('job_offers')
                .select(`
          *,
          offer_benefits (*),
          negotiation_messages (*)
        `)
                .order('offer_date', { ascending: false });

            if (error) throw error;

            return (data || []).map((offer: any) => this.mapToJobOffer(offer));
        } catch (error) {
            console.error('Error obteniendo ofertas:', error);
            return [];
        }
    }

    private mapToJobOffer(data: any): JobOffer {
        return {
            id: data.id,
            applicationId: data.application_id || 'unknown',
            companyName: data.company_name,
            positionTitle: data.position_title,
            // Mapeo condicional para salario fijo o rango
            ...(data.fixed_salary ? { fixedSalary: data.fixed_salary } : {}),
            ...(data.salary_min && data.salary_max ? {
                salaryRange: {
                    min: data.salary_min,
                    max: data.salary_max,
                    currency: data.currency
                }
            } : {}),
            currency: data.currency,
            country: data.country,
            offerDate: new Date(data.offer_date),
            expirationDate: new Date(data.expiration_date),
            status: data.status,
            negotiationNotes: data.negotiation_notes,
            awaitingCandidateResponse: data.awaiting_candidate_response,
            benefits: (data.offer_benefits || []).map((b: any) => ({
                id: b.id,
                name: b.name,
                category: b.category,
                estimatedValue: b.estimated_value,
                currency: b.currency,
                description: b.description,
                isPercentage: b.is_percentage,
                percentageValue: b.percentage_value
            })),
            negotiationMessages: (data.negotiation_messages || []).map((m: any) => ({
                id: m.id,
                sender: m.sender,
                message: m.message,
                timestamp: new Date(m.timestamp),
                read: m.read
            }))
        };
    }
    async updateOfferStatus(offerId: string, status: string): Promise<void> {
        if (!isSupabaseConfigured()) return;

        try {
            const { error } = await supabase!
                .from('job_offers')
                .update({ status })
                .eq('id', offerId);

            if (error) throw error;
        } catch (error) {
            console.error('Error actualizando estado de oferta:', error);
            throw error;
        }
    }
}

export const offerService = new OfferService();
