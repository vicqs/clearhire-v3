import React from 'react';
import { Briefcase, MapPin, Award } from 'lucide-react';
import type { Application } from '../../../types/application';
import TimelineCard from '../TimelineCard';
import Card from '../../core/Card';

export interface ApplicationTrackerProps {
  application: Application;
  onStageClick?: (stageId: string) => void;
  showScore?: boolean;
  confirmedInterviewDate?: Date | null;
}

const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  application,
  showScore = true,
  confirmedInterviewDate,
}) => {
  const sortedStages = [...application.stages].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card variant="glass">
        <div className="space-y-4">
          {/* Company & Position */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{application.position}</h1>
            <div className="flex items-center gap-2 text-slate-600">
              <Briefcase className="w-5 h-5" />
              <span className="text-lg">{application.company}</span>
            </div>
          </div>

          {/* Available Positions */}
          <div className="flex items-center gap-2 text-primary-600 font-semibold">
            <MapPin className="w-5 h-5" />
            <span>
              {application.availablePositions === 1
                ? 'Plaza disponible: 1'
                : `Plazas disponibles: ${application.availablePositions}`}
            </span>
          </div>

          {/* Final Score */}
          {showScore && application.finalScore !== undefined && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary-50 to-success-50 rounded-xl">
              <Award className="w-8 h-8 text-primary-600" />
              <div>
                <p className="text-sm text-slate-600">Calificación Final</p>
                <p className="text-3xl font-bold text-primary-600">{application.finalScore}%</p>
              </div>
            </div>
          )}

          {/* Interview Info - Show confirmed date from prop or application */}
          {(confirmedInterviewDate || application.interviewDate) && (
            <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-xl">
              <p className="text-sm text-success-700 dark:text-success-400 font-semibold mb-1">
                ✓ Entrevista Confirmada
              </p>
              <p className="text-success-900 dark:text-success-300">
                {new Intl.DateTimeFormat('es-MX', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                }).format(confirmedInterviewDate || application.interviewDate!)}
              </p>
            </div>
          )}

          {/* Pending Interview Selection - Only show if no date is confirmed */}
          {application.currentStageId === 'stage-3' && !application.interviewDate && !confirmedInterviewDate && (
            <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl">
              <p className="text-warning-800 dark:text-warning-300 font-semibold">
                ⚠️ Pendiente: Selecciona tu fecha de entrevista abajo
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Seguimiento de Postulación</h2>
        {sortedStages.map((stage, index) => (
          <TimelineCard
            key={stage.id}
            stage={stage}
            isLast={index === sortedStages.length - 1}
          />
        ))}
      </div>

      {/* Application Metadata */}
      <Card variant="solid" className="bg-slate-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Fecha de Aplicación</p>
            <p className="font-semibold text-slate-900">
              {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(application.appliedDate)}
            </p>
          </div>
          <div>
            <p className="text-slate-600">Última Actualización</p>
            <p className="font-semibold text-slate-900">
              {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(application.lastUpdate)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApplicationTracker;
