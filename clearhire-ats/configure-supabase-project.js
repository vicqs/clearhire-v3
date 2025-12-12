// Script para configurar el proyecto Supabase automáticamente
// Ejecutar en consola del navegador

const ACCESS_TOKEN = 'sbp_14eb4bb4962d2d160b19f77cde281701d1b47a43';
const PROJECT_REF = 'vzcuumrnilzeufizyfei';

console.log('🔧 Configurando proyecto Supabase automáticamente...');

// Función para hacer requests a la API de Supabase
async function supabaseAPI(endpoint, method = 'GET', body = null) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : null
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// 1. Verificar configuración actual
console.log('\n1. 📋 Verificando configuración actual...');
try {
  const config = await supabaseAPI('/config');
  console.log('✅ Configuración actual:', config);
} catch (error) {
  console.log('⚠️ No se pudo obtener configuración:', error.message);
}

// 2. Configurar Site URL para desarrollo
console.log('\n2. 🌐 Configurando Site URL...');
try {
  const authConfig = {
    site_url: 'http://localhost:3000',
    redirect_urls: [
      'http://localhost:3000/**',
      'http://localhost:5173/**',
      'http://localhost:5175/**'
    ]
  };
  
  const result = await supabaseAPI('/config/auth', 'PATCH', authConfig);
  console.log('✅ Site URL configurada:', result);
} catch (error) {
  console.log('⚠️ Error configurando Site URL:', error.message);
}

// 3. Verificar configuración de CORS
console.log('\n3. 🔒 Verificando configuración de CORS...');
try {
  const corsConfig = await supabaseAPI('/config/cors');
  console.log('✅ Configuración CORS:', corsConfig);
} catch (error) {
  console.log('⚠️ Error obteniendo CORS:', error.message);
}

// 4. Test de conectividad después de configuración
console.log('\n4. 🧪 Probando conectividad después de configuración...');
setTimeout(async () => {
  try {
    const response = await fetch('https://vzcuumrnilzeufizyfei.supabase.co/rest/v1/', {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Nzg1MzYsImV4cCI6MjA4MDQ1NDUzNn0.75eJJ1fxDaL4eRiyoQ_-EOdNTGV61uwQHqbuYS8rx9A'
      }
    });
    
    console.log(`✅ Test de conectividad: ${response.status} ${response.statusText}`);
    
    if (response.status === 200 || response.status === 401) {
      console.log('🎉 ¡Proyecto configurado correctamente!');
      console.log('💡 Ahora puedes activar Supabase en tu .env: VITE_USE_SUPABASE=true');
    } else if (response.status === 403) {
      console.log('⚠️ Sigue dando 403. Puede necesitar más configuración.');
    }
    
  } catch (error) {
    console.log('❌ Error en test de conectividad:', error.message);
  }
}, 2000);

console.log('\n🏁 Configuración completada. Esperando 2 segundos para test final...');