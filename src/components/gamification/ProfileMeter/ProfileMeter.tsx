import React from 'react';
import { CheckCircle } from 'lucide-react';
import Card from '../../core/Card';

export interface ProfileMeterProps {
  completion: number;
  className?: string;
}

const ProfileMeter: React.FC<ProfileMeterProps> = ({ completion, className = '' }) => {
  const getColor = () => {
    if (completion === 100) return 'text-success-600';
    if (completion >= 70) return 'text-primary-600';
    if (completion >= 40) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getSuggestions = () => {
    const suggestions = [];
    if (completion < 100) {
      if (completion < 20) suggestions.push('Completa tu información personal');
      if (completion < 45) suggestions.push('Agrega tu experiencia laboral');
      if (completion < 65) suggestions.push('Incluye tu educación');
      if (completion < 80) suggestions.push('Añade tus habilidades');
      if (completion < 90) suggestions.push('Registra los idiomas que hablas');
      if (completion < 100) suggestions.push('Agrega referencias profesionales');
    }
    return suggestions;
  };

  const suggestions = getSuggestions();

  return (
    <Card variant="glass" className={className}>
      <div className="flex items-center gap-4">
        {/* Circular Progress - Smaller */}
        <div className="relative flex-shrink-0">
          <svg width="80" height="80" className="transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-slate-200"
            />
            {/* Progress Circle */}
            <circle
              cx="40"
              cy="40"
              r="32"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 - (completion / 100) * 2 * Math.PI * 32}
              strokeLinecap="round"
              className={`${getColor()} progress-fill`}
            />
          </svg>
          {/* Percentage Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${getColor()}`}>{completion}%</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Perfil</h3>
          {completion === 100 ? (
            <div className="flex items-center gap-1 text-success-600 text-sm font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>¡Completo!</span>
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {suggestions[0] || 'Completa tu perfil'}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProfileMeter;
