import React from 'react';
import { Smartphone, Mail, Monitor, Clock, Globe, Volume2 } from 'lucide-react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import type { NotificationPreferences as NotificationPrefsType } from '../../types/notifications';

interface NotificationPreferencesProps {
  preferences: NotificationPrefsType;
  onUpdate: (updates: Partial<NotificationPrefsType>) => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  preferences,
  onUpdate
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handleChannelToggle = (channel: 'whatsapp' | 'email' | 'push', enabled: boolean) => {
    triggerHaptic('light');
    onUpdate({
      channels: {
        ...preferences.channels,
        [channel]: {
          ...preferences.channels[channel],
          enabled
        }
      }
    });
  };

  const handleTypeToggle = (type: keyof NotificationPrefsType['types'], enabled: boolean) => {
    triggerHaptic('light');
    onUpdate({
      types: {
        ...preferences.types,
        [type]: enabled
      }
    });
  };

  const handleFrequencyChange = (frequency: NotificationPrefsType['frequency']) => {
    triggerHaptic('light');
    onUpdate({ frequency });
  };

  const handleLanguageChange = (language: NotificationPrefsType['language']) => {
    triggerHaptic('light');
    onUpdate({ language });
  };

  const handleQuietHoursToggle = (enabled: boolean) => {
    triggerHaptic('light');
    onUpdate({
      quietHours: {
        ...preferences.quietHours,
        enabled
      }
    });
  };

  const ToggleSwitch: React.FC<{ 
    checked: boolean; 
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }> = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-12 h-6 rounded-full transition-colors ${
        checked 
          ? 'bg-primary-600' 
          : 'bg-slate-300 dark:bg-slate-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
        checked ? 'ml-6' : 'ml-0.5'
      }`} />
    </button>
  );

  const PreferenceItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
  }> = ({ icon, title, description, children }) => (
    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
      <div className="flex items-center gap-3 flex-1">
        <div className="text-slate-600 dark:text-slate-400">{icon}</div>
        <div className="flex-1">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">{title}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <div className="ml-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Canales de Entrega */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Canales de Notificación
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Elige cómo quieres recibir las notificaciones
          </p>
        </div>

        <PreferenceItem
          icon={<Smartphone className="w-5 h-5" />}
          title="WhatsApp"
          description={`Mensajes a ${preferences.channels.whatsapp.address}`}
        >
          <ToggleSwitch
            checked={preferences.channels.whatsapp.enabled}
            onChange={(enabled) => handleChannelToggle('whatsapp', enabled)}
          />
        </PreferenceItem>

        <PreferenceItem
          icon={<Mail className="w-5 h-5" />}
          title="Correo Electrónico"
          description={`Emails a ${preferences.channels.email.address}`}
        >
          <ToggleSwitch
            checked={preferences.channels.email.enabled}
            onChange={(enabled) => handleChannelToggle('email', enabled)}
          />
        </PreferenceItem>

        <PreferenceItem
          icon={<Monitor className="w-5 h-5" />}
          title="Notificaciones Push"
          description="Notificaciones del navegador"
        >
          <ToggleSwitch
            checked={preferences.channels.push.enabled}
            onChange={(enabled) => handleChannelToggle('push', enabled)}
          />
        </PreferenceItem>
      </div>

      {/* Tipos de Notificación */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Tipos de Notificación
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Controla qué notificaciones quieres recibir
          </p>
        </div>

        <PreferenceItem
          icon={<Volume2 className="w-5 h-5" />}
          title="Cambios de Estado"
          description="Cuando tu postulación avanza o es rechazada"
        >
          <ToggleSwitch
            checked={preferences.types.statusChanges}
            onChange={(enabled) => handleTypeToggle('statusChanges', enabled)}
          />
        </PreferenceItem>

        <PreferenceItem
          icon={<Clock className="w-5 h-5" />}
          title="Recordatorios de Entrevista"
          description="Recordatorios antes de tus entrevistas"
        >
          <ToggleSwitch
            checked={preferences.types.interviewReminders}
            onChange={(enabled) => handleTypeToggle('interviewReminders', enabled)}
          />
        </PreferenceItem>

        <PreferenceItem
          icon={<Clock className="w-5 h-5" />}
          title="Alertas de Plazo"
          description="Cuando tienes acciones pendientes"
        >
          <ToggleSwitch
            checked={preferences.types.deadlineAlerts}
            onChange={(enabled) => handleTypeToggle('deadlineAlerts', enabled)}
          />
        </PreferenceItem>

        <PreferenceItem
          icon={<Volume2 className="w-5 h-5" />}
          title="Feedback Disponible"
          description="Cuando hay nuevo feedback sobre tu postulación"
        >
          <ToggleSwitch
            checked={preferences.types.feedbackAvailable}
            onChange={(enabled) => handleTypeToggle('feedbackAvailable', enabled)}
          />
        </PreferenceItem>
      </div>

      {/* Configuración Avanzada */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Configuración Avanzada
          </h3>
        </div>

        <PreferenceItem
          icon={<Clock className="w-5 h-5" />}
          title="Horario Silencioso"
          description={`${preferences.quietHours.start} - ${preferences.quietHours.end}`}
        >
          <ToggleSwitch
            checked={preferences.quietHours.enabled}
            onChange={handleQuietHoursToggle}
          />
        </PreferenceItem>

        <div className="p-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  Frecuencia de Notificaciones
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Con qué frecuencia recibir notificaciones
                </p>
              </div>
            </div>
            <select
              value={preferences.frequency}
              onChange={(e) => handleFrequencyChange(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm"
            >
              <option value="immediate">Inmediato</option>
              <option value="daily_digest">Resumen Diario</option>
              <option value="weekly_summary">Resumen Semanal</option>
            </select>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  Idioma de Notificaciones
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Idioma para el contenido de las notificaciones
                </p>
              </div>
            </div>
            <select
              value={preferences.language}
              onChange={(e) => handleLanguageChange(e.target.value as any)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm"
            >
              <option value="es">Español</option>
              <option value="pt">Português</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Volume2 className="w-3 h-3 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Sobre las Notificaciones
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
              Las notificaciones te mantienen informado sobre el progreso de tus postulaciones. 
              Puedes personalizar completamente qué recibes y cómo. Los cambios se guardan automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;