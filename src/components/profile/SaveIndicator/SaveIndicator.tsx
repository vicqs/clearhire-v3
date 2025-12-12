import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SaveStatus } from '../../../hooks/useAutoSave';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
  error: Error | null;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({
  status,
  lastSaved,
  error,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status === 'saving' || status === 'error') {
      setIsVisible(true);
    } else if (status === 'saved') {
      setIsVisible(true);
      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [status]);

  if (!isVisible) {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          text: 'Guardando...',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
        };
      case 'saved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          text: lastSaved
            ? `Guardado a las ${lastSaved.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}`
            : 'Guardado',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: error?.message || 'Error al guardar',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();

  if (!config) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border ${config.bgColor} ${config.textColor} ${config.borderColor} shadow-lg transition-all duration-300 animate-in slide-in-from-top-2`}
    >
      {config.icon}
      <span className="text-sm font-medium">{config.text}</span>
    </div>
  );
};
