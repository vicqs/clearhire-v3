import React, { useState } from 'react';
import { Pencil, Trash2, Save, X, User, Upload, FileText } from 'lucide-react';
import { Reference } from '../../../types/profile';
import { validateEmail, validatePhone, validateRequired, validateFile } from '../../../utils/validation';
import { ConfirmDialog } from '../../core/ConfirmDialog';

interface ReferenceItemProps {
  reference: Reference;
  onUpdate: (reference: Reference) => void;
  onDelete: (id: string) => void;
}

const COUNTRIES_WITH_CODES = [
  { name: 'Argentina', code: '+54' },
  { name: 'Bolivia', code: '+591' },
  { name: 'Brasil', code: '+55' },
  { name: 'Chile', code: '+56' },
  { name: 'Colombia', code: '+57' },
  { name: 'Costa Rica', code: '+506' },
  { name: 'Ecuador', code: '+593' },
  { name: 'El Salvador', code: '+503' },
  { name: 'Guatemala', code: '+502' },
  { name: 'Honduras', code: '+504' },
  { name: 'México', code: '+52' },
  { name: 'Nicaragua', code: '+505' },
  { name: 'Panamá', code: '+507' },
  { name: 'Paraguay', code: '+595' },
  { name: 'Perú', code: '+51' },
  { name: 'República Dominicana', code: '+1-809' },
  { name: 'Uruguay', code: '+598' },
  { name: 'Venezuela', code: '+58' },
];

export const ReferenceItem: React.FC<ReferenceItemProps> = ({
  reference,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Reference>(reference);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (field: keyof Reference, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleCountryChange = (countryName: string) => {
    const country = COUNTRIES_WITH_CODES.find(c => c.name === countryName);
    if (country) {
      // Update country and phone code
      setFormData(prev => ({
        ...prev,
        country: countryName,
        phone: country.code + ' ',
      }));
    } else {
      setFormData(prev => ({ ...prev, country: countryName }));
    }
    
    // Clear errors
    if (errors.country) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.country;
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        setErrors(prev => ({ ...prev, attachment: validation.error! }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.attachment;
          return newErrors;
        });
        // In a real app, you would upload the file and get a URL
        setFormData(prev => ({ ...prev, attachmentUrl: URL.createObjectURL(file) }));
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameValidation = validateRequired(formData.name, 'Nombre');
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error!;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    }

    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error!;
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
    setFormData(reference);
    setErrors({});
    setSelectedFile(null);
    setIsEditing(false);
  };

  const getPhonePlaceholder = () => {
    const country = COUNTRIES_WITH_CODES.find(c => c.name === formData.country);
    return country ? `${country.code} 1234567890` : '+52 1234567890';
  };

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100`}
            placeholder="Nombre de la referencia"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            País
          </label>
          <select
            value={formData.country || ''}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">Selecciona un país</option>
            {COUNTRIES_WITH_CODES.map(country => (
              <option key={country.name} value={country.name}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Correo Electrónico *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100`}
            placeholder="correo@ejemplo.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Teléfono *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100`}
            placeholder={getPhonePlaceholder()}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
          {formData.country && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Código de {formData.country}: {COUNTRIES_WITH_CODES.find(c => c.name === formData.country)?.code}
            </p>
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Carta de Recomendación (PDF, máx 5MB)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:border-blue-400 cursor-pointer transition-colors flex items-center gap-2 dark:bg-slate-700">
              <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
              </span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
          {errors.attachment && (
            <p className="mt-1 text-sm text-red-600">{errors.attachment}</p>
          )}
          {formData.attachmentUrl && (
            <p className="mt-1 text-xs text-green-600">✓ Archivo adjunto</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
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
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 flex-1">
          <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{reference.name}</h3>
            {reference.country && (
              <p className="text-slate-500 dark:text-slate-400 text-sm">{reference.country}</p>
            )}
            <p className="text-slate-600 dark:text-slate-400 mt-1">{reference.email}</p>
            <p className="text-slate-600 dark:text-slate-400">{reference.phone}</p>
            {reference.attachmentUrl && (
              <div className="flex items-center gap-2 mt-3 text-sm text-blue-600 dark:text-blue-400">
                <FileText className="w-4 h-4" />
                <a
                  href={reference.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Ver carta de recomendación
                </a>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
        onConfirm={() => onDelete(reference.id)}
        title="Eliminar Referencia"
        message={`¿Estás seguro de que deseas eliminar la referencia de ${reference.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};
