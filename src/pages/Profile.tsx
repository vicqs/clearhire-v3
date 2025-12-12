import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ProfileForm } from '../components/profile';
import { ShareProfile } from '../components/profile/ShareProfile';
import { PullToRefresh } from '../components/core/PullToRefresh';
import { Toast } from '../components/core/Toast';
import { DebugSidebar } from '../components/debug/DebugSidebar';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useProfile } from '../hooks/useProfile';
import { useToast } from '../hooks/useToast';
import { Profile as ProfileType } from '../types/profile';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { triggerHaptic } = useHapticFeedback();
  const { toasts, hideToast, success, error: showError } = useToast();

  // 🔥 Usar hook de Supabase
  const { profile: supabaseProfile, loading, saveProfile, reload } = useProfile();

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [profileCompletion, setProfileCompletion] = useState(75);

  // Sincronizar con Supabase
  useEffect(() => {
    if (supabaseProfile) {
      setProfile(supabaseProfile);
    }
  }, [supabaseProfile]);

  const handleProfileUpdate = async (updatedProfile: ProfileType) => {
    setProfile(updatedProfile);

    // 🔥 Guardar en Supabase
    try {
      await saveProfile(updatedProfile);
      triggerHaptic('success');
      success('Perfil guardado exitosamente');
    } catch (err) {
      triggerHaptic('error');
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar el perfil';
      showError(errorMessage);
      console.error('Error guardando perfil:', err);
    }
  };

  const handleRefresh = async () => {
    triggerHaptic('medium');
    await reload();
    triggerHaptic('success');
  };

  // Mostrar loading
  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  const handleExportData = () => {
    // Generate PDF with profile data
    console.log('Exporting profile data...');

    // Create a simple text representation for now
    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `ClearHire_Perfil_${profile.personalInfo.firstName}_${profile.personalInfo.lastName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProfileCompletionChange = (completion: number) => {
    setProfileCompletion(completion);
    console.log('Profile completion:', completion + '%');
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 md:pb-8">
        {/* Toast Notifications */}
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))}
        {/* Header with Back Button */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 safe-area-inset-top">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/');
                }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 active:scale-95 touch-target"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden md:inline">Volver al Dashboard</span>
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Mi Perfil</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Profile Completion Badge */}
          <div className="mb-6 flex justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-full px-6 py-3 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - profileCompletion / 100)}`}
                    className="text-blue-600 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {profileCompletion}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Completitud del Perfil
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {profileCompletion === 100
                    ? '¡Perfil completo!'
                    : 'Completa tu perfil para mejorar tus oportunidades'}
                </p>
              </div>
            </div>
          </div>

          {/* Share Profile Section */}
          <div className="mb-8 max-w-5xl mx-auto">
            <ShareProfile profile={profile} />
          </div>

          {/* Profile Form */}
          <ProfileForm
            profile={profile}
            onUpdate={handleProfileUpdate}
            onExport={handleExportData}
            onProfileCompletionChange={handleProfileCompletionChange}
          />
        </div>

        {/* Debug Sidebar (solo desarrollo) */}
        {import.meta.env.DEV && <DebugSidebar />}
      </div>
    </PullToRefresh>
  );
};

export default Profile;
