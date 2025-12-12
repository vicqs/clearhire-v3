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
        <h3 className="font-semibold text-gray-800">Demo Notificaciones</h3>
      </div>

      {/* Controles */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de notificación:
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {notificationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={sendTestNotification}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Enviar Test
          </button>
          
          <button
            onClick={requestNotificationPermission}
            className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            title="Solicitar permisos de notificación del navegador"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="w-full px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
          >
            Limpiar Todo
          </button>
        )}
      </div>

      {/* Lista de notificaciones */}
      {notifications.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Notificaciones Recientes:</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={`p-3 border rounded-lg bg-white shadow-sm ${
                    notification.type === 'success' ? 'border-green-200' :
                    notification.type === 'error' ? 'border-red-200' :
                    notification.type === 'warning' ? 'border-yellow-200' :
                    'border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1">
                      <Icon className={`w-4 h-4 mt-0.5 ${colorClass}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-gray-600 text-xs mt-1">
                          {notification.message}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Simuladores de Estado */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Simular Cambios de Estado:</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSimulateStatusChange?.('screening')}
            className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
          >
            📄 Revisión CV
          </button>
          <button
            onClick={() => onSimulateStatusChange?.('technical_evaluation')}
            className="px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
          >
            💻 Eval. Técnica
          </button>
          <button
            onClick={() => onSimulateStatusChange?.('approved')}
            className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
          >
            🎉 Aprobado
          </button>
          <button
            onClick={() => onSimulateStatusChange?.('rejected')}
            className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
          >
            ❌ Rechazado
          </button>
        </div>
      </div>

      {/* Otros Tipos de Notificaciones */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Otros Tipos:</h4>
        <div className="space-y-2">
          <button
            onClick={onScheduleInterviewReminder}
            className="w-full px-3 py-2 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded transition-colors text-left"
          >
            ⏰ Recordatorio Entrevista
          </button>
          <button
            onClick={onSendDeadlineAlert}
            className="w-full px-3 py-2 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors text-left"
          >
            ⚠️ Alerta Deadline
          </button>
          <button
            onClick={onSendFeedbackNotification}
            className="w-full px-3 py-2 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded transition-colors text-left"
          >
            📋 Feedback Disponible
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <p>💡 Este panel simula el sistema de notificaciones.</p>
        <p>Las notificaciones reales se integrarán con el backend.</p>
      </div>
    </div>
  );
};