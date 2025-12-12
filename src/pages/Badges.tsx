import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Award, Lock, Zap, Check } from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { PullToRefresh } from '../components/core/PullToRefresh';
import type { Badge } from '../types/profile';
import { dataService } from '../services/dataService';
import { supabase } from '../lib/supabase';
import Modal from '../components/core/Modal';

const Badges: React.FC = () => {
  const navigate = useNavigate();
  const { triggerHaptic } = useHapticFeedback();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'info' | 'payment' | 'success'>('info');
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar badges
  const fetchBadges = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // En un sistema real, primero buscaríamos el perfil_id con el user_id
        // Para simplificar, asumiremos que dataService maneja esto o pasamos el user.id y el servicio resuelve
        // Pero dataService.getBadges espera profileId.
        // Vamos a hacer una pequeña trampa por ahora y pasar el user.id esperando que el servicio lo maneje
        // O mejor, obtengamos el perfil primero.
        try {
          const profile = await dataService.getProfile(user.id);
          if (profile && profile.id) {
            const userBadges = await dataService.getBadges(profile.id); // Asumiendo profile.id es available
            setBadges(userBadges);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        // Fallback a mock si no hay usuario (caso desarrollo offline)
        const { mockBadges } = await import('../services/mock/mockData');
        setBadges(mockBadges);
      }
    } catch (error) {
      console.error('Error cargando badges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleRefresh = async () => {
    triggerHaptic('medium');
    await fetchBadges();
    triggerHaptic('success');
  };

  const handleSubscribe = () => {
    triggerHaptic('light');
    setShowPaymentModal(true);
    setPaymentStep('info');
  };

  const handlePayment = () => {
    triggerHaptic('medium');
    setPaymentStep('payment');
  };

  const handlePaymentConfirm = async () => {
    triggerHaptic('medium');
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    setPaymentStep('success');
    triggerHaptic('success');
  };

  const lockedBadges = [
    { name: 'Perfil Completo', description: 'Completa el 100% de tu perfil', icon: '✨' },
    { name: 'Entrevistador Pro', description: 'Completa 5 entrevistas', icon: '🎯' },
    { name: 'Respuesta Rápida', description: 'Responde en menos de 24h', icon: '⚡' },
  ];

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 pb-24 md:pb-8">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 safe-area-inset-top">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/');
                }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 touch-target"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Insignias y Logros</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Desbloquea logros y mejora tu perfil</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 text-center">
              <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{badges.length}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Ganadas</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 text-center">
              <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{lockedBadges.length}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Bloqueadas</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 text-center">
              <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">7</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Racha días</p>
            </div>
          </div>

          {/* Fast Pass Premium Section */}
          <div className="bg-gradient-to-br from-gold-100 via-gold-50 to-yellow-50 dark:from-gold-900/30 dark:via-gold-800/20 dark:to-yellow-900/20 rounded-3xl p-6 border-2 border-gold-400 dark:border-gold-600 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Fast Pass Premium</h2>
                <p className="text-slate-700 dark:text-slate-300">Desbloquea ventajas exclusivas para destacar</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-300"><strong>Ranking en Tiempo Real:</strong> Ve tu posición exacta entre todos los candidatos</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-300"><strong>Comparación de Perfil:</strong> Compara tus habilidades con otros postulantes</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-300"><strong>Insights de IA:</strong> Recomendaciones personalizadas para mejorar</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-300"><strong>Acceso Prioritario:</strong> Nuevas funcionalidades antes que nadie</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl mb-4">
              <span className="text-slate-600 dark:text-slate-400">Precio mensual</span>
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">$5<span className="text-lg text-slate-600 dark:text-slate-400">/mes</span></span>
            </div>

            <button
              onClick={() => {
                triggerHaptic('medium');
                // Scroll suave hacia la sección de pago (que ya está en esta página)
                const paymentSection = document.getElementById('payment-section');
                if (paymentSection) {
                  paymentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  // Si no existe la sección, mostrar el modal
                  handleSubscribe();
                }
              }}
              className="w-full px-6 py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg hover:shadow-xl touch-target"
            >
              Suscribirme Premium
            </button>
            <p className="text-center text-xs text-slate-600 dark:text-slate-400 mt-3">Cancela en cualquier momento • Sin compromisos</p>
          </div>

          {/* Sección de pago integrada */}
          <div id="payment-section" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Método de Pago</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Completa tu suscripción a Fast Pass Premium por solo $5/mes
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Fecha de expiración
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre en la tarjeta
                </label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handlePaymentConfirm}
                className="w-full px-6 py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg hover:shadow-xl touch-target flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Pagar $5/mes de forma segura
              </button>

              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Pago seguro
                </span>
                <span>•</span>
                <span>Encriptación SSL</span>
                <span>•</span>
                <span>Cancela cuando quieras</span>
              </div>
            </div>
          </div>

          {/* Earned Badges */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Insignias Ganadas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map(badge => (
                <div
                  key={badge.id}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform aspect-square flex flex-col items-center justify-center"
                >
                  <div className="text-5xl mb-3">{badge.icon === 'sunrise' ? '🌅' : badge.icon === 'star' ? '⭐' : '🏆'}</div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-center mb-2 text-sm">{badge.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 text-center mb-2 line-clamp-2">{badge.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 text-center">
                    {new Date(badge.earnedAt).toLocaleDateString('es-ES')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Locked Badges */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Insignias Bloqueadas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {lockedBadges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 opacity-60 aspect-square flex flex-col items-center justify-center"
                >
                  <div className="text-5xl mb-3 grayscale">{badge.icon}</div>
                  <h3 className="font-bold text-slate-700 dark:text-slate-300 text-center mb-2 text-sm">{badge.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 text-center line-clamp-2">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title={paymentStep === 'success' ? '¡Suscripción Exitosa!' : 'Fast Pass Premium'}
        >
          {paymentStep === 'info' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Estás a punto de suscribirte a Fast Pass Premium por $5/mes
                </p>
              </div>
              <button
                onClick={handlePayment}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all active:scale-95 touch-target"
              >
                Continuar al Pago
              </button>
            </div>
          )}

          {paymentStep === 'payment' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Número de tarjeta"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className="px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nombre en la tarjeta"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentStep('info')}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
                >
                  Atrás
                </button>
                <button
                  onClick={handlePaymentConfirm}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold rounded-lg transition-all active:scale-95"
                >
                  Pagar $5
                </button>
              </div>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">¡Bienvenido a Fast Pass!</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Ya puedes ver tu ranking y acceder a todas las funciones premium
              </p>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  navigate('/');
                }}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all active:scale-95"
              >
                Ir al Dashboard
              </button>
            </div>
          )}
        </Modal>
      </div>
    </PullToRefresh>
  );
};

export default Badges;
