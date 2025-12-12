/**
 * Formulario de perfil con tabs y auto-guardado
 */
import React, { useState } from 'react';
import { Profile } from '../../types/profile';
import { useAutoSave } from '../../hooks/useAutoSave';

export interface ProfileFormProps {
  profile?: Profile | null;
  onUpdate?: (profile: Profile) => void;
  onExport?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  onUpdate,
  onExport
}) => {
  const [activeTab, setActiveTab] = useState('personal');
  
  const { saveStatus, error } = useAutoSave({
    data: profile,
    onSave: async (data) => {
      if (data && onUpdate) {
        onUpdate(data);
      }
    },
    delay: 2000
  });

  const tabs = [
    { id: 'personal', label: 'Personal', completion: 80 },
    { id: 'experience', label: 'Experiencia', completion: 60 },
    { id: 'education', label: 'Educación', completion: 40 },
    { id: 'skills', label: 'Habilidades', completion: 90 }
  ];

  if (!profile) {
    return (
      <div className="p-4 text-center">
        <p>No hay datos de perfil disponibles</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header con botón de exportar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Exportar CV
        </button>
      </div>

      {/* Indicador de guardado */}
      <div className="mb-4">
        {saveStatus === 'saving' && (
          <div className="text-blue-600">Guardando...</div>
        )}
        {saveStatus === 'saved' && (
          <div className="text-green-600">Guardado ✓</div>
        )}
        {saveStatus === 'error' && error && (
          <div className="text-red-600">Error: {error.message}</div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={`${tab.label} tab`}
            >
              {tab.label}
              <span className="ml-2 text-xs">({tab.completion}%)</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="tab-content">
        {activeTab === 'personal' && (
          <div data-testid="personal-tab">
            <h2 className="text-lg font-semibold mb-4">Información Personal</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={profile.personalInfo.firstName}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apellido
                </label>
                <input
                  type="text"
                  value={profile.personalInfo.lastName}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  readOnly
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div data-testid="experience-tab">
            <h2 className="text-lg font-semibold mb-4">Experiencia Laboral</h2>
            <div className="space-y-4">
              {profile.experience.map((exp, index) => (
                <div key={exp.id || index} className="border p-4 rounded">
                  <h3 className="font-medium">{exp.position}</h3>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate || 'Presente'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div data-testid="education-tab">
            <h2 className="text-lg font-semibold mb-4">Educación</h2>
            <div className="space-y-4">
              {profile.education.map((edu, index) => (
                <div key={edu.id || index} className="border p-4 rounded">
                  <h3 className="font-medium">{edu.degree}</h3>
                  <p className="text-gray-600">{edu.institution}</p>
                  <p className="text-sm text-gray-500">{edu.graduationYear}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div data-testid="skills-tab">
            <h2 className="text-lg font-semibold mb-4">Habilidades</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Habilidades Blandas</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.softSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Idiomas</h3>
                <div className="space-y-2">
                  {profile.languages.map((lang, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{lang.language}</span>
                      <span className="text-gray-600">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CV Uploader */}
      <div className="mt-8 p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600">Subir CV (PDF)</p>
          <input
            type="file"
            accept=".pdf"
            className="mt-2"
            data-testid="cv-uploader"
          />
        </div>
      </div>
    </div>
  );
};