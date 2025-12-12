import React, { useState, useCallback, useEffect } from 'react';
import { Download, User, Briefcase, GraduationCap, Lightbulb, Users } from 'lucide-react';
import { Profile } from '../../../types/profile';
import { PersonalInfoTab } from '../PersonalInfoTab';
import { ExperienceSection } from '../ExperienceSection';
import { EducationSection } from '../EducationSection';
import { SkillsSection } from '../SkillsSection';
import { ReferencesSection } from '../ReferencesSection';
import { CVUploader } from '../CVUploader';
import { SaveIndicator } from '../SaveIndicator';
import { useAutoSave } from '../../../hooks/useAutoSave';

interface ProfileFormProps {
  profile: Profile;
  onUpdate: (profile: Profile) => Promise<void>;
  onExport: () => void;
  onProfileCompletionChange?: (completion: number) => void;
}

type TabId = 'personal' | 'experience' | 'education' | 'skills' | 'references';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'personal', label: 'Personal', icon: <User className="w-4 h-4" /> },
  { id: 'experience', label: 'Experiencia', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'education', label: 'Educación', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'skills', label: 'Habilidades', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'references', label: 'Referencias', icon: <Users className="w-4 h-4" /> },
];

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onUpdate,
  onExport,
  onProfileCompletionChange,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [localProfile, setLocalProfile] = useState<Profile>(profile);

  const { saveStatus, lastSaved, error } = useAutoSave({
    data: localProfile,
    onSave: async (data) => {
      await onUpdate(data);
    },
    delay: 1000,
  });

  // Actualizar el porcentaje de completitud cada vez que cambia el perfil local
  useEffect(() => {
    if (onProfileCompletionChange) {
      const completion = calculateProfileCompletion(localProfile);
      onProfileCompletionChange(completion);
    }
  }, [localProfile, onProfileCompletionChange]);

  const calculateProfileCompletion = (prof: Profile): number => {
    let totalWeight = 0;
    let completedWeight = 0;

    // Personal Info (20%) - Todos los campos requeridos
    const personalWeight = 20;
    totalWeight += personalWeight;
    const personalFields = [
      prof.personalInfo.firstName,
      prof.personalInfo.lastName,
      prof.personalInfo.country,
      prof.personalInfo.phone,
      prof.personalInfo.email,
    ];
    const personalCompleted = personalFields.filter(f => f && f.trim() !== '').length;
    if (personalCompleted === personalFields.length) {
      completedWeight += personalWeight;
    } else {
      completedWeight += (personalCompleted / personalFields.length) * personalWeight;
    }

    // Experience (25%) - Al menos 1 experiencia
    const experienceWeight = 25;
    totalWeight += experienceWeight;
    if (prof.experience.length > 0) {
      completedWeight += experienceWeight;
    }

    // Education (20%) - Al menos 1 educación
    const educationWeight = 20;
    totalWeight += educationWeight;
    if (prof.education.length > 0) {
      completedWeight += educationWeight;
    }

    // Skills (25%) - Idiomas + Soft Skills + Especialización
    const skillsWeight = 25;
    totalWeight += skillsWeight;
    const hasLanguages = prof.languages.length > 0;
    const hasSoftSkills = prof.softSkills.length > 0;
    const hasTrade = prof.trade && prof.trade.trim() !== '';
    
    // Solo cuenta como completo si tiene las 3 cosas
    if (hasLanguages && hasSoftSkills && hasTrade) {
      completedWeight += skillsWeight;
    } else {
      // Parcial: cuenta proporcionalmente
      const skillsCompleted = [hasLanguages, hasSoftSkills, hasTrade].filter(Boolean).length;
      completedWeight += (skillsCompleted / 3) * skillsWeight;
    }

    // References (10%) - Al menos 1 referencia
    const referencesWeight = 10;
    totalWeight += referencesWeight;
    if (prof.references.length > 0) {
      completedWeight += referencesWeight;
    }

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const handlePersonalInfoUpdate = useCallback(async (personalInfo: typeof profile.personalInfo) => {
    setLocalProfile(prev => ({ ...prev, personalInfo }));
  }, []);

  const handleExperienceUpdate = useCallback((experience: typeof profile.experience) => {
    setLocalProfile(prev => ({ ...prev, experience }));
  }, []);

  const handleEducationUpdate = useCallback((education: typeof profile.education) => {
    setLocalProfile(prev => ({ ...prev, education }));
  }, []);

  const handleSkillsUpdate = useCallback((data: {
    languages: typeof profile.languages;
    softSkills: typeof profile.softSkills;
    trade: string;
  }) => {
    setLocalProfile(prev => ({
      ...prev,
      languages: data.languages,
      softSkills: data.softSkills,
      trade: data.trade,
    }));
  }, []);

  const handleReferencesUpdate = useCallback((references: typeof profile.references) => {
    setLocalProfile(prev => ({ ...prev, references }));
  }, []);

  const handleCVParsed = useCallback((parsedData: any) => {
    // Merge parsed data with existing profile
    setLocalProfile(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        ...parsedData.personalInfo,
      },
      experience: parsedData.experience.length > 0 ? parsedData.experience : prev.experience,
      education: parsedData.education.length > 0 ? parsedData.education : prev.education,
      languages: parsedData.languages.length > 0 ? parsedData.languages : prev.languages,
      softSkills: parsedData.softSkills.length > 0 ? parsedData.softSkills : prev.softSkills,
      trade: parsedData.trade || prev.trade,
    }));
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Save Indicator */}
      <SaveIndicator status={saveStatus} lastSaved={lastSaved} error={error} />

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Mi Perfil</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Completa tu perfil para mejorar tus oportunidades
          </p>
        </div>
        <button
          onClick={onExport}
          className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar Datos
        </button>
      </div>

      {/* CV Uploader */}
      <div className="mb-8">
        <CVUploader onParsed={handleCVParsed} />
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto md:overflow-x-visible md:justify-start">
          {TABS.map(tab => {
            // Calcular si la sección está completa
            let isComplete = false;
            let hasData = false;
            
            switch (tab.id) {
              case 'personal':
                const personalFields = [
                  localProfile.personalInfo.firstName,
                  localProfile.personalInfo.lastName,
                  localProfile.personalInfo.country,
                  localProfile.personalInfo.phone,
                  localProfile.personalInfo.email,
                ];
                const completedFields = personalFields.filter(f => f && f.trim() !== '').length;
                isComplete = completedFields === personalFields.length;
                hasData = completedFields > 0;
                break;
              case 'experience':
                isComplete = localProfile.experience.length > 0;
                hasData = localProfile.experience.length > 0;
                break;
              case 'education':
                isComplete = localProfile.education.length > 0;
                hasData = localProfile.education.length > 0;
                break;
              case 'skills':
                const hasLanguages = localProfile.languages.length > 0;
                const hasSoftSkills = localProfile.softSkills.length > 0;
                const hasTradeValue = !!(localProfile.trade && localProfile.trade.trim() !== '');
                isComplete = hasLanguages && hasSoftSkills && hasTradeValue;
                hasData = hasLanguages || hasSoftSkills || hasTradeValue;
                break;
              case 'references':
                isComplete = localProfile.references.length > 0;
                hasData = localProfile.references.length > 0;
                break;
            }
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 md:px-6 py-4 font-medium transition-colors whitespace-nowrap text-sm md:text-base ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {tab.icon}
                {tab.label}
                {/* Indicador de completitud */}
                {isComplete ? (
                  <span className="ml-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : hasData ? (
                  <span className="ml-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                ) : (
                  <span className="ml-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Leyenda de indicadores */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span>Completo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span>Parcial</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
              <span>Incompleto</span>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'personal' && (
            <PersonalInfoTab
              data={localProfile.personalInfo}
              onUpdate={handlePersonalInfoUpdate}
            />
          )}

          {activeTab === 'experience' && (
            <ExperienceSection
              experiences={localProfile.experience}
              onUpdate={handleExperienceUpdate}
            />
          )}

          {activeTab === 'education' && (
            <EducationSection
              education={localProfile.education}
              onUpdate={handleEducationUpdate}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsSection
              languages={localProfile.languages}
              softSkills={localProfile.softSkills}
              trade={localProfile.trade}
              onUpdate={handleSkillsUpdate}
            />
          )}

          {activeTab === 'references' && (
            <ReferencesSection
              references={localProfile.references}
              onUpdate={handleReferencesUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
};
