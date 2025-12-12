import React, { useState } from 'react';
import { Pencil, Trash2, Save, X, GraduationCap } from 'lucide-react';
import { Education } from '../../../types/profile';
import { validateRequired } from '../../../utils/validation';
import { ConfirmDialog } from '../../core/ConfirmDialog';

interface EducationItemProps {
  education: Education;
  onUpdate: (education: Education) => void;
  onDelete: (id: string) => void;
}

const DEGREES = [
  'Bachillerato',
  'Técnico',
  'Licenciatura',
  'Ingeniería',
  'Maestría',
  'Doctorado',
  'Diplomado',
  'Certificación',
];

const FIELDS_OF_STUDY = [
  'Ingeniería en Sistemas',
  'Ciencias de la Computación',
  'Ingeniería de Software',
  'Tecnologías de la Información',
  'Administración de Empresas',
  'Marketing',
  'Diseño Gráfico',
  'Diseño UX/UI',
  'Psicología',
  'Comunicación',
  'Otro',
];

export const EducationItem: React.FC<EducationItemProps> = ({
  education,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Education>(education);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (field: keyof Education, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const institutionValidation = validateRequired(formData.institution, 'Institución');
    if (!institutionValidation.isValid) {
      newErrors.institution = institutionValidation.error!;
    }

    const degreeValidation = validateRequired(formData.degree, 'Título');
    if (!degreeValidation.isValid) {
      newErrors.degree = degreeValidation.error!;
    }

    const fieldValidation = validateRequired(formData.fieldOfStudy, 'Campo de estudio');
    if (!fieldValidation.isValid) {
      newErrors.fieldOfStudy = fieldValidation.error!;
    }

    const yearValidation = validateRequired(formData.graduationYear, 'Año de graduación');
    if (!yearValidation.isValid) {
      newErrors.graduationYear = yearValidation.error!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onUpdate(formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData(education);
    setErrors({});
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        {/* Institution */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Institución *
          </label>
          <input
            type="text"
            value={formData.institution}
            onChange={(e) => handleChange('institution', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.institution ? 'border-red-500' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Nombre de la institución"
          />
          {errors.institution && (
            <p className="mt-1 text-sm text-red-600">{errors.institution}</p>
          )}
        </div>

        {/* Degree */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Título *
          </label>
          <select
            value={formData.degree}
            onChange={(e) => handleChange('degree', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.degree ? 'border-red-500' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
          >
            <option value="">Selecciona un título</option>
            {DEGREES.map(degree => (
              <option key={degree} value={degree}>
                {degree}
              </option>
            ))}
          </select>
          {errors.degree && (
            <p className="mt-1 text-sm text-red-600">{errors.degree}</p>
          )}
        </div>

        {/* Field of Study */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Campo de Estudio *
          </label>
          <select
            value={formData.fieldOfStudy}
            onChange={(e) => handleChange('fieldOfStudy', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.fieldOfStudy ? 'border-red-500' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
          >
            <option value="">Selecciona un campo</option>
            {FIELDS_OF_STUDY.map(field => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
          {errors.fieldOfStudy && (
            <p className="mt-1 text-sm text-red-600">{errors.fieldOfStudy}</p>
          )}
        </div>

        {/* Graduation Year */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Año de Graduación *
          </label>
          <input
            type="number"
            min="1950"
            max={new Date().getFullYear() + 10}
            value={formData.graduationYear}
            onChange={(e) => handleChange('graduationYear', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.graduationYear ? 'border-red-500' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="2024"
          />
          {errors.graduationYear && (
            <p className="mt-1 text-sm text-red-600">{errors.graduationYear}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 flex-1">
          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">{education.degree}</h3>
            <p className="text-slate-600 mt-1">{education.fieldOfStudy}</p>
            <p className="text-slate-700 mt-2">{education.institution}</p>
            <p className="text-sm text-slate-500 mt-1">
              Graduación: {education.graduationYear}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete(education.id)}
        title="Eliminar Educación"
        message={`¿Estás seguro de que deseas eliminar tu educación en ${education.institution}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};
