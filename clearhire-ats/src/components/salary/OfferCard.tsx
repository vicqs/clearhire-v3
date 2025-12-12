import React, { useState } from 'react';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  DollarSign, 
  Gift, 
  ChevronDown, 
  ChevronUp,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calculator
} from 'lucide-react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import SalaryCalculator from './SalaryCalculator';
import type { JobOffer } from '../../types/salary';

interface OfferCardProps {
  offer: JobOffer;
  onAccept?: (offerId: string) => void;
  onDecline?: (offerId: string) => void;
  onNegotiate?: (offerId: string) => void;
  className?: string;
}

const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  onAccept,
  onDecline,
  onNegotiate,
  className = ''
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const [showCalculator, setShowCalculator] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const toggleCalculator = () => {
    triggerHaptic('light');
    setShowCalculator(!showCalculator);
  };

  const toggleDetails = () => {
    triggerHaptic('light');
    setShowDetails(!showDetails);
  };

  const handleAccept = () => {
    triggerHaptic('success');
    onAccept?.(offer.id);
  };

  const handleDecline = () => {
    triggerHaptic('warning');
    onDecline?.(offer.id);
  };

  const handleNegotiate = () => {
    triggerHaptic('light');
    onNegotiate?.(offer.id);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysUntilExpiration = () => {
    const now = new Date();
    const expiration = new Date(offer.expirationDate);
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = () => {
    switch (offer.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'negotiating':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  const getStatusLabel = () => {
    switch (offer.status) {
      case 'pending':
        return 'Pendiente';
      case 'accepted':
        return 'Aceptada';
      case 'declined':
        return 'Rechazada';
      case 'negotiating':
        return 'En Negociación';
      case 'expired':
        return 'Expirada';
      default:
        return offer.status;
    }
  };

  const daysLeft = getDaysUntilExpiration();
  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft <= 3 && daysLeft > 0;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/30 dark:to-emerald-800/30 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {offer.positionTitle}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {offer.companyName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
              {getStatusLabel()}
            </span>
          </div>
        </div>

        {/* Salary Info */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800 dark:text-green-200">
              Oferta Salarial
            </span>
          </div>
          
          {offer.fixedSalary ? (
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
              {new Intl.NumberFormat('es-ES', { 
                style: 'currency', 
                currency: offer.currency,
                minimumFractionDigits: 0 
              }).format(offer.fixedSalary)}
            </p>
          ) : offer.salaryRange ? (
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">
              {new Intl.NumberFormat('es-ES', { 
                style: 'currency', 
                currency: offer.currency,
                minimumFractionDigits: 0 
              }).format(offer.salaryRange.min)} - {new Intl.NumberFormat('es-ES', { 
                style: 'currency', 
                currency: offer.currency,
                minimumFractionDigits: 0 
              }).format(offer.salaryRange.max)}
            </p>
          ) : (
            <p className="text-lg text-green-700 dark:text-green-300">
              Salario a negociar
            </p>
          )}
          
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Salario bruto mensual
          </p>
        </div>

        {/* Benefits Summary */}
        {offer.benefits.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {offer.benefits.length} beneficio{offer.benefits.length !== 1 ? 's' : ''} incluido{offer.benefits.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Oferta: {formatDate(offer.offerDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span className={isExpired ? 'text-red-600' : isUrgent ? 'text-yellow-600' : ''}>
              {isExpired ? 'Expirada' : `Expira en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`}
            </span>
          </div>
        </div>
      </div>

      {/* Salary Calculator Toggle */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={toggleCalculator}
          className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900/30 dark:hover:to-blue-900/30 transition-colors border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-green-800 dark:text-green-200">
                💰 Calcular mi salario neto
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Ve cuánto recibirías en tu cuenta + valor de beneficios
              </p>
            </div>
          </div>
          {showCalculator ? (
            <ChevronUp className="w-5 h-5 text-green-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-green-600" />
          )}
        </button>
      </div>

      {/* Salary Calculator */}
      {showCalculator && (
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50">
          <SalaryCalculator offer={offer} />
        </div>
      )}

      {/* Benefits Detail */}
      {offer.benefits.length > 0 && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={toggleDetails}
            className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Beneficios Incluidos
              </span>
            </div>
            {showDetails ? (
              <ChevronUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            )}
          </button>

          {showDetails && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {offer.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-sm">
                    {benefit.category === 'health' && '🏥'}
                    {benefit.category === 'wellness' && '💪'}
                    {benefit.category === 'transport' && '🚗'}
                    {benefit.category === 'food' && '🍽️'}
                    {benefit.category === 'education' && '📚'}
                    {benefit.category === 'time_off' && '🏖️'}
                    {benefit.category === 'financial' && '💰'}
                    {benefit.category === 'other' && '🎁'}
                  </span>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {benefit.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {offer.status === 'pending' && !isExpired && (
        <div className="p-6">
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Aceptar Proceso
            </button>
            
            <button
              onClick={handleNegotiate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Negociar
            </button>
            
            <button
              onClick={handleDecline}
              className="px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          
          {isUrgent && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                ⚠️ Esta oferta expira pronto. Te recomendamos tomar una decisión antes de {formatDate(offer.expirationDate)}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Negotiating Status - Awaiting Company Response */}
      {offer.status === 'negotiating' && !offer.awaitingCandidateResponse && !isExpired && (
        <div className="p-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Negociación en Proceso
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Esperando respuesta de la empresa
                </p>
              </div>
            </div>
            
            {offer.negotiationMessages && offer.negotiationMessages.length > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Último mensaje enviado:
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 italic">
                  "{offer.negotiationMessages[offer.negotiationMessages.length - 1].message.substring(0, 100)}
                  {offer.negotiationMessages[offer.negotiationMessages.length - 1].message.length > 100 ? '...' : ''}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Negotiating Status - Awaiting Candidate Response */}
      {offer.status === 'negotiating' && offer.awaitingCandidateResponse && !isExpired && (
        <div className="p-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-pulse">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  ¡La empresa ha respondido!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Revisa su mensaje y decide cómo continuar
                </p>
              </div>
            </div>
            
            {offer.negotiationMessages && offer.negotiationMessages.length > 0 && (
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                <p className="text-xs font-medium text-green-800 dark:text-green-200 mb-2">
                  Último mensaje de la empresa:
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  "{offer.negotiationMessages[offer.negotiationMessages.length - 1].message.substring(0, 150)}
                  {offer.negotiationMessages[offer.negotiationMessages.length - 1].message.length > 150 ? '...' : ''}"
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Aceptar Proceso
            </button>
            
            <button
              onClick={handleNegotiate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Seguir Negociando
            </button>
            
            <button
              onClick={handleDecline}
              className="px-4 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Expired Notice */}
      {isExpired && (
        <div className="p-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200 font-medium text-center">
              ❌ Esta oferta expiró el {formatDate(offer.expirationDate)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferCard;