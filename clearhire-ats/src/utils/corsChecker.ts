/**
 * Verificador de problemas de CORS específicos
 */

export const checkCORSIssues = async (supabaseUrl: string) => {
  const currentOrigin = window.location.origin;
  const currentPort = window.location.port;
  
  console.group('🔍 Análisis de CORS');
  console.log('Origin actual:', currentOrigin);
  console.log('Puerto actual:', currentPort);
  
  // Verificar si el proyecto responde desde diferentes orígenes
  const testOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
    currentOrigin
  ];
  
  const results = [];
  
  for (const origin of testOrigins) {
    try {
      console.log(`Probando desde: ${origin}`);
      
      // Simular request desde diferentes orígenes
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'Origin': origin,
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
        }
      });
      
      results.push({
        origin,
        status: response.status,
        success: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
    } catch (error: any) {
      results.push({
        origin,
        status: 'ERROR',
        success: false,
        error: error.message
      });
    }
  }
  
  console.table(results);
  console.groupEnd();
  
  return results;
};

export const getSupabaseCORSConfig = () => {
  const currentOrigin = window.location.origin;
  
  return {
    siteURL: currentOrigin,
    redirectURLs: [
      `${currentOrigin}/**`,
      'http://localhost:3000/**',
      'http://localhost:5173/**',
      'http://localhost:5174/**',
      'http://localhost:5175/**'
    ],
    instructions: `
Para configurar CORS en Supabase:

1. Ve a tu proyecto en https://supabase.com
2. Ve a Authentication → Settings
3. En "Site URL" pon: ${currentOrigin}
4. En "Redirect URLs" agrega:
   ${currentOrigin}/**
   http://localhost:3000/**
   http://localhost:5173/**
   http://localhost:5174/**
   http://localhost:5175/**
5. Guarda los cambios
6. Espera 1-2 minutos para que se apliquen
    `
  };
};

export const diagnosePortChange = () => {
  const currentPort = window.location.port;
  const savedPorts = JSON.parse(localStorage.getItem('dev_ports_history') || '[]');
  
  if (!savedPorts.includes(currentPort)) {
    savedPorts.push(currentPort);
    localStorage.setItem('dev_ports_history', JSON.stringify(savedPorts));
  }
  
  console.group('🔌 Análisis de Cambio de Puerto');
  console.log('Puerto actual:', currentPort);
  console.log('Puertos usados anteriormente:', savedPorts);
  
  if (savedPorts.length > 1) {
    console.warn('⚠️ Se detectaron múltiples puertos usados:');
    console.log('Esto puede causar problemas de CORS si Supabase solo tiene configurado un puerto específico');
    console.log('Recomendación: Configurar todos los puertos en Supabase o usar siempre el mismo puerto');
  }
  
  console.groupEnd();
  
  return {
    currentPort,
    previousPorts: savedPorts,
    hasChanged: savedPorts.length > 1
  };
};