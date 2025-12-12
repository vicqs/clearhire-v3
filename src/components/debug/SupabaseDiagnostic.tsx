/**
 * Diagnóstico de Supabase - Verifica credenciales y configuración
 */
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, ExternalLink, Copy, RefreshCw, Terminal, Trash2 } from 'lucide-react';
import { debugSupabaseConnection, clearSupabaseCache, checkPortChange } from '../../utils/supabaseDebug';

export const SupabaseDiagnostic: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const runDiagnostic = async () => {
    setIsChecking(true);
    const results: any = {
      urlValid: false,
      keyValid: false,
      projectExists: false,
      corsConfigured: false,
      errors: []
    };

    try {
      // 1. Verificar formato de URL
      if (supabaseUrl && supabaseUrl.includes('.supabase.co')) {
        results.urlValid = true;
      } else {
        results.errors.push('URL de Supabase inválida o faltante');
      }

      // 2. Verificar formato de key
      if (supabaseKey && supabaseKey.startsWith('eyJ')) {
        results.keyValid = true;
      } else {
        results.errors.push('Clave anónima de Supabase inválida o faltante');
      }

      // 3. Verificar si el proyecto existe
      if (results.urlValid) {
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'HEAD',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            }
          });
          
          if (response.ok) {
            results.projectExists = true;
            results.corsConfigured = true;
          } else if (response.status === 404) {
            results.errors.push('Proyecto Supabase no encontrado (404)');
          } else {
            results.errors.push(`Error del servidor: ${response.status}`);
          }
        } catch (error: any) {
          if (error.message.includes('CORS')) {
            results.errors.push('Error de CORS - Proyecto existe pero no está configurado correctamente');
          } else if (error.message.includes('Failed to fetch')) {
            results.errors.push('Proyecto no existe o credenciales inválidas');
          } else {
            results.errors.push(`Error de red: ${error.message}`);
          }
        }
      }

      setDiagnosticResults(results);
    } catch (error) {
      console.error('Error en diagnóstico:', error);
      results.errors.push('Error inesperado en el diagnóstico');
      setDiagnosticResults(results);
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const extractProjectId = (url: string) => {
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : 'unknown';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-orange-600" />
        <h3 className="font-semibold text-gray-800">Diagnóstico de Supabase</h3>
      </div>

      {/* Información Actual */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-700">Configuración Actual:</h4>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-600">URL:</span>
            <div className="font-mono text-xs bg-white p-2 rounded border mt-1 flex items-center justify-between">
              <span className="truncate">{supabaseUrl || 'No configurada'}</span>
              {supabaseUrl && (
                <button
                  onClick={() => copyToClipboard(supabaseUrl)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <span className="text-gray-600">Proyecto ID:</span>
            <div className="font-mono text-xs bg-white p-2 rounded border mt-1">
              {supabaseUrl ? extractProjectId(supabaseUrl) : 'N/A'}
            </div>
          </div>
          
          <div>
            <span className="text-gray-600">Clave Anónima:</span>
            <div className="font-mono text-xs bg-white p-2 rounded border mt-1 flex items-center justify-between">
              <span className="truncate">
                {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'No configurada'}
              </span>
              {supabaseKey && (
                <button
                  onClick={() => copyToClipboard(supabaseKey)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Diagnóstico */}
      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={runDiagnostic}
          disabled={isChecking}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Verificando...' : 'Diagnóstico Básico'}
        </button>
        
        <button
          onClick={() => {
            debugSupabaseConnection();
            console.log('🔍 Revisa la consola del navegador para ver el diagnóstico completo');
          }}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 flex items-center justify-center gap-2"
        >
          <Terminal className="w-4 h-4" />
          Diagnóstico Avanzado (Consola)
        </button>
        
        <button
          onClick={() => {
            clearSupabaseCache();
            checkPortChange();
            console.log('🧹 Cache limpiado. Recarga la página para aplicar cambios.');
          }}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Limpiar Cache y Reintentar
        </button>
      </div>

      {/* Resultados del Diagnóstico */}
      {diagnosticResults && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Resultados:</h4>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {diagnosticResults.urlValid ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Formato de URL válido</span>
            </div>
            
            <div className="flex items-center gap-2">
              {diagnosticResults.keyValid ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Formato de clave válido</span>
            </div>
            
            <div className="flex items-center gap-2">
              {diagnosticResults.projectExists ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">Proyecto existe y es accesible</span>
            </div>
            
            <div className="flex items-center gap-2">
              {diagnosticResults.corsConfigured ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm">CORS configurado correctamente</span>
            </div>
          </div>

          {/* Errores */}
          {diagnosticResults.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h5 className="font-medium text-red-800 mb-2">Problemas Detectados:</h5>
              <ul className="text-sm text-red-700 space-y-1">
                {diagnosticResults.errors.map((error: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Instrucciones para Crear Nuevo Proyecto */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">🚀 Crear Nuevo Proyecto Supabase:</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Ve a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a></li>
          <li>Crea una cuenta o inicia sesión</li>
          <li>Haz clic en "New Project"</li>
          <li>Completa los datos del proyecto</li>
          <li>Espera a que se cree (2-3 minutos)</li>
          <li>Ve a Settings → API</li>
          <li>Copia la URL y la clave anónima</li>
          <li>Actualiza tu archivo .env</li>
        </ol>
      </div>

      {/* Posibles Causas del Problema */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-medium text-orange-800 mb-2">🤔 ¿Por qué antes funcionaba y ahora no?</h4>
        <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
          <li><strong>Puerto cambió:</strong> El servidor ahora usa puerto {window.location.port} (antes era otro)</li>
          <li><strong>Cache del navegador:</strong> Datos antiguos interfieren con la conexión</li>
          <li><strong>Configuración CORS en Supabase:</strong> Se perdió la configuración del localhost</li>
          <li><strong>Dependencias actualizadas:</strong> Nueva versión de @supabase/supabase-js</li>
          <li><strong>Sesión expirada:</strong> Token de autenticación caducó</li>
        </ul>
      </div>

      {/* Configuración Temporal */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">⚡ Solución Temporal:</h4>
        <p className="text-sm text-yellow-700 mb-2">
          Mientras investigas el problema, puedes usar modo mock:
        </p>
        <code className="text-xs bg-yellow-100 p-2 rounded block">
          VITE_USE_SUPABASE=false
        </code>
        <p className="text-xs text-yellow-600 mt-2">
          Esto eliminará todos los errores de CORS y permitirá desarrollo normal.
        </p>
      </div>
    </div>
  );
};