import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import Card from '../../core/Card';

export interface ExclusivityWarningProps {
  type: 'offer_pending' | 'offer_accepted' | 'multiple_offers';
  companyName?: string;
  otherApplicationsCount?: number;
  className?: string;
}

const ExclusivityWarning: React.FC<ExclusivityWarningProps> = ({
  type,
  companyName,
  otherApplicationsCount = 0,
  className = '',
}) => {
  const getWarningContent = () => {
    switch (type) {
      case 'offer_pending':
        return {
          icon: <Info className="w-6 h-6" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-900 dark:text-blue-100',
          iconColor: 'text-blue-600 dark:text-blue-400',
          title: '📋 Oferta Formal Recibida',
          message: `Has recibido una oferta formal de ${companyName}. Si aceptas esta oferta, deberás retirar tus otras ${otherApplicationsCount} postulaciones activas.`,
          note: 'Tómate el tiempo necesario para revisar los términos antes de decidir.',
        };

      case 'offer_accepted':
        return {
          icon: <AlertTriangle className="w-6 h-6" />,
          bgColor: 'bg-warning-50 dark:bg-warning-900/20',
          borderColor: 'border-warning-200 dark:border-warning-800',
          textColor: 'text-warning-900 dark:text-warning-100',
          iconColor: 'text-warning-600 dark:text-warning-400',
          title: '⚠️ Oferta Aceptada - Exclusividad Requerida',
          message: `Has aceptado la oferta de ${companyName}. Debes retirar tus otras postulaciones activas para continuar con este proceso.`,
          note: 'Esta es una práctica estándar en procesos de contratación profesional.',
        };

      case 'multiple_offers':
        return {
          icon: <AlertTriangle className="w-6 h-6" />,
          bgColor: 'bg-amber-50 dark:bg-amber-900/20',
          borderColor: 'border-amber-200 dark:border-amber-800',
          textColor: 'text-amber-900 dark:text-amber-100',
          iconColor: 'text-amber-600 dark:text-amber-400',
          title: '🎯 Múltiples Ofertas Pendientes',
          message: `Tienes ${otherApplicationsCount} ofertas pendientes de respuesta. Solo puedes aceptar una oferta a la vez.`,
          note: 'Revisa cuidadosamente cada oferta antes de tomar tu decisión.',
        };

      default:
        return null;
    }
  };

  const content = getWarningContent();
  if (!content) return null;

  return (
    <Card
      variant="solid"
      className={`${content.bgColor} border-2 ${content.borderColor} ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className={`${content.iconColor} flex-shrink-0 mt-1`}>
          {content.icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${content.textColor} mb-2`}>
            {content.title}
          </h3>
          <p className={`${content.textColor} mb-3`}>
            {content.message}
          </p>
          <p className={`text-sm ${content.textColor} opacity-80 italic`}>
            💡 {content.note}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ExclusivityWarning;
