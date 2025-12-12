import React, { useState } from 'react';
import { Plus, GraduationCap } from 'lucide-react';
import { EducationItem } from '../EducationItem';
import { Education } from '../../../types/profile';

interface EducationSectionProps {
  education: Education[];
  onUpdate: (education: Education[]) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  onUpdate,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const sortedEducation = [...education].sort((a, b) => {
    return parseInt(b.graduationYear) - parseInt(a.graduationYear); // Most recent first
  });

  const handleAdd = () => {
    const currentYear = new Date().getFullYear();
    
    const newEducation: Education = {
      id: `edu-${Date.now()}`,
      institution: 'Nombre de la Institución',
      degree: 'Licenciatura',
      fieldOfStudy: 'Ingeniería en Sistemas',
      graduationYear: currentYear.toString(),
    };

    onUpdate([newEducation, ...education]);
    setIsAdding(true);
  };

  const handleUpdate = (updatedEducation: Education) => {
    const updatedList = education.map(edu =>
      edu.id === updatedEducation.id ? updatedEducation : edu
    );
    onUpdate(updatedList);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    const updatedList = education.filter(edu => edu.id !== id);
    onUpdate(updatedList);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Educación</h3>
          <p className="text-sm text-slate-600 mt-1">
            Agrega tus títulos y certificaciones
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={isAdding}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Educación
        </button>
      </div>

      {/* Education List */}
      <div className="space-y-4">
        {sortedEducation.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No has agregado educación</p>
            <p className="text-sm text-slate-500 mt-1">
              Haz clic en "Agregar Educación" para comenzar
            </p>
          </div>
        ) : (
          sortedEducation.map(edu => (
            <EducationItem
              key={edu.id}
              education={edu}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};
