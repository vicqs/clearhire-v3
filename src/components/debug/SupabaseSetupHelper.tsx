import React, { useState } from 'react';
import { debugSupabaseConnection } from '../../utils/supabaseDebug';

interface DiagnosticTest {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

export const SupabaseSetupHelper: React.FC = () => {
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [tests, setTests] = useState<DiagnosticTest[]>([]);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setTests([]);
    
    const testList: DiagnosticTest[] = [
      { name: 'Variables de entorno', status: 'pending' },
      { name: 'Formato de URL', status: 'pending' },
      { name: 'Formato de Key', status: 'pending' },
      { name: 'Conectividad básica', status: 'pending' },
      { name: 'API REST', status: 'pending' },
      { name: 'Autenticación', status: 'pending' }
    ];
    
    setTests([...testList]);
    
    try {
      // Test 1: Variables de entorno
      setTests(prev => prev.map(t => 
        t.name === 'Variables de entorno' 
          ? { ...t, status: 'running' } 
          : t
      ));
      
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      if (!url || !key) {
        setTests(prev => prev.map(t => 
          t.name === 'Variables de entorno' 
            ? { ...t, status: 'error', message: 'Variables no configuradas' } 
            : t
        ));
        return;
      }
      
      setTests(prev => prev.map(t => 
        t.name === 'Variables de entorno' 
          ? { ...t, status: 'success', message: 'Variables encontradas' } 
          : t
      ));
      
      // Test 2: Formato de URL
      setTests(prev => prev.map(t => 
        t.name === 'Formato de URL' 
          ? { ...t, status: 'running' } 
          : t
      ));
      
      const urlPattern = /^https:\/\/[a-z0-9]+\.supabase\.co$/;
      const isValidUrl = urlPattern.test(url);
      
      setTests(prev => prev.map(t => 
        t.name === 'Formato de URL' 
          ? { 
              ...t, 
              status: isValidUrl ? 'success' : 'error',
              message: isValidUrl ? 'URL válida' : 'URL inválida o placeholder'
            } 
          : t
      ));
      
      // Test 3: Formato de Key
      setTests(prev => prev.map(t => 
        t.name === 'Formato de Key' 
          ? { ...t, status: 'running' } 
          : t
      ));
      
      const isValidKey = key.startsWith('eyJ') && key.length > 100;
      
      setTests(prev => prev.map(t => 
        t.name === 'Formato de Key' 
          ? { 
              ...t, 
              status: isValidKey ? 'success' : 'error',
              message: isValidKey ? 'Key válida' : 'Key inválida o placeholder'
            } 
          : t
      ));
      
      if (!isValidUrl || !isValidKey) {
        // Marcar tests restantes como pendientes si las credenciales son inválidas
        setTests(prev => prev.map(t => 
          ['Conectividad básica', 'API REST', 'Autenticación'].includes(t.name)
            ? { ...t, status: 'error', message: 'Requiere credenciales válidas' }
            : t
        ));
        return;
      }
      
      // Test 4: Conectividad básica
      setTests(prev => prev.map(t => 
        t.name === 'Conectividad básica' 
          ? { ...t, status: 'running' } 
          : t
      ));
      
      try {
        const response = await fetch(url + '/rest/v1/', {
          method: 'HEAD',
          headers: { 'apikey': key }
        });
        
        setTests(prev => prev.map(t => 
          t.name === 'Conectividad básica' 
            ? { 
                ...t, 
                status: response.ok ? 'success' : 'error',
                message: `Status: ${response.status} ${response.statusText}`
              } 
            : t
        ));
      } catch (error: any) {
        setTests(prev => prev.map(t => 
          t.name === 'Conectividad básica' 
            ? { ...t, status: 'error', message: error.message } 
            : t
        ));
      }
      
      // Test 5: API REST
      setTests(prev => prev.map(t => 
        t.name === 'API REST' 
          ? { ...t, status: 'running' } 
          : t
      ));
      
      try {
        const response = await fetch(url + '/rest/v1/', {
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`
          }
        });
        
        setTests(prev => prev.map(t => 
          t.name === 'API REST' 
            ? { 
                ...t, 
                status: response.ok ? 'success' : 'error',
                message: `API REST: ${response.status}`
              } 
            : t
        ));
      } catch (error: any) {
        setTests(prev => prev.map(t => 
          t.name === 'API REST' 
            ? { ...t, status: 'error', message: error.message } 
            : t
        ));
      }
      
      // Test 6: Autenticación
      setTests(prev => prev.map(t => 
        t.name === 'Autenticación' 
          ? { ...t, status: 'running' } 
          : t
      ));
      
      try {
        const response = await fetch(url + '/auth/v1/health', {
          headers: { 'apikey': key }
        });
        
        setTests(prev => prev.map(t => 
          t.name === 'Autenticación' 
            ? { 
                ...t, 
                status: response.ok ? 'success' : 'error',
                message: `Auth: ${response.status}`
              } 
            : t
        ));
      } catch (error: any) {
        setTests(prev => prev.map(t => 
          t.name === 'Autenticación' 
            ? { ...t, status: 'error', message: error.message } 
            : t
        ));
      }
      
      // Ejecutar diagnóstico completo en consola
      const result = await debugSupabaseConnection();
      setDiagnosticResult(result);
      
    } catch (error) {
      console.error('Error en diagnóstico:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const currentUrl = import.meta.env.VITE_SUPABASE_URL;
  const isOldProject = currentUrl?.includes('vzcuumrnilzeufizyfei');
  const isPlaceholder = currentUrl?.includes('tu-nuevo-proyecto') || currentUrl?.includes('tu-id-unico');
  const needsSetup = isOldProject || isPlaceholder || !currentUrl;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          🔧 Configuración de Supabase
        </h3>
        <button
          onClick={runDiagnostic}
          disabled={isRunning}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? 'Ejecutando...' : 'Diagnosticar'}
        </button>
      </div>

      {/* Estado actual */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Estado:</span>
          {needsSetup ? (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
              ⚠️ Configuración Requerida
            </span>
          ) : (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              ✅ Configurado
            </span>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <strong>URL actual:</strong> {currentUrl || 'No configurada'}
        </div>

        <div className="text-sm text-gray-600">
          <strong>Modo:</strong> {import.meta.env.VITE_USE_SUPABASE === 'true' ? 'Supabase' : 'Mock'}
        </div>
      </div>

      {/* Problemas detectados */}
      {needsSetup && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <h4 className="font-medium text-yellow-800 mb-2">🚨 Problemas Detectados:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {isOldProject && (
              <li>• El proyecto <code>vzcuumrnilzeufizyfei</code> no existe o fue eliminado</li>
            )}
            {isPlaceholder && (
              <li>• Las credenciales son placeholders, necesitas credenciales reales</li>
            )}
            {!currentUrl && (
              <li>• No hay URL de Supabase configurada</li>
            )}
          </ul>
        </div>
      )}

      {/* Solución rápida */}
      {needsSetup && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <h4 className="font-medium text-blue-800 mb-2">💡 Solución Rápida:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Ve a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
            <li>Crea un nuevo proyecto llamado <code>clearhire-ats</code></li>
            <li>Ve a Settings → API y copia las credenciales</li>
            <li>Actualiza tu archivo <code>.env</code> con las nuevas credenciales</li>
            <li>Reinicia el servidor de desarrollo</li>
          </ol>
          <div className="mt-2">
            <a 
              href="/SETUP_SUPABASE.md" 
              target="_blank"
              className="text-blue-600 underline text-sm"
            >
              📖 Ver guía completa
            </a>
          </div>
        </div>
      )}

      {/* Solución temporal */}
      <div className="bg-gray-50 border border-gray-200 rounded p-3">
        <h4 className="font-medium text-gray-800 mb-2">🔄 Solución Temporal:</h4>
        <p className="text-sm text-gray-600 mb-2">
          Si necesitas continuar desarrollando mientras configuras Supabase:
        </p>
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
          VITE_USE_SUPABASE=false
        </code>
        <p className="text-xs text-gray-500 mt-1">
          Esto activará el modo mock y eliminará todos los errores de conexión.
        </p>
      </div>

      {/* Tests de diagnóstico */}
      {tests.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <h4 className="font-medium text-gray-800 mb-3">🧪 Tests de Diagnóstico:</h4>
          <div className="space-y-2">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{test.name}</span>
                <div className="flex items-center space-x-2">
                  {test.status === 'pending' && <span className="text-gray-400">⏳</span>}
                  {test.status === 'running' && <span className="text-blue-500">🔄</span>}
                  {test.status === 'success' && <span className="text-green-500">✅</span>}
                  {test.status === 'error' && <span className="text-red-500">❌</span>}
                  {test.message && (
                    <span className="text-xs text-gray-500">{test.message}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Resumen */}
          {!isRunning && tests.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm">
                <strong>Resumen:</strong> {' '}
                {tests.filter(t => t.status === 'success').length} de {tests.length} tests pasaron
              </div>
              {tests.every(t => t.status === 'success') && (
                <div className="text-green-600 text-sm mt-1">
                  🎉 ¡Supabase está configurado correctamente!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resultado del diagnóstico */}
      {diagnosticResult && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <h4 className="font-medium text-gray-800 mb-2">📊 Diagnóstico Completo:</h4>
          <p className="text-xs text-gray-500">
            Ver consola del navegador (F12) para detalles completos del diagnóstico
          </p>
        </div>
      )}
    </div>
  );
};