/**
 * Demo de Notificaciones para Debug
 */
import React, { useState } from 'react';
import { Bell, Send, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface DemoNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
}

interface NotificationDemoProps {
  onSimulateStatusChange?: (status: string) => void;
  onScheduleInterviewReminder?: () => void;
  onSendDeadlineAlert?: () => void;
  onSendFeedbackNotification?: () => void;
}

export const NotificationDemo: React.FC<NotificationDemoProps> = ({
  onSimulateStatusChange,
  onScheduleInterviewReminder,
  onSendDeadlineAlert,
  onSendFeedbackNotification
}) => {
  const [notifications, setNotifications] = useState<DemoNotification[]>([]);
  const [selectedType, setSelectedType] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  const notificationTypes = [
    { value: 'success', label: 'Éxito', icon: CheckCircle, color: 'text-green-600' },
    { value: 'error', label: 'Error', icon: AlertCircle, color: 'text-red-600' },
    { value: 'info', label: 'Info', icon: Info, color: 'text-blue-600' },
    { value: 'warning', label: 'Advertencia', icon: AlertCircle, color: 'text-yellow-600' }
  ] as const;

  const demoMessages = {
    success: [
      { title: 'Perfil guardado', message: 'Tu perfil se ha actualizado correctamente' },
      { title: 'Aplicación enviada', message: 'Tu aplicación ha sido enviada exitosamente' },
      { title: 'Entrevista confirmada', message: 'Has confirmado tu entrevista para mañana' }
    ],
    error: [
      { title: 'Error de conexión', message: 'No se pudo conectar con el servidor' },
      { title: 'Archivo muy grande', message: 'El CV debe ser menor a 5MB' },
      { title: 'Campos requeridos', message: 'Por favor completa todos los campos obligatorios' }
    ],
    info: [
      { title: 'Nueva funcionalidad', message: 'Ahora puedes exportar tu perfil en PDF' },
      { title: 'Recordatorio', message: 'Tienes una entrevista programada para mañana' },
      { title: 'Actualización', message: 'Se ha actualizado el sistema de notificaciones' }
    ],
    warning: [
      { title: 'Perfil incompleto', message: 'Completa tu perfil para mejorar tus oportunidades' },
      { title: 'Sesión expirando', message: 'Tu sesión expirará en 5 minutos' },
      { title: 'Verificación pendiente', message: 'Verifica tu email para activar todas las funciones' }
    ]
  };

  const sendTestNotification = () => {
    const messages = demoMessages[selectedType];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const newNotification: DemoNotification = {
      id: `demo-${Date.now()}`,
      type: selectedType,
      title: randomMessage.title,
      message: randomMessage.message,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Mantener solo 5 notificaciones

    // Simular notificación del navegador si está permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(randomMessage.title, {
        body: randomMessage.message,
        icon: '/favicon.ico'
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Permisos de notificación concedidos');
      }
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    if (!typeConfig) return Info;
    return typeConfig.icon;
  };

  const getNotificationColor = (type: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type);
    return typeConfig?.color || 'text-gray-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Simulador de Notificaciones</h3>
      </div>

      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded mb-4">
        <p>Utiliza estos controles para simular eventos del sistema y verificar la recepción de notificaciones en tiempo real.</p>
      </div>

      {/* Simuladores de Estado */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Cambios de Estado:</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSimulateStatusChange?.('screening')}
            className="px-2 py-2 text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors flex items-center justify-center gap-1"
          >
            <span>📄</span> Revisión CV
          </button>
          <button
            onClick={() => onSimulateStatusChange?.('technical_evaluation')}
            className="px-2 py-2 text-xs font-medium bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors flex items-center justify-center gap-1"
          >
            <span>💻</span> Eval. Técnica
          </button>
          <button
            onClick={() => onSimulateStatusChange?.('approved')}
            className="px-2 py-2 text-xs font-medium bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors flex items-center justify-center gap-1"
          >
            <span>🎉</span> Aprobado
          </button>
          <button
            onClick={() => onSimulateStatusChange?.('rejected')}
            className="px-2 py-2 text-xs font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors flex items-center justify-center gap-1"
          >
            <span>❌</span> Rechazado
          </button>
        </div>
      </div>

      {/* Otros Tipos de Notificaciones */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Eventos del Sistema:</h4>
        <div className="space-y-2">
          <button
            onClick={onScheduleInterviewReminder}
            className="w-full px-3 py-2 text-xs font-medium bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition-colors border border-yellow-200 text-left flex items-center gap-2"
          >
            <span>⏰</span> Recordatorio Entrevista
          </button>
          <button
            onClick={onSendDeadlineAlert}
            className="w-full px-3 py-2 text-xs font-medium bg-orange-100 hover:bg-orange-200 text-orange-800 rounded transition-colors border border-orange-200 text-left flex items-center gap-2"
          >
            <span>⚠️</span> Alerta Deadline
          </button>
          <button
            onClick={onSendFeedbackNotification}
            className="w-full px-3 py-2 text-xs font-medium bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded transition-colors border border-indigo-200 text-left flex items-center gap-2"
          >
            <span>📋</span> Feedback Disponible
          </button>
        </div>
      </div>
    </div>
  );
};