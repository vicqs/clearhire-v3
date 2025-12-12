/**
 * Toggle para cambiar entre modo Supabase y Mock
 */
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';

export const SupabaseToggle: React.FC = () => {
  const [isSupabaseEnabled, setIsSupabaseEnabled] = useState(
    import.meta.env.VITE_USE_SUPABASE === 'true'
  );
  const [isChanging, setIsChanging] = useState(false);

  const handleToggle = async () => {
    const newMode = !isSupabaseEnabled;
    const modeText = newMode ? 'Supabase' : 'Mock';
    
    const confirmed = window.confirm(
      `¿Cambiar a modo ${modeText}?\n\n` +
      `Esto requiere:\n` +
      `1. Cambiar VITE_USE_SUPABASE=${newMode} en .env\n` +
      `2. Reiniciar el servidor (npm run dev)\n\n` +
      `¿Continuar?`
    );
    
    if (!confirmed) return;
    
    setIsChanging(true);
    
    try {
      // Mostrar instrucciones
      alert(
        `Para cambiar a modo ${modeText}:\n\n` +
        `1. Edita el archivo .env\n` +
        `2. Cambia: VITE_USE_SUPABASE=${newMode}\n` +
        `3. Reinicia el servidor: Ctrl+C y npm run dev\n\n` +
        `El toggle se actualizará después del reinicio.`
      );
      
      // Limpiar cache relacionado
      authService.clearConnectionIssues();
      
      setIsChanging(false);
      
    } catch (error) {
      console.error('Error cambiando modo:', error);
      setIsChanging(false);
    }
  };

  const currentUser = authService.getCurrentUser();
  const actualMode = currentUser?.isMock ? 'mock' : 'supabase';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Control de Modo</h3>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div>
          <p className="font-medium text-gray-800">
            Modo Supabase
          </p>
          <p className="text-sm text-gray-600">
            {isSupabaseEnabled ? 'Intentar usar base de datos real' : 'Usar datos locales (mock)'}
          </p>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isChanging}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isSupabaseEnabled ? 'bg-blue-600' : 'bg-gray-300'
          } ${isChanging ? 'opacity-50' : ''}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isSupabaseEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Estado Actual */}
      <div className="p-3 rounded-lg border">
        <div className="flex items-center gap-2 mb-2">
          {actualMode === 'mock' ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          )}
          <span className="font-medium text-gray-800">
            Estado Actual: {actualMode === 'mock' ? 'Modo Mock' : 'Modo Supabase'}
          </span>
        </div>
        
        <p className="text-sm text-gray-600">
          {actualMode === 'mock' 
            ? '✅ Funcionando con datos locales - Sin errores de conexión'
            : '⚠️ Intentando usar Supabase - Puede tener errores de conexión'
          }
        </p>
      </div>

      {/* Información */}
      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-200">
        <p className="font-medium mb-1">💡 Control Manual:</p>
        <p>El sistema <strong>NO</strong> cambiará automáticamente a modo mock si Supabase falla.</p>
        <p className="mt-1">Usa este toggle para cambiar manualmente entre modos.</p>
        <p className="mt-1"><strong>Requiere reiniciar</strong> el servidor después del cambio.</p>
      </div>

      {/* Botón de Reinicio */}
      <button
        onClick={() => {
          authService.clearConnectionIssues();
          window.location.reload();
        }}
        className="w-full px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
      >
        🔄 Reiniciar Aplicación
      </button>

      {/* Información Técnica */}
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-600">VITE_USE_SUPABASE:</span>
          <span className="font-mono">{import.meta.env.VITE_USE_SUPABASE || 'false'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Usuario actual:</span>
          <span className="font-mono">{currentUser?.isMock ? 'Mock' : 'Real'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Problemas detectados:</span>
          <span className="font-mono">
            {localStorage.getItem('supabase_connection_failed') === 'true' ? 'Sí' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
};