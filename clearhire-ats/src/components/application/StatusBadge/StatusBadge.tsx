import React from 'react';
import { CheckCircle, Clock, XCircle, Circle } from 'lucide-react';
import type { StageStatus } from '../../../types/application';

export interface StatusBadgeProps {
  status: StageStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig: Record<StageStatus, { icon: React.ReactNode; label: string; classes: string }> = {
    completed: {
      icon: <CheckCircle className="w-5 h-5" />,
      label: 'Completado',
      classes: 'bg-success-100 text-success-600 border-success-200 dark:bg-success-900/30 dark:text-success-400 dark:border-success-800',
    },
    in_progress: {
      icon: <Clock className="w-5 h-5" />,
      label: 'En Proceso',
      classes: 'bg-primary-100 text-primary-600 border-primary-200 status-in-progress dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800',
    },
    rejected: {
      icon: <XCircle className="w-5 h-5" />,
      label: 'Rechazado',
      classes: 'bg-danger-100 text-danger-600 border-danger-200 dark:bg-danger-900/30 dark:text-danger-400 dark:border-danger-800',
    },
    pending: {
      icon: <Circle className="w-5 h-5" />,
      label: 'Pendiente',
      classes: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    },
    scheduled: {
      icon: <Clock className="w-5 h-5" />,
      label: 'Agendado',
      classes: 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    },
    awaiting_feedback: {
      icon: <Clock className="w-5 h-5" />,
      label: 'Esperando Retroalimentación',
      classes: 'bg-warning-100 text-warning-600 border-warning-200 dark:bg-warning-900/30 dark:text-warning-400 dark:border-warning-800',
    },
    under_review: {
      icon: <Clock className="w-5 h-5" />,
      label: 'Bajo Revisión',
      classes: 'bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    },
    awaiting_candidate: {
      icon: <Clock className="w-5 h-5" />,
      label: 'Esperando Candidato',
      classes: 'bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    },
    awaiting_company: {
      icon: <Clock className="w-5 h-5" />,
      label: 'Esperando Empresa',
      classes: 'bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
    },
    passed: {
      icon: <CheckCircle className="w-5 h-5" />,
      label: 'Aprobado',
      classes: 'bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    },
    failed: {
      icon: <XCircle className="w-5 h-5" />,
      label: 'No Aprobado',
      classes: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm transition-all duration-300 ${config.classes} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
};

export default StatusBadge;
