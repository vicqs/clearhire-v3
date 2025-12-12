import React, { useState } from 'react';
import { X, Plus, Languages, Lightbulb, Wrench } from 'lucide-react';
import { Language } from '../../../types/profile';

interface SkillsSectionProps {
  languages: Language[];
  softSkills: string[];
  trade: string;
  onUpdate: (data: { languages: Language[]; softSkills: string[]; trade: string }) => void;
}

const LANGUAGE_OPTIONS = [
  'Español',
  'Inglés',
  'Portugués',
  'Francés',
  'Alemán',
  'Italiano',
  'Mandarín',
  'Japonés',
  'Coreano',
  'Árabe',
  'Ruso',
];

const PROFICIENCY_LEVELS: Array<'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo'> = ['Básico', 'Intermedio', 'Avanzado', 'Nativo'];

const SOFT_SKILLS_OPTIONS = [
  // Colaboración
  'Trabajo en Equipo',
  'Colaboración',
  'Networking',
  
  // Liderazgo
  'Liderazgo',
  'Mentoría',
  'Delegación',
  'Toma de Decisiones',
  
  // Comunicación
  'Comunicación',
  'Comunicación Escrita',
  'Presentaciones',
  'Escucha Activa',
  'Negociación',
  
  // Resolución de Problemas
  'Resolución de Problemas',
  'Pensamiento Crítico',
  'Pensamiento Analítico',
  'Creatividad',
  'Innovación',
  
  // Adaptabilidad
  'Adaptabilidad',
  'Flexibilidad',
  'Resiliencia',
  'Aprendizaje Continuo',
  
  // Gestión
  'Gestión del Tiempo',
  'Organización',
  'Planificación',
  'Priorización',
  'Multitasking',
  
  // Inteligencia Emocional
  'Empatía',
  'Inteligencia Emocional',
  'Autoconciencia',
  'Manejo del Estrés',
  
  // Orientación a Resultados
  'Orientación a Resultados',
  'Proactividad',
  'Iniciativa',
  'Responsabilidad',
  'Atención al Detalle',
  
  // Diversidad e Inclusión
  'Inclusividad',
  'Sensibilidad Cultural',
  'Respeto a la Diversidad',
];

const TRADE_OPTIONS = [
  // Tecnología
  'Desarrollo de Software',
  'Desarrollo Web',
  'Desarrollo Mobile',
  'DevOps',
  'Ciberseguridad',
  'Cloud Computing',
  'Inteligencia Artificial',
  'Machine Learning',
  'Data Science',
  'Análisis de Datos',
  'Big Data',
  'Blockchain',
  'IoT (Internet de las Cosas)',
  'Soporte Técnico',
  'Infraestructura IT',
  
  // Diseño
  'Diseño UX/UI',
  'Diseño Gráfico',
  'Diseño de Producto',
  'Diseño Web',
  'Animación',
  'Ilustración',
  
  // Marketing
  'Marketing Digital',
  'Marketing de Contenidos',
  'SEO/SEM',
  'Social Media',
  'Email Marketing',
  'Growth Hacking',
  'Marketing de Producto',
  'Branding',
  
  // Ventas
  'Ventas',
  'Ventas B2B',
  'Ventas B2C',
  'Account Management',
  'Business Development',
  
  // Gestión
  'Gestión de Proyectos',
  'Product Management',
  'Gestión de Operaciones',
  'Gestión de Calidad',
  'Gestión de Riesgos',
  
  // Recursos Humanos
  'Recursos Humanos',
  'Reclutamiento',
  'Capacitación',
  'Desarrollo Organizacional',
  
  // Finanzas
  'Finanzas',
  'Contabilidad',
  'Auditoría',
  'Análisis Financiero',
  
  // Legal
  'Legal',
  'Compliance',
  'Propiedad Intelectual',
  
  // Otros
  'Consultoría',
  'Investigación',
  'Educación',
  'Redacción',
  'Traducción',
  'Atención al Cliente',
];

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  languages,
  softSkills,
  trade,
  onUpdate,
}) => {
  const [newLanguage, setNewLanguage] = useState('');
  const [newLanguageLevel, setNewLanguageLevel] = useState<'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo'>('Básico');
  const [selectedSoftSkills, setSelectedSoftSkills] = useState<string[]>(softSkills);
  const [selectedTrade, setSelectedTrade] = useState(trade);

  const handleAddLanguage = () => {
    if (newLanguage && !languages.find(l => l.language === newLanguage)) {
      const updatedLanguages = [
        ...languages,
        { language: newLanguage, proficiency: newLanguageLevel },
      ];
      onUpdate({ languages: updatedLanguages, softSkills: selectedSoftSkills, trade: selectedTrade });
      setNewLanguage('');
      setNewLanguageLevel('Básico');
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    const updatedLanguages = languages.filter(l => l.language !== languageToRemove);
    onUpdate({ languages: updatedLanguages, softSkills: selectedSoftSkills, trade: selectedTrade });
  };

  const handleUpdateLanguageLevel = (language: string, newLevel: string) => {
    const updatedLanguages = languages.map(l =>
      l.language === language ? { ...l, proficiency: newLevel as 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo' } : l
    );
    onUpdate({ languages: updatedLanguages, softSkills: selectedSoftSkills, trade: selectedTrade });
  };

  const handleToggleSoftSkill = (skill: string) => {
    const updated = selectedSoftSkills.includes(skill)
      ? selectedSoftSkills.filter(s => s !== skill)
      : [...selectedSoftSkills, skill];
    setSelectedSoftSkills(updated);
    onUpdate({ languages, softSkills: updated, trade: selectedTrade });
  };

  const handleTradeChange = (newTrade: string) => {
    setSelectedTrade(newTrade);
    onUpdate({ languages, softSkills: selectedSoftSkills, trade: newTrade });
  };

  return (
    <div className="space-y-8">
      {/* Languages Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Languages className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">Idiomas</h3>
        </div>

        {/* Add Language */}
        <div className="flex gap-3 mb-4">
          <select
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Selecciona un idioma</option>
            {LANGUAGE_OPTIONS.filter(
              lang => !languages.find(l => l.language === lang)
            ).map(lang => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <select
            value={newLanguageLevel}
            onChange={(e) => setNewLanguageLevel(e.target.value as 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo')}
            className="px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {PROFICIENCY_LEVELS.map(level => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddLanguage}
            disabled={!newLanguage}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        {/* Language List */}
        <div className="space-y-2">
          {languages.length === 0 ? (
            <p className="text-sm text-slate-500 italic">No has agregado idiomas</p>
          ) : (
            languages.map(lang => (
              <div
                key={lang.language}
                className="flex items-center justify-between bg-slate-50 rounded-lg p-3"
              >
                <span className="font-medium text-slate-900">{lang.language}</span>
                <div className="flex items-center gap-3">
                  <select
                    value={lang.proficiency}
                    onChange={(e) => handleUpdateLanguageLevel(lang.language, e.target.value)}
                    className="px-3 py-1 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {PROFICIENCY_LEVELS.map(level => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemoveLanguage(lang.language)}
                    className="p-1 rounded hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Soft Skills Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-slate-900">Habilidades Blandas</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {SOFT_SKILLS_OPTIONS.map(skill => (
            <button
              key={skill}
              onClick={() => handleToggleSoftSkill(skill)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedSoftSkills.includes(skill)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Trade Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-slate-900">Oficio / Especialidad</h3>
        </div>
        <select
          value={selectedTrade}
          onChange={(e) => handleTradeChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Selecciona tu oficio</option>
          {TRADE_OPTIONS.map(tradeOption => (
            <option key={tradeOption} value={tradeOption}>
              {tradeOption}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
