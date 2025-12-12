import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationToast from './NotificationToast';
import type { Notification } from '../../types/notifications';

interface NotificationContextType {
  showToast: (notification: Notification) => void;
  hideToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationToasts = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationToasts must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Notification[]>([]);

  const showToast = useCallback((notification: Notification) => {
    setToasts(prev => {
      // Evitar duplicados
      if (prev.some(toast => toast.id === notification.id)) {
        return prev;
      }
      // Mantener máximo 3 toasts
      const newToasts = [notification, ...prev].slice(0, 3);
      return newToasts;
    });
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast, hideToast }}>
      {children}
      
      {/* Render Toasts */}
      <div className="fixed top-20 right-4 z-50 space-y-3 pointer-events-none">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id}
            className="pointer-events-auto"
            style={{ 
              transform: `translateY(${index * 10}px)`,
              zIndex: 50 - index 
            }}
          >
            <NotificationToast
              notification={toast}
              onClose={() => hideToast(toast.id)}
              autoClose={true}
              duration={6000}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};