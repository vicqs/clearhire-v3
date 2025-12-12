import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import ApplicationAccordion from '../components/application/ApplicationAccordion';
import GamificationPanel from '../components/gamification/GamificationPanel';
import NotificationCenter from '../components/notifications/NotificationCenter';
import { PullToRefresh } from '../components/core/PullToRefresh';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useNotifications } from '../hooks/useNotifications';
import { useApplications } from '../hooks/useApplications';
import { useProfile } from '../hooks/useProfile';
import { DebugSidebar } from '../components/debug/DebugSidebar';
import type { TimeSlot } from '../types/profile';
import type { ApplicationStatus } from '../types/application';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { triggerHaptic } = useHapticFeedback();

  // 🔥 Usar hooks de Supabase
  const { applications, loading: appsLoading, updateApplication } = useApplications();
  const { profile, loading: profileLoading } = useProfile();

  const [selectedApplicationId, setSelectedApplicationId] = useState<string>('');
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [confirmedInterviewDates, setConfirmedInterviewDates] = useState<Record<string, Date>>({});
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  // Hook de notificaciones
  // Obtener ID real del usuario para RLS
  const [candidateId, setCandidateId] = useState<string>('candidate_1');

  React.useEffect(() => {
    const getUserId = async () => {
      try {
        // Usar supabase directamente para garantizar el ID de autenticación
        const { supabase } = await import('../lib/supabase');

        if (supabase) {
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            console.log('✅ Dashboard user ID:', data.user.id);
            setCandidateId(data.user.id);
            return;
          }
        }

        // Fallback a dataService si no hay usuario directo (caso mock)
        const { dataService } = await import('../services/dataService');
        const userId = dataService.getCurrentUserId();
        if (userId && userId !== 'mock-user') {
          setCandidateId(userId);
        }
      } catch (e) {
        console.error('Error getting user ID:', e);
      }
    };
    getUserId();
  }, []);

  const {
    notifications,
    unreadCount,
    analytics,
    sendStatusChangeNotification,
    scheduleInterviewReminder,
    sendDeadlineAlert,
    sendFeedbackNotification,
    clearAllNotifications
  } = useNotifications(candidateId);

  // Cargar badges reales
  const [badges, setBadges] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchBadges = async () => {
      try {
        if (profile && profile.id) {
          // Importación dinámica para romper ciclo si es necesario, o uso directo si dataService está importado
          const { dataService } = await import('../services/dataService');
          const userBadges = await dataService.getBadges(profile.id);
          setBadges(userBadges);
        }
      } catch (error) {
        console.error('Error fetching badges for dashboard:', error);
      }
    };
    fetchBadges();
  }, [profile]);

  // Filter applications based on status
  const filteredApplications = statusFilter === 'all'
    ? applications
    : applications.filter(app => app.status === statusFilter);

  // Mostrar loading
  if (appsLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  const handleScheduleConfirm = async (slot: TimeSlot) => {
    triggerHaptic('success');
    // Store the confirmed date for this specific application
    setConfirmedInterviewDates(prev => ({
      ...prev,
      [selectedApplicationId]: slot.date
    }));

    // 🔥 Guardar en Supabase
    try {
      await updateApplication(selectedApplicationId, {
        interviewDate: slot.date,
        interviewConfirmed: true,
        lastUpdate: new Date(),
      });
      console.log('✅ Entrevista confirmada y guardada en Supabase');
    } catch (error) {
      console.error('Error guardando entrevista:', error);
    }
  };

  const handleApplicationSelect = (id: string) => {
    triggerHaptic('light');
    setSelectedApplicationId(id);
    setStatusFilter('all'); // Reset filter when selecting specific application
  };

  const handleRefresh = async () => {
    triggerHaptic('medium');
    // Simulate API call to refresh data
    await new Promise(resolve => setTimeout(resolve, 1000));
    triggerHaptic('success');
  };

  const handleStatusFilterClick = (status: ApplicationStatus | 'all') => {
    triggerHaptic('light');
    setStatusFilter(status);
    // Select first application of that status
    const firstApp = status === 'all'
      ? applications[0]
      : applications.find(app => app.status === status);
    if (firstApp) {
      setSelectedApplicationId(firstApp.id);
    }
  };

  const handleProfileClick = () => {
    triggerHaptic('light');
    navigate('/profile');
  };

  const handleNotificationClick = () => {
    triggerHaptic('light');
    setNotificationCenterOpen(true);
  };


  const profileCompletion = profile ? Math.round(
    (profile.personalInfo.firstName ? 20 : 0) +
    (profile.experience.length > 0 ? 25 : 0) +
    (profile.education.length > 0 ? 20 : 0) +
    (profile.languages.length > 0 ? 10 : 0) +
    (profile.softSkills.length > 0 ? 15 : 0) +
    (profile.references.length > 0 ? 10 : 0)
  ) : 0;

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          {/* Header */}
          <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 safe-area-inset-top">
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Logo */}
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">ClearHire</h1>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {profile?.personalInfo.firstName} {profile?.personalInfo.lastName}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{profile?.personalInfo.email}</p>
                  </div>

                  {/* Notifications Icon */}
                  <button
                    onClick={handleNotificationClick}
                    className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 touch-target"
                    title="Notificaciones"
                  >
                    <Bell className="w-5 h-5" />
                    {/* Notification Badge */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Profile Avatar */}
                  <button
                    onClick={handleProfileClick}
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-lg cursor-pointer touch-target"
                    title="Ver mi perfil"
                  >
                    {profile?.personalInfo.firstName[0]}{profile?.personalInfo.lastName[0]}
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-4 py-8">
            {/* Stats Overview - Moved to top and made interactive */}
            <section className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Applications Card */}
                <button
                  onClick={() => handleStatusFilterClick('active')}
                  className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer text-left ${statusFilter === 'active'
                    ? 'border-primary-500 shadow-lg shadow-primary-200'
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Postulaciones Activas</p>
                      <p className="text-3xl font-bold text-primary-600">
                        {applications.filter(a => a.status === 'active').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Approved Applications Card */}
                <button
                  onClick={() => handleStatusFilterClick('approved')}
                  className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border-2 transition-all hover:scale-105 active:scale-95 cursor-pointer text-left ${statusFilter === 'approved'
                    ? 'border-success-500 shadow-lg shadow-success-200'
                    : 'border-slate-200 dark:border-slate-700 hover:border-success-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Postulaciones Aprobadas</p>
                      <p className="text-3xl font-bold text-success-600">
                        {applications.filter(a => a.status === 'approved').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-success-100 dark:bg-success-900/30 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Offers Card */}
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    navigate('/offers');
                  }}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border-2 border-slate-200 dark:border-slate-700 hover:border-green-300 transition-all hover:scale-105 active:scale-95 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Ofertas Recibidas</p>
                      <p className="text-3xl font-bold text-green-600">
                        5
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Profile Completion Card */}
                <button
                  onClick={handleProfileClick}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border-2 border-slate-200 dark:border-slate-700 hover:border-warning-300 transition-all hover:scale-105 active:scale-95 cursor-pointer text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Perfil Completado</p>
                      <p className="text-3xl font-bold text-warning-600">
                        {profileCompletion}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900/30 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </section>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Application Accordion (2/3 width on desktop) */}
              <div className="lg:col-span-2">
                <ApplicationAccordion
                  applications={filteredApplications}
                  selectedId={selectedApplicationId}
                  onSelect={handleApplicationSelect}
                  confirmedInterviewDates={confirmedInterviewDates}
                  onScheduleConfirm={(applicationId, slot) => {
                    setConfirmedInterviewDates(prev => ({
                      ...prev,
                      [applicationId]: slot.date
                    }));
                    handleScheduleConfirm(slot);
                  }}
                  whatsappEnabled={whatsappEnabled}
                  onWhatsAppToggle={setWhatsappEnabled}
                />
              </div>

              {/* Right Column - Gamification Panel (1/3 width on desktop) */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  {profile && (
                    <GamificationPanel
                      profile={profile}
                      badges={badges}
                      hasFastPass={false}
                      onSubscribe={() => alert('Redirigiendo a suscripción Fast Pass...')}
                    />
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-16 mb-20 md:mb-0 border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="text-center text-slate-600 dark:text-slate-400 text-sm">
                <p className="font-semibold">ClearHire © 2025 - Arquitectura GlassBox para LATAM</p>
                <p className="mt-2">Cumplimiento LGPD (Brasil) y LFPDPPP (México)</p>
                <p className="mt-1 text-xs">Transparencia Radical • Feedback Constructivo • Gamificación Ética</p>
              </div>
            </div>
          </footer>



          {/* Notification Center Modal */}
          <NotificationCenter
            isOpen={notificationCenterOpen}
            onClose={() => setNotificationCenterOpen(false)}
            candidateId={candidateId}
            notifications={notifications}
            analytics={analytics}
            onClearAll={clearAllNotifications}
          />

          {/* Debug Sidebar (solo desarrollo) */}
        </div>
      </PullToRefresh>
      <DebugSidebar
        onSimulateStatusChange={(status) => {
          const targetAppId = selectedApplicationId || applications[0]?.id;
          if (!targetAppId) {
            console.warn('No hay aplicaciones disponibles para simular');
            return;
          }

          const targetApp = applications.find(a => a.id === targetAppId);

          sendStatusChangeNotification(
            candidateId,
            targetAppId,
            'screening',
            status as any,
            {
              positionTitle: targetApp?.position || 'Desarrollador React',
              companyName: targetApp?.company || 'TechCorp',
              candidateName: profile?.personalInfo.firstName || 'Candidato',
              recruiterName: 'Recruiter Demo'
            }
          );
        }}
        onScheduleInterviewReminder={() => {
          const targetAppId = selectedApplicationId || applications[0]?.id;
          if (!targetAppId) return;

          const targetApp = applications.find(a => a.id === targetAppId);

          scheduleInterviewReminder(
            targetAppId,
            new Date(Date.now() + 86400000), // Mañana
            {
              candidateName: profile?.personalInfo.firstName || 'Candidato',
              positionTitle: targetApp?.position || 'Desarrollador React',
              companyName: targetApp?.company || 'TechCorp',
              recruiterName: 'Recruiter Demo',
              interviewMode: 'Virtual'
            }
          );
        }}
        onSendDeadlineAlert={() => {
          const targetAppId = selectedApplicationId || applications[0]?.id;
          if (!targetAppId) return;

          const targetApp = applications.find(a => a.id === targetAppId);

          sendDeadlineAlert(
            targetAppId,
            'document_upload',
            new Date(Date.now() + 172800000), // 2 días
            {
              positionTitle: targetApp?.position || 'Desarrollador React'
            }
          );
        }}
        onSendFeedbackNotification={() => {
          const targetAppId = selectedApplicationId || applications[0]?.id;
          if (!targetAppId) return;

          const targetApp = applications.find(a => a.id === targetAppId);

          sendFeedbackNotification(
            targetAppId,
            {
              candidateName: profile?.personalInfo.firstName || 'Candidato',
              positionTitle: targetApp?.position || 'Desarrollador React',
              companyName: targetApp?.company || 'TechCorp'
            }
          );
        }}
      />
    </>
  );
};

export default Dashboard;
