import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bell, Lock, Globe, Moon, Sun, Monitor, 
  Smartphone, Mail, Shield, Download, Trash2, LogOut,
  ChevronRight, Eye, EyeOff, X, Check, AlertTriangle, Key
} from 'lucide-react';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../contexts/ThemeContext';
import { PullToRefresh } from '../components/core/PullToRefresh';
import NotificationPreferences from '../components/notifications/NotificationPreferences';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { triggerHaptic } = useHapticFeedback();
  const { theme, setTheme } = useTheme();
  
  const [language, setLanguage] = useState('es');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false);
  
  // Modales de seguridad
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  
  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados para 2FA
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  // Hook de notificaciones
  const candidateId = 'candidate_1'; // En una app real, esto vendría del contexto de autenticación
  const { preferences, updatePreferences } = useNotifications(candidateId);

  const handleRefresh = async () => {
    triggerHaptic('medium');
    await new Promise(resolve => setTimeout(resolve, 1000));
    triggerHaptic('success');
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Por favor completa todos los campos');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    triggerHaptic('success');
    alert('✅ Contraseña cambiada exitosamente');
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleToggle2FA = () => {
    if (!is2FAEnabled) {
      // Activar 2FA
      if (verificationCode === '123456') {
        setIs2FAEnabled(true);
        triggerHaptic('success');
        alert('✅ Autenticación de dos factores activada');
        setShow2FA(false);
        setVerificationCode('');
      } else {
        alert('❌ Código incorrecto. Intenta con: 123456');
      }
    } else {
      // Desactivar 2FA
      setIs2FAEnabled(false);
      triggerHaptic('success');
      alert('✅ Autenticación de dos factores desactivada');
      setShow2FA(false);
    }
  };

  const handleLogout = () => {
    triggerHaptic('medium');
    alert('👋 Sesión cerrada exitosamente');
    setShowLogout(false);
    // Aquí iría la lógica real de logout
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    triggerHaptic('warning');
    alert('❌ Cuenta eliminada permanentemente');
    setShowDeleteAccount(false);
    // Aquí iría la lógica real de eliminación
    navigate('/');
  };

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 px-4">{title}</h2>
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );

  const SettingItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    value?: string;
    onClick?: () => void;
    toggle?: boolean;
    checked?: boolean;
    onToggle?: (checked: boolean) => void;
  }> = ({ icon, label, value, onClick, toggle, checked, onToggle }) => (
    <button
      onClick={() => {
        triggerHaptic('light');
        if (toggle && onToggle) {
          onToggle(!checked);
        } else if (onClick) {
          onClick();
        }
      }}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors active:scale-[0.99] border-b border-slate-100 dark:border-slate-700 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        <div className="text-slate-600 dark:text-slate-400">{icon}</div>
        <span className="text-slate-900 dark:text-slate-100 font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-slate-500 dark:text-slate-400 text-sm">{value}</span>}
        {toggle ? (
          <div className={`w-12 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${checked ? 'ml-6' : 'ml-0.5'}`} />
          </div>
        ) : (
          <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
      </div>
    </button>
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 md:pb-8">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 safe-area-inset-top">
          <div className="max-w-3xl mx-auto px-4 py-4">
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
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Ajustes</h1>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Notificaciones */}
          <SettingSection title="Notificaciones">
            <SettingItem
              icon={<Bell className="w-5 h-5" />}
              label="Configurar Notificaciones"
              value="Personalizar canales y tipos"
              onClick={() => setShowNotificationPrefs(true)}
            />
            <SettingItem
              icon={<Smartphone className="w-5 h-5" />}
              label="WhatsApp"
              toggle
              checked={preferences.channels.whatsapp.enabled}
              onToggle={(enabled) => updatePreferences({
                channels: {
                  ...preferences.channels,
                  whatsapp: { ...preferences.channels.whatsapp, enabled }
                }
              })}
            />
            <SettingItem
              icon={<Mail className="w-5 h-5" />}
              label="Correo Electrónico"
              toggle
              checked={preferences.channels.email.enabled}
              onToggle={(enabled) => updatePreferences({
                channels: {
                  ...preferences.channels,
                  email: { ...preferences.channels.email, enabled }
                }
              })}
            />
            <SettingItem
              icon={<Monitor className="w-5 h-5" />}
              label="Notificaciones Push"
              toggle
              checked={preferences.channels.push.enabled}
              onToggle={(enabled) => updatePreferences({
                channels: {
                  ...preferences.channels,
                  push: { ...preferences.channels.push, enabled }
                }
              })}
            />
          </SettingSection>

          {/* Apariencia */}
          <SettingSection title="Apariencia">
            <SettingItem
              icon={theme === 'light' ? <Sun className="w-5 h-5" /> : theme === 'dark' ? <Moon className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
              label="Tema"
              value={theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Automático'}
              onClick={() => {
                const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
                const currentIndex = themes.indexOf(theme);
                const nextTheme = themes[(currentIndex + 1) % themes.length];
                setTheme(nextTheme);
              }}
            />
            <SettingItem
              icon={<Globe className="w-5 h-5" />}
              label="Idioma"
              value={language === 'es' ? 'Español' : language === 'pt' ? 'Português' : 'English'}
              onClick={() => {
                const langs = ['es', 'pt', 'en'];
                const currentIndex = langs.indexOf(language);
                setLanguage(langs[(currentIndex + 1) % langs.length]);
              }}
            />
          </SettingSection>

          {/* Accesibilidad */}
          <SettingSection title="Accesibilidad">
            <SettingItem
              icon={<Monitor className="w-5 h-5" />}
              label="Reducir Movimiento"
              toggle
              checked={reducedMotion}
              onToggle={setReducedMotion}
            />
          </SettingSection>

          {/* Privacidad */}
          <SettingSection title="Privacidad y Seguridad">
            <SettingItem
              icon={<Lock className="w-5 h-5" />}
              label="Cambiar Contraseña"
              onClick={() => setShowChangePassword(true)}
            />
            <SettingItem
              icon={<Shield className="w-5 h-5" />}
              label="Autenticación de Dos Factores"
              value={is2FAEnabled ? 'Activada' : 'Desactivada'}
              onClick={() => setShow2FA(true)}
            />
            <SettingItem
              icon={<Download className="w-5 h-5" />}
              label="Exportar Mis Datos"
              onClick={() => {
                triggerHaptic('success');
                alert('📧 Te enviaremos un correo con tus datos en las próximas 24 horas');
              }}
            />
          </SettingSection>

          {/* Cuenta */}
          <SettingSection title="Cuenta">
            <SettingItem
              icon={<LogOut className="w-5 h-5 text-orange-600" />}
              label="Cerrar Sesión"
              onClick={() => setShowLogout(true)}
            />
            <SettingItem
              icon={<Trash2 className="w-5 h-5 text-red-600" />}
              label="Eliminar Cuenta"
              onClick={() => setShowDeleteAccount(true)}
            />
          </SettingSection>

          {/* Sobre */}
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
            <p>ClearHire v1.0.0</p>
            <p className="mt-2">© 2025 ClearHire - Arquitectura GlassBox</p>
            <div className="flex justify-center gap-4 mt-4">
              <button className="hover:text-blue-600 transition-colors">Términos</button>
              <button className="hover:text-blue-600 transition-colors">Privacidad</button>
              <button className="hover:text-blue-600 transition-colors">Soporte</button>
            </div>
          </div>
        </main>

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm" onClick={() => setShowChangePassword(false)}>
            <div className="min-h-screen px-4 flex items-center justify-center py-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Cambiar Contraseña
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Actualiza tu contraseña de acceso
                    </p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4 mb-6">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite la nueva contraseña"
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-2">
                      Requisitos de contraseña:
                    </p>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <li className="flex items-center gap-2">
                        <Check className={`w-3 h-3 ${newPassword.length >= 8 ? 'text-green-600' : 'text-slate-400'}`} />
                        Mínimo 8 caracteres
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className={`w-3 h-3 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-slate-400'}`} />
                        Al menos una mayúscula
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className={`w-3 h-3 ${/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-slate-400'}`} />
                        Al menos un número
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowChangePassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-semibold rounded-xl transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg"
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2FA Modal */}
        {show2FA && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm" onClick={() => setShow2FA(false)}>
            <div className="min-h-screen px-4 flex items-center justify-center py-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Autenticación de Dos Factores
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {is2FAEnabled ? 'Actualmente activada' : 'Protege tu cuenta'}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4 mb-6">
                  {!is2FAEnabled ? (
                    <>
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-900 dark:text-green-100 font-medium mb-2">
                          ¿Qué es 2FA?
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          La autenticación de dos factores agrega una capa extra de seguridad a tu cuenta. Necesitarás un código además de tu contraseña para iniciar sesión.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                          Código de verificación (demo):
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <Key className="w-5 h-5 text-slate-400" />
                          <code className="text-2xl font-mono font-bold text-slate-900 dark:text-slate-100">
                            123456
                          </code>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                          En producción, recibirías este código por SMS o app autenticadora
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Ingresa el código
                        </label>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          ¿Desactivar 2FA?
                        </p>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Tu cuenta estará menos protegida sin la autenticación de dos factores.
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShow2FA(false);
                      setVerificationCode('');
                    }}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-semibold rounded-xl transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleToggle2FA}
                    className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all active:scale-95 shadow-lg ${
                      is2FAEnabled
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                    }`}
                  >
                    {is2FAEnabled ? 'Desactivar 2FA' : 'Activar 2FA'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logout Modal */}
        {showLogout && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm" onClick={() => setShowLogout(false)}>
            <div className="min-h-screen px-4 flex items-center justify-center py-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <LogOut className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Cerrar Sesión
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      ¿Estás seguro?
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <p className="text-slate-700 dark:text-slate-300">
                    Tendrás que iniciar sesión nuevamente para acceder a tu cuenta.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogout(false)}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-semibold rounded-xl transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteAccount && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteAccount(false)}>
            <div className="min-h-screen px-4 flex items-center justify-center py-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Eliminar Cuenta
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Esta acción es permanente
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                          ⚠️ Advertencia: Esta acción NO se puede deshacer
                        </p>
                        <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                          <li>• Se eliminarán todos tus datos personales</li>
                          <li>• Perderás acceso a todas tus aplicaciones</li>
                          <li>• Se cancelarán tus ofertas activas</li>
                          <li>• No podrás recuperar tu cuenta</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Si estás seguro de que deseas eliminar tu cuenta permanentemente, haz clic en el botón de abajo.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteAccount(false)}
                    className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-semibold rounded-xl transition-all active:scale-95"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg"
                  >
                    Eliminar Cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Preferences Modal */}
        {showNotificationPrefs && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNotificationPrefs(false)}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Preferencias de Notificación
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Personaliza cómo y cuándo recibir notificaciones
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowNotificationPrefs(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[60vh] p-6">
                <NotificationPreferences
                  preferences={preferences}
                  onUpdate={updatePreferences}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default Settings;
