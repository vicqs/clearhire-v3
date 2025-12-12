import React, { useState } from 'react';
import { Crown, TrendingUp, Lock } from 'lucide-react';
import Card from '../../core/Card';
import Modal from '../../core/Modal';
import Button from '../../core/Button';

export interface FastPassWidgetProps {
  hasFastPass: boolean;
  ranking?: number;
  onSubscribe?: () => void;
  className?: string;
}

const FastPassWidget: React.FC<FastPassWidgetProps> = ({
  hasFastPass,
  ranking,
  onSubscribe,
  className = '',
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (!hasFastPass) {
      setShowModal(true);
    }
  };

  return (
    <>
      <Card
        variant="glass"
        className={`bg-gradient-to-br from-gold-50 to-gold-100 dark:from-gold-900/20 dark:to-gold-800/20 border-2 border-gold-400 dark:border-gold-600 cursor-pointer hover:shadow-xl transition-all duration-300 ${className}`}
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex-shrink-0">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Fast Pass</h3>
            {hasFastPass && ranking !== undefined ? (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-success-600" />
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">#{ranking}</span>
              </div>
            ) : (
              <p className="text-xs text-gold-700 dark:text-gold-400 font-semibold">$5/mes</p>
            )}
          </div>
          {!hasFastPass && <Lock className="w-4 h-4 text-gold-600 dark:text-gold-400 flex-shrink-0" />}
        </div>
      </Card>

      {/* Subscription Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Fast Pass Premium">
        <div className="space-y-4">
          <div className="flex items-center justify-center p-6 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl">
            <Crown className="w-16 h-16 text-gold-600" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Beneficios Premium</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-success-600 font-bold">✓</span>
                <span className="text-slate-700">Ve tu posición exacta en el ranking de candidatos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-600 font-bold">✓</span>
                <span className="text-slate-700">Compara tu perfil con otros postulantes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-600 font-bold">✓</span>
                <span className="text-slate-700">Recibe insights sobre cómo mejorar tu posición</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success-600 font-bold">✓</span>
                <span className="text-slate-700">Acceso prioritario a nuevas funcionalidades</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600">Precio</span>
              <span className="text-2xl font-bold text-slate-900">$5/mes</span>
            </div>
            <p className="text-xs text-slate-600">Cancela en cualquier momento</p>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="premium"
              onClick={() => {
                onSubscribe?.();
                setShowModal(false);
              }}
              className="flex-1"
            >
              Suscribirme
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FastPassWidget;
