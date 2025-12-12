import React from 'react';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import type { Stage } from '../../../types/application';
import StatusBadge from '../StatusBadge';
import Card from '../../core/Card';

export interface TimelineCardProps {
  stage: Stage;
  isLast?: boolean;
  className?: string;
}

const TimelineCard: React.FC<TimelineCardProps> = ({ stage, isLast = false, className = '' }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getDaysRemaining = () => {
    if (stage.status !== 'in_progress') return null;
    const today = new Date();
    const elapsed = Math.floor((today.getTime() - stage.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = stage.estimatedDays - elapsed;
    return remaining > 0 ? remaining : 0;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className={`relative ${className}`}>
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-slate-200" />
      )}

      <Card variant="glass" className="relative">
        {/* Stage Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{stage.name}</h3>
            <StatusBadge status={stage.status} />
          </div>
          {stage.score !== undefined && (
            <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <span className="text-lg font-bold text-primary-600">{stage.score}%</span>
            </div>
          )}
        </div>

        {/* Recruiter Info */}
        {stage.recruiter && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
            <img
              src={stage.recruiter.avatar}
              alt={stage.recruiter.name}
              className="w-12 h-12 rounded-full border-2 border-white shadow-md"
            />
            <div>
              <p className="font-semibold text-slate-900">{stage.recruiter.name}</p>
              <p className="text-sm text-slate-600">{stage.recruiter.title}</p>
            </div>
          </div>
        )}

        {/* Timeline Info */}
        <div className="space-y-2 text-sm">
          {stage.startDate && (
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>Inicio: {formatDate(stage.startDate)}</span>
            </div>
          )}

          {stage.endDate && (
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>Fin: {formatDate(stage.endDate)}</span>
            </div>
          )}

          {daysRemaining !== null && (
            <div className="flex items-center gap-2 text-primary-600 font-semibold">
              <Clock className="w-4 h-4" />
              <span>Tiempo estimado en esta etapa: {daysRemaining} días</span>
            </div>
          )}

          {stage.actualDays && stage.status === 'completed' && (
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <span>Duración real: {stage.actualDays} días</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TimelineCard;
