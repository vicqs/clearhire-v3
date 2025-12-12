import React from 'react';
import { TrendingUp, BookOpen, ExternalLink, AlertCircle } from 'lucide-react';
import type { Recommendation } from '../../../types/application';
import Card from '../../core/Card';

export interface ActionableGrowthProps {
  recommendations: Recommendation[];
  className?: string;
}

const ActionableGrowth: React.FC<ActionableGrowthProps> = ({ recommendations, className = '' }) => {
  const priorityConfig = {
    high: { color: 'text-danger-600', bg: 'bg-danger-100', label: 'Alta Prioridad' },
    medium: { color: 'text-warning-600', bg: 'bg-warning-100', label: 'Prioridad Media' },
    low: { color: 'text-primary-600', bg: 'bg-primary-100', label: 'Prioridad Baja' },
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-6 h-6 text-success-600" />
        <h3 className="text-xl font-bold text-slate-900">Recomendaciones para Crecer</h3>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => {
          const priority = priorityConfig[rec.priority];
          return (
            <Card key={rec.id} variant="solid" className="hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-success-100 rounded-lg flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-success-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-slate-900">{rec.skill}</h4>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${priority.bg} ${priority.color}`}>
                      {priority.label}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-3">{rec.resource}</p>
                  <a
                    href={rec.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    <span>Ver Recurso</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-success-800">
          <strong>Recuerda:</strong> Cada rechazo es una oportunidad para mejorar. Estas recomendaciones están diseñadas para ayudarte a fortalecer tus habilidades y tener éxito en futuras postulaciones.
        </p>
      </div>
    </div>
  );
};

export default ActionableGrowth;
