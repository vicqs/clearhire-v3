import React, { useState } from 'react';
import { Share2, Copy, Check, Mail, Link as LinkIcon, QrCode } from 'lucide-react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import type { Profile } from '../../types/profile';

interface ShareProfileProps {
  profile: Profile;
}

export const ShareProfile: React.FC<ShareProfileProps> = ({ profile }) => {
  const { triggerHaptic } = useHapticFeedback();
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Generar URL única del perfil (en producción sería una URL real)
  const profileUrl = `https://clearhire.com/profile/${profile.personalInfo.firstName.toLowerCase()}-${profile.personalInfo.lastName.toLowerCase()}`;
  
  // Generar código de perfil único
  const profileCode = `CH-${profile.personalInfo.firstName.substring(0, 2).toUpperCase()}${profile.personalInfo.lastName.substring(0, 2).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      triggerHaptic('success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('No se pudo copiar el enlace');
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(profileCode);
      triggerHaptic('success');
      alert(`✅ Código copiado: ${profileCode}\n\nLas empresas pueden buscarte con este código en ClearHire.`);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Perfil de ${profile.personalInfo.firstName} ${profile.personalInfo.lastName} en ClearHire`);
    const body = encodeURIComponent(
      `Hola,\n\nTe comparto mi perfil profesional en ClearHire:\n\n` +
      `👤 ${profile.personalInfo.firstName} ${profile.personalInfo.lastName}\n` +
      `💼 ${profile.trade || 'Profesional'}\n` +
      `🔗 ${profileUrl}\n` +
      `🔑 Código de perfil: ${profileCode}\n\n` +
      `Puedes buscarme en ClearHire usando mi nombre o código.\n\n` +
      `Saludos,\n${profile.personalInfo.firstName}`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    triggerHaptic('light');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`,
          text: `Mira mi perfil profesional en ClearHire. Código: ${profileCode}`,
          url: profileUrl,
        });
        triggerHaptic('success');
      } catch (err) {
        console.error('Error al compartir:', err);
      }
    } else {
      setShowShareModal(true);
      triggerHaptic('light');
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Share2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Comparte tu Perfil
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Las empresas registradas en ClearHire pueden buscarte por tu nombre o código de perfil
            </p>
          </div>
        </div>

        {/* Código de Perfil */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Tu código de perfil
            </span>
            <button
              onClick={handleCopyCode}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Copiar
            </button>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono text-sm">
              {profileCode}
            </code>
            <QrCode className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            Las empresas pueden buscarte con este código en la plataforma
          </p>
        </div>

        {/* Botones de compartir */}
        <div className="space-y-2">
          {/* Copiar enlace */}
          <button
            onClick={handleCopyLink}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all active:scale-95 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600" />
              )}
              <div className="text-left">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {copied ? '¡Enlace copiado!' : 'Copiar enlace del perfil'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Comparte tu URL única
                </p>
              </div>
            </div>
            <LinkIcon className="w-4 h-4 text-slate-400" />
          </button>

          {/* Compartir por email */}
          <button
            onClick={handleShareEmail}
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all active:scale-95 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  Enviar por correo
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Comparte con reclutadores
                </p>
              </div>
            </div>
          </button>

          {/* Compartir nativo (móvil) */}
          <button
            onClick={handleNativeShare}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 font-medium shadow-lg"
          >
            <Share2 className="w-5 h-5" />
            Compartir perfil
          </button>
        </div>

        {/* Info adicional */}
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>💡 Tip:</strong> Las empresas verificadas en ClearHire pueden encontrarte buscando tu nombre completo o usando tu código de perfil. Tu información de contacto solo se comparte cuando aceptas una oferta.
          </p>
        </div>
      </div>

      {/* Modal de compartir (fallback para navegadores sin API nativa) */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
              Compartir Perfil
            </h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                  Enlace del perfil
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                  Código de perfil
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={profileCode}
                    readOnly
                    className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 font-mono"
                  />
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
