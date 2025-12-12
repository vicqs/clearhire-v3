import React, { useState } from 'react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const SupabaseProjectChecker: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [projectStatus, setProjectStatus] = useState<string>('');

  const updateTest = (name: string, status: TestResult['status'], message: string, details?: any) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => t.name === name ? { ...t, status, message, details } : t);
      } else {
        return [...prev, { name, status, message, details }];
      }
    });
  };

  const runComprehensiveCheck = async () => {
    setIsRunning(true);
    setTests([]);
    setProjectStatus('');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    try {
      // Test 1: Verificar variables de entorno
      updateTest('Variables de entorno', 'running', 'Verificando configuración...');
      
      if (!supabaseUrl || !supabaseKey) {
        updateTest('Variables de entorno', 'error', 'Variables no configuradas');
        setIsRunning(false);
        return;
      }

      updateTest('Variables de entorno', 'success', 'Variables configuradas correctamente');

      // Test 2: Verificar formato de JWT
      updateTest('JWT Token', 'running', 'Decodificando JWT...');
      
      try {
        const payload = JSON.parse(atob(supabaseKey.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();
        const expiryDate = new Date(payload.exp * 1000).toLocaleString();
        
        updateTest('JWT Token', isExpired ? 'error' : 'success', 
          isExpired ? `Token expirado (${expiryDate})` : `Token válido hasta ${expiryDate}`,
          payload
        );
      } catch (error) {
        updateTest('JWT Token', 'error', 'Error decodificando JWT');
      }

      // Test 3: Conectividad básica
      updateTest('Conectividad', 'running', 'Probando conectividad básica...');
      
      try {
        const response = await fetch(supabaseUrl, {
          method: 'HEAD',
          mode: 'cors'
        });
        
        updateTest('Conectividad', 'success', `Servidor responde: ${response.status}`, {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries())
        });
      } catch (error: any) {
        updateTest('Conectividad', 'error', `Error de conectividad: ${error.message}`);
      }

      // Test 4: API REST con autenticación
      updateTest('API REST', 'running', 'Probando API REST...');
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 403) {
          updateTest('API REST', 'error', 'Error 403: Proyecto pausado o restringido', {
            status: response.status,
            statusText: response.statusText
          });
          setProjectStatus('El proyecto parece estar pausado o tener restricciones activas');
        } else if (response.status === 200 || response.status === 401) {
          updateTest('API REST', 'success', `API funcionando: ${response.status}`, {
            status: response.status
          });
          setProjectStatus('Proyecto activo y funcionando');
        } else {
          updateTest('API REST', 'warning', `Respuesta inesperada: ${response.status}`, {
            status: response.status
          });
        }
      } catch (error: any) {
        if (error.message.includes('CORS')) {
          updateTest('API REST', 'error', 'Error de CORS - Verificar configuración');
          setProjectStatus('Problema de configuración CORS');
        } else {
          updateTest('API REST', 'error', `Error: ${error.message}`);
        }
      }

      // Test 5: Auth Health Check
      updateTest('Autenticación', 'running', 'Verificando servicio de auth...');
      
      try {
        const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
          headers: {
            'apikey': supabaseKey
          }
        });

        if (response.ok) {
          const data = await response.json();
          updateTest('Autenticación', 'success', 'Servicio de auth funcionando', data);
        } else if (response.status === 403) {
          updateTest('Autenticación', 'error', 'Auth bloqueado - Proyecto pausado');
        } else {
          updateTest('Autenticación', 'warning', `Auth responde: ${response.status}`);
        }
      } catch (error: any) {
        updateTest('Autenticación', 'error', `Error en auth: ${error.message}`);
      }

      // Test 6: Verificar configuración CORS
      updateTest('CORS', 'running', 'Verificando configuración CORS...');
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'OPTIONS',
          headers: {
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'apikey,authorization'
          }
        });

        updateTest('CORS', response.ok ? 'success' : 'warning', 
          `Preflight CORS: ${response.status}`, {
            allowOrigin: response.headers.get('Access-Control-Allow-Origin'),
            allowMethods: response.headers.get('Access-Control-Allow-Methods'),
            allowHeaders: response.headers.get('Access-Control-Allow-Headers')
          }
        );
      } catch (error: any) {
        updateTest('CORS', 'error', `Error CORS: ${error.message}`);
      }

    } catch (error) {
      console.error('Error en diagnóstico:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          🔍 Verificador de Estado de Supabase
        </h2>
        <button
          onClick={runComprehensiveCheck}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? 'Verificando...' : 'Verificar Estado'}
        </button>
      </div>

      {/* Estado del proyecto */}
      {projectStatus && (
        <div className={`p-4 rounded-lg border ${
          projectStatus.includes('pausado') || projectStatus.includes('restringido') 
            ? 'bg-red-50 border-red-200 text-red-800'
            : projectStatus.includes('funcionando')
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <h3 className="font-medium mb-2">📊 Estado del Proyecto:</h3>
          <p>{projectStatus}</p>
        </div>
      )}

      {/* Resultados de tests */}
      {tests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Resultados de Verificación:</h3>
          
          <div className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getStatusIcon(test.status)}</span>
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <span className={`text-sm ${getStatusColor(test.status)}`}>
                    {test.message}
                  </span>
                </div>
                
                {test.details && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Resumen y recomendaciones */}
          {!isRunning && tests.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">💡 Recomendaciones:</h4>
              
              {tests.some(t => t.status === 'error' && t.message.includes('403')) && (
                <div className="space-y-2 text-blue-700">
                  <p><strong>Proyecto pausado detectado:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Ve a <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                    <li>Busca tu proyecto <code>vzcuumrnilzeufizyfei</code></li>
                    <li>Si dice "Paused", haz clic en "Resume"</li>
                    <li>Espera 2-3 minutos y vuelve a verificar</li>
                  </ol>
                </div>
              )}

              {tests.every(t => t.status === 'success') && (
                <p className="text-green-700">
                  ✅ Todo funciona correctamente. Puedes activar Supabase con <code>VITE_USE_SUPABASE=true</code>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Información del proyecto */}
      <div className="text-sm text-gray-600 space-y-1">
        <p><strong>Proyecto:</strong> vzcuumrnilzeufizyfei</p>
        <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</p>
        <p><strong>Modo actual:</strong> {import.meta.env.VITE_USE_SUPABASE === 'true' ? 'Supabase' : 'Mock'}</p>
      </div>
    </div>
  );
};