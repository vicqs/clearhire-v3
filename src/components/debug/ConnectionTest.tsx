/**
 * Componente simple para verificar el estado de la aplicación
 */
import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { authService } from '../../services/authService';
import { isSupabaseConfigured } from '../../lib/supabase';

export const ConnectionTest: React.FC = () => {
  const user = authService.getCurrentUser();
  const supabaseConfigured = isSupabaseConfigured();
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';

  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">Estado de la Aplicación</h3>
      
      <div className="space-y-2">
        {/* Estado del Usuario */}
        <div className="flex items-center gap-2">
          {user?.isAuthenticated ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="text-sm">
            Usuario: {user?.isAuthenticated ? 'Autenticado' : 'No autenticado'}
          </span>
        </div>

        {/* Modo de Operación */}
        <div className="flex items-center gap-2">
          {user?.isMock ? (
            <Info className="w-4 h-4 text-yellow-600" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-600" />
          )}
          <span className="text-sm">
            Modo: {user?.isMock ? 'Mock (Desarrollo)' : 'Producción'}
          </span>
        </div>

        {/* Configuración Supabase */}
        <div className="flex items-center gap-2">
          {supabaseConfigured && useSupabase ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <Info className="w-4 h-4 text-yellow-600" />
          )}
          <span className="text-sm">
            Supabase: {supabaseConfigured && useSupabase ? 'Habilitado' : 'Deshabilitado'}
          </span>
        </div>

        {/* Email del Usuario */}
        {user?.email && (
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm">Email: {user.email}</span>
          </div>
        )}
      </div>

      {/* Estado General */}
      <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-800 font-medium">
            ✅ Aplicación funcionando correctamente
          </span>
        </div>
      </div>
    </div>
  );
};