import React, { useState } from 'react';
import { Pencil, Trash2, Save, X, Briefcase } from 'lucide-react';
import { WorkExperience } from '../../../types/profile';
import { validateRequired, validateDateRange } from '../../../utils/validation';
import { ConfirmDialog } from '../../core/ConfirmDialog';

interface ExperienceItemProps {
  experience: WorkExperience;
  onUpdate: (experience: WorkExperience) => void;
  onDelete: (id: string) => void;
}

const POSITIONS = [
  // Desarrollo de Software
  'Desarrollador Frontend',
  'Desarrollador Backend',
  'Desarrollador Full Stack',
  'Ingeniero de Software',
  'Ingeniero de Software Senior',
  'Arquitecto de Software',
  'Desarrollador Mobile',
  'Desarrollador iOS',
  'Desarrollador Android',
  
  // DevOps & Cloud
  'DevOps Engineer',
  'Site Reliability Engineer (SRE)',
  'Cloud Engineer',
  'Infrastructure Engineer',
  
  // Data & AI
  'Data Scientist',
  'Data Engineer',
  'Data Analyst',
  'Machine Learning Engineer',
  'AI Engineer',
  'Business Intelligence Analyst',
  
  // QA & Testing
  'QA Engineer',
  'QA Automation Engineer',
  'Test Engineer',
  
  // Diseño
  'Diseñador UX/UI',
  'Diseñador de Producto',
  'Diseñador Gráfico',
  'Diseñador de Experiencia',
  
  // Gestión de Producto
  'Product Manager',
  'Product Owner',
  'Technical Product Manager',
  
  // Gestión de Proyectos
  'Project Manager',
  'Scrum Master',
  'Agile Coach',
  'Program Manager',
  
  // Seguridad
  'Security Engineer',
  'Cybersecurity Analyst',
  'Security Architect',
  
  // Liderazgo Técnico
  'Tech Lead',
  'Engineering Manager',
  'Director de Ingeniería',
  'CTO',
  'VP de Ingeniería',
  
  // Otros
  'Consultor Técnico',
  'Solutions Architect',
  'Otro',
];

export const ExperienceItem: React.FC<ExperienceItemProps> = ({
  experience,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<WorkExperience>(experience);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (field: keyof WorkExperience, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
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

    const companyValidation = validateRequired(formData.company, 'Empresa');
    if (!companyValidation.isValid) {
      newErrors.company = companyValidation.error!;
    }

    const positionValidation = validateRequired(formData.position, 'Cargo');
    if (!positionValidation.isValid) {
      newErrors.position = positionValidation.error!;
    }

    const dateValidation = validateDateRange(formData.startDate, formData.endDate);
    if (!dateValidation.isValid) {
      newErrors.dateRange = dateValidation.error!;
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
    setFormData(experience);
    setErrors({});
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Empresa *
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.company ? 'border-red-500' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="Nombre de la empresa"
          />
          {errors.company && (
            <p className="mt-1 text-sm text-red-600">{errors.company}</p>
          )}
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cargo *
          </label>
          <select
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.position ? 'border-red-500' : 'border-slate-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
          >
            <option value="">Selecciona un cargo</option>
            {POSITIONS.map(position => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
          {errors.position && (
            <p className="mt-1 text-sm text-red-600">{errors.position}</p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fecha de Fin *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        {errors.dateRange && (
          <p className="text-sm text-red-600">{errors.dateRange}</p>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Descripción de las funciones laborales
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Describe tus responsabilidades y logros..."
          />
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
          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">{experience.position}</h3>
            <p className="text-slate-600 mt-1">{experience.company}</p>
            <p className="text-sm text-slate-500 mt-2">
              {formatDate(experience.startDate)} - {formatDate(experience.endDate)}
            </p>
            {experience.description && (
              <p className="text-slate-700 mt-3 text-sm leading-relaxed">
                {experience.description}
              </p>
            )}
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
        onConfirm={() => onDelete(experience.id)}
        title="Eliminar Experiencia"
        message={`¿Estás seguro de que deseas eliminar tu experiencia en ${experience.company}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};
