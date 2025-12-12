import React, { useState } from 'react';
import { Calendar, Clock, MapPin, MessageSquare } from 'lucide-react';
import type { TimeSlot } from '../../../types/profile';
import { mockTimeSlots } from '../../../services/mock/mockData';
import Card from '../../core/Card';
import Button from '../../core/Button';

export interface SchedulerInterfaceProps {
  applicationId: string;
  onConfirm: (slot: TimeSlot) => void;
  whatsappEnabled: boolean;
  onWhatsAppToggle: (enabled: boolean) => void;
  className?: string;
}

const SchedulerInterface: React.FC<SchedulerInterfaceProps> = ({
  onConfirm,
  whatsappEnabled,
  onWhatsAppToggle,
  className = '',
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    if (selectedSlot) {
      onConfirm(selectedSlot);
      setConfirmed(true);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <Card variant="glass" className={className}>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Agendar Entrevista</h2>
          <p className="text-slate-600">
            Selecciona una fecha y hora disponible para tu entrevista técnica.
          </p>
        </div>

        {confirmed ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">¡Entrevista Confirmada!</h3>
            <p className="text-slate-600 mb-4">
              Fecha confirmada: {selectedSlot && formatDate(selectedSlot.date)} a las {selectedSlot?.startTime}
            </p>
            <p className="text-sm text-slate-500">
              Recibirás una confirmación por correo electrónico
              {whatsappEnabled && ' y WhatsApp'}.
            </p>
          </div>
        ) : (
          <>
            {/* Available Slots */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">Fechas Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTimeSlots
                  .filter(slot => slot.available)
                  .map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`
                        p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${selectedSlot?.id === slot.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {formatDate(slot.date)}
                          </p>
                          <div className="flex items-center gap-2 text-slate-600 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                        </div>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-semibold
                          ${slot.type === 'virtual' 
                            ? 'bg-primary-100 text-primary-700' 
                            : 'bg-success-100 text-success-700'
                          }
                        `}>
                          {slot.type === 'virtual' ? 'Virtual' : 'Presencial'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Entrevistador: {slot.recruiterName}
                      </p>
                      {slot.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span>{slot.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* WhatsApp Toggle */}
            <div className="p-4 bg-success-50 border border-success-200 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappEnabled}
                  onChange={(e) => onWhatsAppToggle(e.target.checked)}
                  className="w-5 h-5 rounded border-success-300 text-success-600 focus:ring-success-500"
                />
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-success-600" />
                  <span className="font-semibold text-success-900">
                    Recibir actualizaciones de estado por WhatsApp
                  </span>
                </div>
              </label>
              <p className="text-sm text-success-700 mt-2 ml-8">
                Te enviaremos notificaciones importantes sobre tu proceso de selección.
              </p>
            </div>

            {/* Confirm Button */}
            {selectedSlot && (
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSlot(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1"
                >
                  Confirmar Fecha
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default SchedulerInterface;
