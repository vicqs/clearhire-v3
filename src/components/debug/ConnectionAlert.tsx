/**
 * Alerta de Estado de Conexión
 * Muestra notificaciones sobre el estado de Supabase
 */
import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Wifi, WifiOff } from 'lucide-react';
import { authService } from '../../services/authService';

export const ConnectionAlert: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'mock' | 'offline' | 'error'>('mock');
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    // Escuchar cambios de autenticación
    const unsubscribe = authService.onAuthStateChange((newUser) => {
      setUser(newUser);
      
      // Mostrar alerta si el usuario está en modo mock
      if (newUser?.isMock && import.meta.env.VITE_USE_SUPABASE === 'true') {
        setAlertType('offline');
        setShowAlert(true);
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => setShowAlert(false), 10000);
      }
    });

    return unsubscribe;
  }, []);

  if (!showAlert || !user?.isMock) {
    return null;
  }

  const getAlertConfig = () => {
    switch (alertType) {
      case 'offline':
        return {
          icon: WifiOff,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          title: 'Modo Offline Activado',
          message: 'No se pudo conectar a Supabase. Usando datos locales.',
          action: 'La aplicación funciona normalmente en modo offline.'
        };
      case 'error':
        return {
          icon: AlertCircle,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          title: 'Error de Conexión',
          message: 'Problema conectando con la base de datos.',
          action: 'Revisa tu conexión a internet o contacta soporte.'
        };
      default:
        return {
          icon: Wifi,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          title: 'Modo Mock',
          message: 'Usando datos de prueba para desarrollo.',
          action: 'Perfecto para desarrollo y testing.'
        };
    }
  };

  const config = getAlertConfig();
  const Icon = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 shadow-lg`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
          
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold ${config.textColor} text-sm`}>
              {config.title}
            </h4>
            <p className={`${config.textColor} text-sm mt-1`}>
              {config.message}
            </p>
            <p className={`${config.textColor} text-xs mt-2 opacity-75`}>
              {config.action}
            </p>
          </div>
          
          <button
            onClick={() => setShowAlert(false)}
            className={`${config.textColor} hover:opacity-75 flex-shrink-0`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};