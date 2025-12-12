/**
 * Utilidades de debug para Supabase
 * Ayuda a diagnosticar problemas de conexión
 */

export const debugSupabaseConnection = async () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.group('🔍 Diagnóstico de Supabase');
  
  // 1. Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log('  URL:', supabaseUrl);
  console.log('  Key (primeros 20 chars):', supabaseKey?.substring(0, 20) + '...');
  console.log('  USE_SUPABASE:', import.meta.env.VITE_USE_SUPABASE);
  
  // Verificar si es el proyecto problemático
  if (supabaseUrl?.includes('vzcuumrnilzeufizyfei')) {
    console.warn('⚠️ PROBLEMA DETECTADO: Estás usando el proyecto eliminado vzcuumrnilzeufizyfei');
    console.log('💡 SOLUCIÓN: Necesitas crear un nuevo proyecto Supabase');
    console.log('📖 Ver: SETUP_SUPABASE.md para instrucciones completas');
  }
  
  if (supabaseUrl?.includes('tu-nuevo-proyecto') || supabaseUrl?.includes('tu-id-unico')) {
    console.warn('⚠️ CONFIGURACIÓN PENDIENTE: Necesitas reemplazar las credenciales de ejemplo');
    console.log('📖 Ver: SETUP_SUPABASE.md para obtener credenciales reales');
  }
  
  // 2. Verificar formato de URL
  const urlPattern = /^https:\/\/[a-z0-9]+\.supabase\.co$/;
  const isValidUrl = urlPattern.test(supabaseUrl || '');
  console.log('✅ URL válida:', isValidUrl);
  
  // 3. Verificar formato de key
  const isValidKey = supabaseKey?.startsWith('eyJ') && supabaseKey.length > 100;
  console.log('✅ Key válida:', isValidKey);
  
  // 4. Extraer información del JWT
  if (supabaseKey) {
    try {
      const payload = JSON.parse(atob(supabaseKey.split('.')[1]));
      console.log('🔑 JWT Info:');
      console.log('  Issuer:', payload.iss);
      console.log('  Project Ref:', payload.ref);
      console.log('  Role:', payload.role);
      console.log('  Issued At:', new Date(payload.iat * 1000).toLocaleString());
      console.log('  Expires At:', new Date(payload.exp * 1000).toLocaleString());
      console.log('  ¿Expirado?:', payload.exp * 1000 < Date.now());
    } catch (error) {
      console.error('❌ Error decodificando JWT:', error);
    }
  }
  
  // 5. Probar conectividad básica
  if (supabaseUrl && supabaseKey) {
    console.log('🌐 Probando conectividad...');
    
    try {
      // Probar con diferentes métodos
      const tests = [
        {
          name: 'REST API Health Check',
          url: `${supabaseUrl}/rest/v1/`,
          method: 'HEAD' as const,
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          } as Record<string, string>
        },
        {
          name: 'Auth Health Check',
          url: `${supabaseUrl}/auth/v1/health`,
          method: 'GET' as const,
          headers: {
            'apikey': supabaseKey
          } as Record<string, string>
        },
        {
          name: 'Simple GET to REST',
          url: `${supabaseUrl}/rest/v1/`,
          method: 'GET' as const,
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          } as Record<string, string>
        }
      ];
      
      for (const test of tests) {
        try {
          console.log(`  Probando: ${test.name}...`);
          const response = await fetch(test.url, {
            method: test.method,
            headers: test.headers
          });
          
          console.log(`    Status: ${response.status} ${response.statusText}`);
          console.log(`    Headers:`, Object.fromEntries(response.headers.entries()));
          
          if (test.method === 'GET' && response.ok) {
            const text = await response.text();
            console.log(`    Response:`, text.substring(0, 200) + '...');
          }
          
        } catch (error: any) {
          console.error(`    ❌ Error en ${test.name}:`, error.message);
          
          // Analizar tipo de error
          if (error.message.includes('CORS')) {
            console.log('    🔍 Tipo: Error de CORS');
          } else if (error.message.includes('Failed to fetch')) {
            console.log('    🔍 Tipo: Error de red/DNS');
          } else if (error.message.includes('Timeout')) {
            console.log('    🔍 Tipo: Timeout de conexión');
          }
        }
      }
    } catch (error) {
      console.error('❌ Error general en pruebas:', error);
    }
  }
  
  // 6. Información del entorno
  console.log('🌍 Información del entorno:');
  console.log('  User Agent:', navigator.userAgent);
  console.log('  URL actual:', window.location.href);
  console.log('  Protocolo:', window.location.protocol);
  console.log('  Host:', window.location.host);
  console.log('  Puerto:', window.location.port);
  
  // 7. Verificar localStorage
  console.log('💾 LocalStorage relacionado:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('auth'))) {
      console.log(`  ${key}:`, localStorage.getItem(key)?.substring(0, 50) + '...');
    }
  }
  
  console.groupEnd();
  
  return {
    url: supabaseUrl,
    keyValid: isValidKey,
    urlValid: isValidUrl
  };
};

// Función para limpiar cache y reintentar
export const clearSupabaseCache = () => {
  console.log('🧹 Limpiando cache de Supabase...');
  
  // Limpiar localStorage relacionado con Supabase
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('sb-'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`  Removido: ${key}`);
  });
  
  // Limpiar sessionStorage también
  const sessionKeysToRemove: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('sb-'))) {
      sessionKeysToRemove.push(key);
    }
  }
  
  sessionKeysToRemove.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`  Removido de session: ${key}`);
  });
  
  console.log('✅ Cache limpiado');
};

// Función para verificar si el puerto cambió
export const checkPortChange = () => {
  const currentPort = window.location.port;
  const savedPort = localStorage.getItem('dev_server_port');
  
  if (savedPort && savedPort !== currentPort) {
    console.warn(`⚠️ Puerto cambió de ${savedPort} a ${currentPort}`);
    console.log('Esto puede causar problemas de CORS si Supabase tenía configurado el puerto anterior');
    return true;
  }
  
  localStorage.setItem('dev_server_port', currentPort);
  return false;
};