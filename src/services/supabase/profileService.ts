/**
 * Servicio de Perfiles con Supabase
 * Maneja la persistencia de datos de perfil del candidato
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Profile, WorkExperience, Education, Language, Reference } from '../../types/profile';
import { mockProfile } from '../mock/mockData';

export class ProfileService {
  /**
   * Obtener perfil del usuario actual
   */
  async getProfile(userId: string): Promise<Profile | null> {
    // Si Supabase no está configurado, usar mock data
    if (!isSupabaseConfigured()) {
      console.log('📦 Usando mock data para perfil');
      return mockProfile;
    }

    try {
      // Obtener perfil base
      const { data: profileData, error: profileError } = await supabase!
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No existe perfil, retornar null
          return null;
        }
        throw profileError;
      }

      // Obtener datos relacionados
      const [experiences, education, languages, softSkills, references] = await Promise.all([
        this.getExperiences(profileData.id),
        this.getEducation(profileData.id),
        this.getLanguages(profileData.id),
        this.getSoftSkills(profileData.id),
        this.getReferences(profileData.id),
      ]);

      // Mapear a tipo Profile
      return {
        personalInfo: {
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          email: profileData.email,
          phone: profileData.phone || '',
          country: profileData.country || '',
        },
        experience: experiences,
        education: education,
        languages: languages,
        softSkills: softSkills,
        trade: profileData.trade || '',
        references: references,
      };
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return mockProfile; // Fallback a mock data
    }
  }

  /**
   * Crear o actualizar perfil
   */
  async upsertProfile(userId: string, profile: Profile): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.log('📦 Mock mode: Perfil no guardado');
      return;
    }

    try {
      // Intentar actualizar primero, si no existe, crear
      let profileData;
      let profileError;

      // Primero intentar actualizar
      const { data: updateData, error: updateError } = await supabase!
        .from('profiles')
        .update({
          first_name: profile.personalInfo.firstName,
          last_name: profile.personalInfo.lastName,
          email: profile.personalInfo.email,
          phone: profile.personalInfo.phone,
          country: profile.personalInfo.country,
          trade: profile.trade,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError && updateError.code === 'PGRST116') {
        // No existe, crear nuevo
        const { data: insertData, error: insertError } = await supabase!
          .from('profiles')
          .insert({
            user_id: userId,
            first_name: profile.personalInfo.firstName,
            last_name: profile.personalInfo.lastName,
            email: profile.personalInfo.email,
            phone: profile.personalInfo.phone,
            country: profile.personalInfo.country,
            trade: profile.trade,
          })
          .select()
          .single();

        profileData = insertData;
        profileError = insertError;
      } else {
        profileData = updateData;
        profileError = updateError;
      }

      if (profileError) throw profileError;

      const profileId = profileData.id;

      // Actualizar datos relacionados
      await Promise.all([
        this.upsertExperiences(profileId, profile.experience),
        this.upsertEducation(profileId, profile.education),
        this.upsertLanguages(profileId, profile.languages),
        this.upsertSoftSkills(profileId, profile.softSkills),
        this.upsertReferences(profileId, profile.references),
      ]);

      console.log('✅ Perfil guardado en Supabase');
    } catch (error) {
      console.error('Error guardando perfil:', error);
      throw error;
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  private async getExperiences(profileId: string): Promise<WorkExperience[]> {
    const { data, error } = await supabase!
      .from('experiences')
      .select('*')
      .eq('profile_id', profileId)
      .order('start_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(exp => ({
      id: exp.id,
      company: exp.company,
      position: exp.position,
      startDate: exp.start_date,
      endDate: exp.end_date || '',
      description: exp.description || '',
    }));
  }

  private async upsertExperiences(profileId: string, experiences: WorkExperience[]): Promise<void> {
    // Eliminar experiencias existentes
    await supabase!
      .from('experiences')
      .delete()
      .eq('profile_id', profileId);

    // Insertar nuevas
    if (experiences.length > 0) {
      const { error } = await supabase!
        .from('experiences')
        .insert(
          experiences.map(exp => ({
            profile_id: profileId,
            company: exp.company,
            position: exp.position,
            start_date: exp.startDate,
            end_date: exp.endDate || null,
            description: exp.description,
          }))
        );

      if (error) throw error;
    }
  }

  private async getEducation(profileId: string): Promise<Education[]> {
    const { data, error } = await supabase!
      .from('education')
      .select('*')
      .eq('profile_id', profileId)
      .order('graduation_year', { ascending: false });

    if (error) throw error;

    return (data || []).map(edu => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.field_of_study || '',
      graduationYear: edu.graduation_year,
    }));
  }

  private async upsertEducation(profileId: string, education: Education[]): Promise<void> {
    await supabase!
      .from('education')
      .delete()
      .eq('profile_id', profileId);

    if (education.length > 0) {
      const { error } = await supabase!
        .from('education')
        .insert(
          education.map(edu => ({
            profile_id: profileId,
            institution: edu.institution,
            degree: edu.degree,
            field_of_study: edu.fieldOfStudy,
            graduation_year: edu.graduationYear,
          }))
        );

      if (error) throw error;
    }
  }

  private async getLanguages(profileId: string): Promise<Language[]> {
    const { data, error } = await supabase!
      .from('languages')
      .select('*')
      .eq('profile_id', profileId);

    if (error) throw error;

    return (data || []).map(lang => ({
      language: lang.language,
      proficiency: lang.proficiency as 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo',
    }));
  }

  private async upsertLanguages(profileId: string, languages: Language[]): Promise<void> {
    await supabase!
      .from('languages')
      .delete()
      .eq('profile_id', profileId);

    if (languages.length > 0) {
      const { error } = await supabase!
        .from('languages')
        .insert(
          languages.map(lang => ({
            profile_id: profileId,
            language: lang.language,
            proficiency: lang.proficiency,
          }))
        );

      if (error) throw error;
    }
  }

  private async getSoftSkills(profileId: string): Promise<string[]> {
    const { data, error } = await supabase!
      .from('soft_skills')
      .select('skill')
      .eq('profile_id', profileId);

    if (error) throw error;

    return (data || []).map(s => s.skill);
  }

  private async upsertSoftSkills(profileId: string, skills: string[]): Promise<void> {
    await supabase!
      .from('soft_skills')
      .delete()
      .eq('profile_id', profileId);

    if (skills.length > 0) {
      const { error } = await supabase!
        .from('soft_skills')
        .insert(
          skills.map(skill => ({
            profile_id: profileId,
            skill: skill,
          }))
        );

      if (error) throw error;
    }
  }

  private async getReferences(profileId: string): Promise<Reference[]> {
    const { data, error } = await supabase!
      .from('candidate_references')
      .select('*')
      .eq('profile_id', profileId);

    if (error) throw error;

    return (data || []).map(ref => ({
      id: ref.id,
      name: ref.name,
      country: ref.country || undefined,
      email: ref.email,
      phone: ref.phone,
      attachmentUrl: ref.attachment_url || undefined,
    }));
  }

  private async upsertReferences(profileId: string, references: Reference[]): Promise<void> {
    await supabase!
      .from('candidate_references')
      .delete()
      .eq('profile_id', profileId);

    if (references.length > 0) {
      const { error } = await supabase!
        .from('candidate_references')
        .insert(
          references.map(ref => ({
            profile_id: profileId,
            name: ref.name,
            country: ref.country || null,
            email: ref.email,
            phone: ref.phone,
            attachment_url: ref.attachmentUrl || null,
          }))
        );

      if (error) throw error;
    }
  }
}

// Exportar instancia singleton
export const profileService = new ProfileService();
