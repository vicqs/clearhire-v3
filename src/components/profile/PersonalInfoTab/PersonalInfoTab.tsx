import React, { useState, useEffect } from 'react';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { validateEmail, validatePhone, validateRequired } from '../../../utils/validation';
import { PersonalInfo } from '../../../types/profile';

interface PersonalInfoTabProps {
  data: PersonalInfo;
  onUpdate: (data: PersonalInfo) => Promise<void>;
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

export const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ data, onUpdate }) => {
  const [formData, setFormData] = useState<PersonalInfo>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { saveStatus, lastSaved } = useAutoSave({
    data: formData,
    onSave: onUpdate,
    delay: 1000,
  });

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (field: keyof PersonalInfo, value: string) => {
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

  const getPhonePlaceholder = () => {
    const country = COUNTRIES_WITH_CODES.find(c => c.name === formData.country);
    return country ? `${country.code} 1234567890` : '+52 1234567890';
  };

  const getPhoneHelper = () => {
    const country = COUNTRIES_WITH_CODES.find(c => c.name === formData.country);
    return country 
      ? `Código de ${country.name}: ${country.code}` 
      : 'Incluye el código de país (ej: +52 para México)';
  };

  const handleBlur = (field: keyof PersonalInfo) => {
    const value = formData[field];
    let validation;

    switch (field) {
      case 'email':
        validation = validateEmail(value);
        break;
      case 'phone':
        validation = validatePhone(value);
        break;
      case 'firstName':
        validation = validateRequired(value, 'Nombre');
        break;
      case 'lastName':
        validation = validateRequired(value, 'Apellidos');
        break;
      case 'country':
        validation = validateRequired(value, 'País');
        break;
      default:
        validation = { isValid: true };
    }

    if (!validation.isValid && validation.error) {
      setErrors(prev => ({ ...prev, [field]: validation.error! }));
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Guardando...';
      case 'saved':
        return `Guardado ${lastSaved ? `a las ${lastSaved.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : ''}`;
      case 'error':
        return 'Error al guardar';
      default:
        return '';
    }
  };

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return 'text-blue-600';
      case 'saved':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Save Status Indicator */}
      <div className="flex justify-end">
        <span className={`text-sm ${getSaveStatusColor()} transition-colors`}>
          {getSaveStatusText()}
        </span>
      </div>

      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
          Nombre *
        </label>
        <input
          id="firstName"
          type="text"
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          onBlur={() => handleBlur('firstName')}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.firstName ? 'border-red-500' : 'border-slate-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          placeholder="Ingresa tu nombre"
        />
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
          Apellidos *
        </label>
        <input
          id="lastName"
          type="text"
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          onBlur={() => handleBlur('lastName')}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.lastName ? 'border-red-500' : 'border-slate-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          placeholder="Ingresa tus apellidos"
        />
        {errors.lastName && (
          <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
        )}
      </div>

      {/* Country */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          País *
        </label>
        <select
          id="country"
          value={formData.country || 'Costa Rica'}
          onChange={(e) => handleCountryChange(e.target.value)}
          onBlur={() => handleBlur('country')}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.country ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white dark:bg-slate-800 dark:text-slate-100`}
        >
          {COUNTRIES_WITH_CODES.map(country => (
            <option key={country.name} value={country.name}>
              {country.name} ({country.code})
            </option>
          ))}
        </select>
        {errors.country && (
          <p className="mt-1 text-sm text-red-600">{errors.country}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Número de Teléfono *
        </label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          onBlur={() => handleBlur('phone')}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-slate-800 dark:text-slate-100`}
          placeholder={getPhonePlaceholder()}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {getPhoneHelper()}
        </p>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          Correo Electrónico *
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          className={`w-full px-4 py-3 rounded-lg border ${
            errors.email ? 'border-red-500' : 'border-slate-300'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
          placeholder="tu@email.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
    </div>
  );
};
