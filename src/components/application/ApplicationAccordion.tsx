import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Briefcase, 
  Calendar, 
  Clock,
  MapPin,
  Star,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import ApplicationTracker from './ApplicationTracker';
import FeedbackCard from '../feedback/FeedbackCard';
import SchedulerInterface from '../scheduler/SchedulerInterface';
import type { Application } from '../../types/application';
import type { TimeSlot } from '../../types/profile';

interface ApplicationAccordionProps {
  applications: Application[];
  selectedId?: string;
  onSelect: (id: string) => void;
  confirmedInterviewDates?: Record<string, Date>;
  onScheduleConfirm?: (applicationId: string, slot: TimeSlot) => void;
  whatsappEnabled?: boolean;
  onWhatsAppToggle?: (enabled: boolean) => void;
  className?: string;
}

const ApplicationAccordion: React.FC<ApplicationAccordionProps> = ({
  applications,
  selectedId,
  onSelect,
  confirmedInterviewDates = {},
  onScheduleConfirm,
  whatsappEnabled = false,
  onWhatsAppToggle,
  className = ''
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const [expandedId, setExpandedId] = useState<string | null>(selectedId || null);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  const handleToggleExpand = (applicationId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    triggerHaptic('light');
    
    if (expandedId === applicationId && viewMode === 'detailed') {
      // Si ya está expandido, colapsar
      setExpandedId(null);
      setViewMode('compact');
    } else {
      // Expandir nueva aplicación
      setExpandedId(applicationId);
      setViewMode('detailed');
      onSelect(applicationId);
    }
  };

  const handleBackToList = () => {
    triggerHaptic('light');
    setExpandedId(null);
    setViewMode('compact');
  };

  const getStatusInfo = (status: Application['status']) => {
    const statusMap = {
      active: { label: 'Activa', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: '🔄' },
      screening: { label: 'Revisión CV', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: '📄' },
      interview_scheduled: { label: 'Entrevista Agendada', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: '📅' },
      interview_completed: { label: 'Entrevista Completada', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', icon: '✅' },
      technical_evaluation: { label: 'Evaluación Técnica', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: '💻' },
      reference_check: { label: 'Verificación Referencias', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400', icon: '📞' },
      finalist: { label: 'Finalista', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '🏆' },
      background_check: { label: 'Verificación Antecedentes', color: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400', icon: '🔍' },
      offer_pending: { label: 'Oferta Pendiente', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', icon: '📋' },
      offer_accepted: { label: 'Oferta Aceptada', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: '✅' },
      offer_declined: { label: 'Oferta Rechazada', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '❌' },
      offer_negotiating: { label: 'Negociando', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: '🤝' },
      approved: { label: 'Aprobada', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '🎉' },
      hired: { label: 'Contratado', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: '🎊' },
      rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '❌' },
      withdrawn: { label: 'Retirada', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400', icon: '🚪' },
      on_hold: { label: 'En Espera', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', icon: '⏸️' },
      expired: { label: 'Expirada', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: '⏰' }
    };
    
    return statusMap[status] || statusMap.active;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    return `Hace ${Math.floor(diffInDays / 30)} meses`;
  };

  // Vista detallada cuando hay una aplicación expandida
  if (expandedId && viewMode === 'detailed') {
    const selectedApp = applications.find(app => app.id === expandedId);
    if (!selectedApp) return null;

    const statusInfo = getStatusInfo(selectedApp.status);
    const confirmedDate = confirmedInterviewDates[expandedId];
    const currentStage = selectedApp.stages.find(s => s.status === 'in_progress');
    const showScheduler = currentStage?.name === 'Evaluación Técnica';
    const rejectionStage = selectedApp.stages.find(s => s.status === 'rejected' && s.feedback);

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header con navegación */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Volver al listado</span>
            </button>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                {statusInfo.icon} {statusInfo.label}
              </span>
              {selectedApp.isExclusive && (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-300">
                  Exclusiva
                </span>
              )}
            </div>
          </div>

          {/* Información de la aplicación */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {selectedApp.position}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                {selectedApp.company}
              </p>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Aplicado: {formatDate(selectedApp.appliedDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{getTimeAgo(selectedApp.lastUpdate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{selectedApp.availablePositions} plaza{selectedApp.availablePositions !== 1 ? 's' : ''} disponible{selectedApp.availablePositions !== 1 ? 's' : ''}</span>
              </div>
              {selectedApp.finalScore && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span className="font-semibold">Score: {selectedApp.finalScore}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="bg-gradient-to-br from-white/50 to-slate-50/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-3xl p-6 border-2 border-primary-200 dark:border-primary-800 shadow-xl">
          {/* Application Tracker */}
          <div className="mb-6">
            <ApplicationTracker 
              application={selectedApp} 
              confirmedInterviewDate={confirmedDate}
            />
          </div>

          {/* Paneles anidados */}
          <div className="ml-4 pl-6 border-l-4 border-primary-300 dark:border-primary-700 space-y-6">
            {/* Scheduler */}
            {showScheduler && !confirmedDate && onScheduleConfirm && (
              <div className="relative">
                <div className="absolute -left-[1.6rem] top-6 w-4 h-4 bg-primary-400 dark:bg-primary-600 rounded-full border-4 border-white dark:border-slate-800"></div>
                <SchedulerInterface
                  applicationId={selectedApp.id}
                  onConfirm={(slot) => onScheduleConfirm(selectedApp.id, slot)}
                  whatsappEnabled={whatsappEnabled}
                  onWhatsAppToggle={onWhatsAppToggle || (() => {})}
                />
              </div>
            )}

            {/* Feedback Card */}
            {rejectionStage?.feedback && (
              <div className="relative">
                <div className="absolute -left-[1.6rem] top-6 w-4 h-4 bg-red-400 dark:bg-red-600 rounded-full border-4 border-white dark:border-slate-800"></div>
                <FeedbackCard
                  feedback={rejectionStage.feedback}
                  score={selectedApp.finalScore}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vista compacta (lista de aplicaciones)
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Mis Postulaciones
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {applications.length} postulación{applications.length !== 1 ? 'es' : ''} en total
            </p>
          </div>
          
          <button
            onClick={() => {
              triggerHaptic('light');
              setViewMode(viewMode === 'compact' ? 'detailed' : 'compact');
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {viewMode === 'compact' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {viewMode === 'compact' ? 'Más detalles' : 'Menos detalles'}
          </button>
        </div>
        
        {/* Tip de ayuda */}
        {applications.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Haz clic en cualquier postulación para ver el seguimiento detallado con timeline, feedback y próximos pasos.
            </p>
          </div>
        )}
      </div>

      {/* Lista de aplicaciones */}
      <div className="space-y-3">
        {applications.map((app) => {
          const statusInfo = getStatusInfo(app.status);
          const isExpanded = expandedId === app.id;
          const currentStage = app.stages.find(s => s.status === 'in_progress');
          const completedStages = app.stages.filter(s => s.status === 'completed').length;
          const totalStages = app.stages.length;
          
          return (
            <div key={app.id} className="group">
              {/* Card principal */}
              <button
                onClick={(e) => handleToggleExpand(app.id, e)}
                className={`w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border transition-all hover:shadow-lg group-hover:scale-[1.02] active:scale-[0.98] ${
                  isExpanded 
                    ? 'border-primary-500 dark:border-primary-400 shadow-lg shadow-primary-200 dark:shadow-primary-900/30' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 text-left">
                    {/* Icono de empresa */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isExpanded 
                        ? 'bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30' 
                        : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600'
                    }`}>
                      <Briefcase className={`w-6 h-6 transition-colors ${
                        isExpanded 
                          ? 'text-primary-600 dark:text-primary-400' 
                          : 'text-slate-600 dark:text-slate-400'
                      }`} />
                    </div>
                    
                    {/* Información principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                          {app.position}
                        </h3>
                        {app.isExclusive && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-300 flex-shrink-0">
                            Exclusiva
                          </span>
                        )}
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-400 truncate mb-2">
                        {app.company}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(app.appliedDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getTimeAgo(app.lastUpdate)}
                        </span>
                        {app.finalScore && (
                          <span className="flex items-center gap-1 font-semibold">
                            <Star className="w-3 h-3" />
                            {app.finalScore}%
                          </span>
                        )}
                      </div>
                      
                      {/* Detalles adicionales en modo detailed */}
                      {viewMode === 'detailed' && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                          {/* Progreso de etapas */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                                <span>Progreso</span>
                                <span className="font-semibold">{completedStages}/{totalStages} etapas</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-primary-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${(completedStages / totalStages) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          {/* Etapa actual */}
                          {currentStage && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-slate-600 dark:text-slate-400">Etapa actual:</span>
                              <span className="font-semibold text-primary-600 dark:text-primary-400">{currentStage.name}</span>
                            </div>
                          )}
                          
                          {/* Información adicional */}
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {app.availablePositions} vacante{app.availablePositions !== 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Actualizado {getTimeAgo(app.lastUpdate)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Estado y chevron */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                    
                    <div className="transition-transform duration-200">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {applications.length === 0 && (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-12 border border-slate-200 dark:border-slate-700 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            ¡Comienza tu búsqueda de empleo!
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Cuando apliques a posiciones, podrás seguir el progreso de cada postulación aquí con transparencia total.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Seguimiento en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Feedback constructivo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Notificaciones automáticas</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationAccordion;