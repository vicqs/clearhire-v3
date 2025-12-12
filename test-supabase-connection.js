// Test de conectividad directa a Supabase
// Ejecutar en consola del navegador o como script Node.js

const SUPABASE_URL = 'https://vzcuumrnilzeufizyfei.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Nzg1MzYsImV4cCI6MjA4MDQ1NDUzNn0.75eJJ1fxDaL4eRiyoQ_-EOdNTGV61uwQHqbuYS8rx9A';

console.log('🧪 Iniciando tests de conectividad Supabase...');

// Test 1: Verificar JWT
console.log('\n1. 🔑 Verificando JWT...');
try {
  const payload = JSON.parse(atob(SUPABASE_PUBLISHABLE_KEY.split('.')[1]));
  console.log('✅ JWT válido:');
  console.log('  - Proyecto:', payload.ref);
  console.log('  - Rol:', payload.role);
  console.log('  - Expira:', new Date(payload.exp * 1000).toLocaleString());
  console.log('  - ¿Expirado?:', payload.exp * 1000 < Date.now() ? '❌ SÍ' : '✅ NO');
} catch (error) {
  console.error('❌ Error decodificando JWT:', error);
}

// Test 2: Conectividad básica
console.log('\n2. 🌐 Test de conectividad básica...');
fetch(SUPABASE_URL + '/rest/v1/', {
  method: 'HEAD',
  headers: {
    'apikey': SUPABASE_PUBLISHABLE_KEY,
    'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
  }
})
  .then(response => {
    console.log(`✅ Conectividad: ${response.status} ${response.statusText}`);
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
  })
  .catch(error => {
    console.error('❌ Error de conectividad:', error.message);

    if (error.message.includes('CORS')) {
      console.log('💡 Posible solución: Verificar configuración de CORS en Supabase');
    } else if (error.message.includes('Failed to fetch')) {
      console.log('💡 Posible solución: Verificar que el proyecto esté activo');
    }
  });

// Test 3: API REST
console.log('\n3. 📡 Test de API REST...');
fetch(SUPABASE_URL + '/rest/v1/', {
  headers: {
    'apikey': SUPABASE_PUBLISHABLE_KEY,
    'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
    'Content-Type': 'application/json'
  }
})
  .then(response => {
    console.log(`✅ API REST: ${response.status} ${response.statusText}`);
    return response.text();
  })
  .then(text => {
    console.log('  - Respuesta:', text.substring(0, 100) + '...');
  })
  .catch(error => {
    console.error('❌ Error en API REST:', error.message);
  });

// Test 4: Autenticación
console.log('\n4. 🔐 Test de autenticación...');
fetch(SUPABASE_URL + '/auth/v1/health', {
  headers: {
    'apikey': SUPABASE_PUBLISHABLE_KEY
  }
})
  .then(response => {
    console.log(`✅ Auth Health: ${response.status} ${response.statusText}`);
    return response.json();
  })
  .then(data => {
    console.log('  - Health data:', data);
  })
  .catch(error => {
    console.error('❌ Error en auth health:', error.message);
  });

// Test 5: Información del entorno
console.log('\n5. 🌍 Información del entorno:');
// console.log('  - User Agent:', navigator.userAgent); // navigator not available in Node
// console.log('  - URL actual:', window.location.href); // window not available in Node
// console.log('  - Protocolo:', window.location.protocol);
// console.log('  - Host:', window.location.host);

console.log('\n🏁 Tests completados. Revisa los resultados arriba.');