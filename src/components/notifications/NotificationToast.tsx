import React, { useEffect, useState } from 'react';
import { X, Bell, Check, Smartphone, Mail, Monitor } from 'lucide-react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import type { Notification, DeliveryChannel } from '../../types/notifications';

interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsVisible(true), 100);
    
    if (autoClose) {
      // Barra de progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          return newProgress <= 0 ? 0 : newProgress;
        });
      }, 100);

      // Auto cerrar
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(timer);
      };
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    triggerHaptic('light');
    setIsVisible(false);
    setTimeout(onClose, 300); // Esperar animación de salida
  };

  const getChannelIcon = (channel: DeliveryChannel) => {
    switch (channel) {
      case 'whatsapp':
        return <Smartphone className="w-4 h-4 text-green-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'push':
        return <Monitor className="w-4 h-4 text-purple-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-l-slate-500 bg-white dark:bg-slate-800';
    }
  };

  const getStatusIcon = () => {
    switch (notification.status) {
      case 'delivered':
      case 'read':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'sending':
        return <Bell className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className={`
      fixed top-20 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]
      transform transition-all duration-300 ease-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border-l-4 overflow-hidden
        ${getPriorityColor()}
      `}>
        {/* Progress Bar */}
        {autoClose && (
          <div className="h-1 bg-slate-200 dark:bg-slate-700">
            <div 
              className="h-full bg-primary-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {getStatusIcon()}
                  {getChannelIcon(notification.channels[0])}
                </div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {notification.title}
                </h4>
              </div>

              {/* Message Preview */}
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                {notification.message.length > 120 
                  ? `${notification.message.substring(0, 120)}...`
                  : notification.message
                }
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <span className="capitalize">{notification.status}</span>
                <span>•</span>
                <span>{notification.metadata.companyName}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;