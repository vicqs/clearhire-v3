import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Briefcase, Calendar, Filter } from 'lucide-react';
import type { Application } from '../../../types/application';
import ApplicationTracker from '../ApplicationTracker';
import Card from '../../core/Card';
import Button from '../../core/Button';

export interface ApplicationHistoryProps {
  applications: Application[];
  onSelect: (id: string) => void;
  selectedId?: string;
  className?: string;
}

const ApplicationHistory: React.FC<ApplicationHistoryProps> = ({
  applications,
  onSelect,
  selectedId,
  className = '',
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(selectedId || null);
  const [filter, setFilter] = useState<'all' | 'active' | 'approved' | 'rejected'>('all');

  const groupedApplications = {
    active: applications.filter(app => app.status === 'active'),
    approved: applications.filter(app => app.status === 'approved'),
    rejected: applications.filter(app => app.status === 'rejected'),
  };

  const filteredApplications = filter === 'all' ? applications : groupedApplications[filter];

  const handleSelect = (id: string) => {
    const newExpandedId = expandedId === id ? null : id;
    setExpandedId(newExpandedId);
    onSelect(id);
  };

  const getStatusColor = (status: Application['status']) => {
    const colors: Record<Application['status'], string> = {
      active: 'text-primary-600 bg-primary-100 dark:text-primary-400 dark:bg-primary-900/30',
      screening: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      interview_scheduled: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
      interview_completed: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
      technical_evaluation: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30',
      reference_check: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30',
      finalist: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
      background_check: 'text-lime-600 bg-lime-100 dark:text-lime-400 dark:bg-lime-900/30',
      offer_pending: 'text-warning-600 bg-warning-100 dark:text-warning-400 dark:bg-warning-900/30',
      offer_accepted: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      offer_declined: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
      offer_negotiating: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
      approved: 'text-success-600 bg-success-100 dark:text-success-400 dark:bg-success-900/30',
      hired: 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30',
      rejected: 'text-danger-600 bg-danger-100 dark:text-danger-400 dark:bg-danger-900/30',
      withdrawn: 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800',
      on_hold: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30',
      expired: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
    };
    return colors[status];
  };

  return (
    <div className={className}>
      <Card variant="glass">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Historial de Postulaciones</h2>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                  Activas ({groupedApplications.active.length})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-success-500 rounded-full"></span>
                  Aprobadas ({groupedApplications.approved.length})
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-danger-500 rounded-full"></span>
                  Rechazadas ({groupedApplications.rejected.length})
                </span>
              </div>
            </div>
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-slate-300 focus:border-primary-500 focus:outline-none text-sm"
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="approved">Aprobadas</option>
                <option value="rejected">Rechazadas</option>
              </select>
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-3">
            {filteredApplications.map((app) => (
              <div key={app.id}>
                {/* Application Card */}
                <Card
                  variant="solid"
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    expandedId === app.id ? 'ring-2 ring-primary-500' : ''
                  }`}
                  onClick={() => handleSelect(app.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Briefcase className="w-5 h-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{app.position}</h3>
                        <p className="text-slate-600">{app.company}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(app.appliedDate)}
                          </span>
                          {app.finalScore && (
                            <span className="font-semibold">Score: {app.finalScore}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                        {app.status === 'active' && 'Activa'}
                        {app.status === 'screening' && 'Revisión CV'}
                        {app.status === 'interview_scheduled' && 'Entrevista Agendada'}
                        {app.status === 'interview_completed' && 'Entrevista Completada'}
                        {app.status === 'technical_evaluation' && 'Evaluación Técnica'}
                        {app.status === 'reference_check' && 'Verificación Referencias'}
                        {app.status === 'finalist' && 'Finalista'}
                        {app.status === 'background_check' && 'Verificación Antecedentes'}
                        {app.status === 'offer_pending' && 'Oferta Pendiente'}
                        {app.status === 'offer_accepted' && '✓ Oferta Aceptada'}
                        {app.status === 'offer_declined' && 'Oferta Rechazada'}
                        {app.status === 'offer_negotiating' && 'Negociando'}
                        {app.status === 'approved' && 'Aprobada'}
                        {app.status === 'hired' && '🎉 Contratado'}
                        {app.status === 'rejected' && 'Rechazada'}
                        {app.status === 'withdrawn' && 'Retirada'}
                        {app.status === 'on_hold' && 'En Espera'}
                        {app.status === 'expired' && 'Expirada'}
                      </span>
                      {app.isExclusive && (
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400 border border-gold-300 dark:border-gold-700">
                          Exclusiva
                        </span>
                      )}
                      {expandedId === app.id ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </Card>

                {/* Expanded Content */}
                {expandedId === app.id && (
                  <div className="mt-4 accordion-content">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Detalles de la Postulación</h3>
                      <Button
                        variant="ghost"
                        onClick={() => setExpandedId(null)}
                        className="text-sm"
                      >
                        Volver al Historial
                      </Button>
                    </div>
                    <ApplicationTracker application={app} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600">No hay postulaciones en esta categoría</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ApplicationHistory;
