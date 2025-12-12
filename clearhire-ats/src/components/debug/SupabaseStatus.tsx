/**
 * Estado de Conexión a Supabase para Debug
 */
import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { authService } from '../../services/authService';

export const SupabaseStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected' | 'mock'>('checking');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');

  const checkConnection = async () => {
    setIsRefreshing(true);
    setErrorDetails('');
    
    try {
      // Verificar configuración primero
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const useSupabase = import.meta.env.VITE_USE_SUPABASE;

      // Si Supabase está desactivado o no configurado, usar modo mock
      if (useSupabase !== 'true' || !isSupabaseConfigured() || !supabaseUrl || !supabaseKey) {
        setConnectionStatus('mock');
        
        if (useSupabase !== 'true') {
          setErrorDetails('Supabase desactivado en configuración (.env)');
        } else if (!supabaseUrl || !supabaseKey) {
          setErrorDetails('Variables de entorno no configuradas');
        } else {
          setErrorDetails('Configuración no válida');
        }
        
        setLastCheck(new Date());
        return;
      }

      // Solo intentar conexión si Supabase está habilitado
      try {
        // Intentar una verificación simple con timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout de conexión (3s)')), 3000)
        );
        
        const healthCheck = fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });

        await Promise.race([healthCheck, timeoutPromise]);
        
        const user = authService.getCurrentUser();
        if (user && !user.isMock) {
          setConnectionStatus('connected');
          setErrorDetails('');
        } else {
          setConnectionStatus('mock');
          setErrorDetails('Usuario en modo mock');
        }
      } catch (fetchError: any) {
        console.warn('Error de conexión con Supabase:', fetchError.message);
        setConnectionStatus('disconnected');
        setErrorDetails(`Error de conexión: ${fetchError.message}`);
      }
      
      setLastCheck(new Date());
    } catch (error: any) {
      console.error('Error inesperado verificando conexión:', error);
      setConnectionStatus('mock');
      setErrorDetails(`Error inesperado: ${error.message}`);
      setLastCheck(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkConnection();
    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          status: 'Conectado a Supabase',
          description: 'Base de datos en línea y funcionando'
        };
      case 'disconnected':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          status: 'Desconectado',
          description: 'No se puede conectar a Supabase'
        };
      case 'mock':
        return {
          icon: Database,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          status: 'Modo Mock',
          description: 'Usando datos locales de prueba'
        };
      default:
        return {
          icon: RefreshCw,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          status: 'Verificando...',
          description: 'Comprobando estado de conexión'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const enableSupabase = () => {
    // Mostrar instrucciones para habilitar Supabase
    alert(`Para habilitar Supabase:
1. Verifica que las variables de entorno estén configuradas
2. Cambia VITE_USE_SUPABASE=true en el archivo .env
3. Reinicia el servidor de desarrollo`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-800">Estado de Supabase</h3>
      </div>

      {/* Estado Principal */}
      <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <Icon className={`w-5 h-5 ${config.color} ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
            {connectionStatus === 'connected' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <p className={`font-semibold ${config.color}`}>
              {config.status}
            </p>
            <p className="text-sm text-gray-600">
              {config.description}
            </p>
          </div>
        </div>
        
        {errorDetails && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700">
            <strong>Detalles:</strong> {errorDetails}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-2">
          Última verificación: {lastCheck.toLocaleTimeString()}
        </div>
      </div>

      {/* Información Técnica */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Información Técnica:</h4>
        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Configurado:</span>
            <span className={isSupabaseConfigured() ? 'text-green-600' : 'text-red-600'}>
              {isSupabaseConfigured() ? 'Sí' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Modo:</span>
            <span className="text-gray-800">
              {connectionStatus === 'mock' ? 'Desarrollo (Mock)' : 'Producción'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Usuario:</span>
            <span className="text-gray-800">
              {authService.getCurrentUser()?.email || 'Anónimo'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ID Usuario:</span>
            <span className="text-gray-800 font-mono text-xs">
              {authService.getCurrentUserId()?.substring(0, 8) || 'N/A'}...
            </span>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-2">
        <button
          onClick={checkConnection}
          disabled={isRefreshing}
          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Verificando...' : 'Verificar'}
        </button>
        
        {connectionStatus === 'mock' && (
          <button
            onClick={enableSupabase}
            className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
          >
            Habilitar
          </button>
        )}
      </div>

      {/* Variables de Entorno (solo en desarrollo) */}
      {import.meta.env.DEV && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Variables de Entorno:</h4>
          <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-gray-600">VITE_SUPABASE_URL:</span>
              <span className="text-gray-800">
                {import.meta.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ Faltante'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VITE_SUPABASE_PUBLISHABLE_KEY:</span>
              <span className="text-gray-800">
                {import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Configurada' : '❌ Faltante'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VITE_USE_SUPABASE:</span>
              <span className="text-gray-800">
                {import.meta.env.VITE_USE_SUPABASE || 'false'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Ayuda */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-200">
        <p>💡 <strong>Modo Mock:</strong> Perfecto para desarrollo sin configurar Supabase.</p>
        <p>🔗 <strong>Conectado:</strong> Datos se guardan en la base de datos real.</p>
        {connectionStatus === 'disconnected' && (
          <p className="mt-1 text-red-600">⚠️ <strong>Error CORS:</strong> Verifica la configuración del proyecto Supabase.</p>
        )}
      </div>
    </div>
  );
};