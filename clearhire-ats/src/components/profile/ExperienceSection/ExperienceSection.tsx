import React, { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { ExperienceItem } from '../ExperienceItem';
import { WorkExperience } from '../../../types/profile';

interface ExperienceSectionProps {
  experiences: WorkExperience[];
  onUpdate: (experiences: WorkExperience[]) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experiences,
  onUpdate,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const sortedExperiences = [...experiences].sort((a, b) => {
    const dateA = new Date(a.endDate);
    const dateB = new Date(b.endDate);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  const handleAdd = () => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const newExperience: WorkExperience = {
      id: `exp-${Date.now()}`,
      company: 'Nombre de la Empresa',
      position: 'Desarrollador Full Stack',
      startDate: sixMonthsAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      description: 'Describe tus responsabilidades y logros principales en este puesto...',
    };

    // Add to the beginning of the array
    onUpdate([newExperience, ...experiences]);
    setIsAdding(true);
  };

  const handleUpdate = (updatedExperience: WorkExperience) => {
    const updatedExperiences = experiences.map(exp =>
      exp.id === updatedExperience.id ? updatedExperience : exp
    );
    onUpdate(updatedExperiences);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    const updatedExperiences = experiences.filter(exp => exp.id !== id);
    onUpdate(updatedExperiences);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Experiencia Laboral</h3>
          <p className="text-sm text-slate-600 mt-1">
            Agrega tu experiencia profesional más reciente
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={isAdding}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Experiencia
        </button>
      </div>

      {/* Experience List */}
      <div className="space-y-4">
        {sortedExperiences.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No has agregado experiencia laboral</p>
            <p className="text-sm text-slate-500 mt-1">
              Haz clic en "Agregar Experiencia" para comenzar
            </p>
          </div>
        ) : (
          sortedExperiences.map(experience => (
            <ExperienceItem
              key={experience.id}
              experience={experience}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
