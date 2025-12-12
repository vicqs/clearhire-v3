import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Métricas personalizadas
const errorRate = new Rate('errors');
const profileLoadTime = new Trend('profile_load_time');
const profileSaveTime = new Trend('profile_save_time');

// Configuración de la prueba
export const options = {
  stages: [
    // Ramp-up: incrementar usuarios gradualmente
    { duration: '2m', target: 10 },   // 0 a 10 usuarios en 2 minutos
    { duration: '5m', target: 10 },   // Mantener 10 usuarios por 5 minutos
    { duration: '2m', target: 20 },   // Incrementar a 20 usuarios en 2 minutos
    { duration: '5m', target: 20 },   // Mantener 20 usuarios por 5 minutos
    { duration: '2m', target: 50 },   // Incrementar a 50 usuarios en 2 minutos
    { duration: '5m', target: 50 },   // Mantener 50 usuarios por 5 minutos
    { duration: '2m', target: 0 },    // Ramp-down a 0 usuarios
  ],
  thresholds: {
    // Criterios de éxito
    http_req_duration: ['p(95)<2000'], // 95% de requests < 2s
    http_req_failed: ['rate<0.05'],    // Tasa de error < 5%
    errors: ['rate<0.05'],             // Tasa de errores personalizados < 5%
    profile_load_time: ['p(95)<1500'], // 95% de cargas de perfil < 1.5s
    profile_save_time: ['p(95)<3000'], // 95% de guardados < 3s
  },
};

// Configuración del entorno
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';
const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://vzcuumrnilzeufizyfei.supabase.co';
const SUPABASE_KEY = __ENV.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Nzg1MzYsImV4cCI6MjA4MDQ1NDUzNn0.75eJJ1fxDaL4eRiyoQ_-EOdNTGV61uwQHqbuYS8rx9A';

// Datos de prueba
const testUsers = [
  { email: 'load-test-1@clearhire.com', password: 'test123456' },
  { email: 'load-test-2@clearhire.com', password: 'test123456' },
  { email: 'load-test-3@clearhire.com', password: 'test123456' },
  { email: 'load-test-4@clearhire.com', password: 'test123456' },
  { email: 'load-test-5@clearhire.com', password: 'test123456' },
];

const sampleProfile = {
  first_name: 'Load',
  last_name: 'Test',
  email: 'loadtest@clearhire.com',
  phone: '+52 55 1234 5678',
  country: 'México',
  trade: 'Load Testing',
};

// Función de setup (ejecutada una vez)
export function setup() {
  console.log('🚀 Iniciando pruebas de carga para ClearHire ATS');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`🗄️ Supabase URL: ${SUPABASE_URL}`);
  
  // Verificar que la aplicación esté disponible
  const healthCheck = http.get(BASE_URL);
  check(healthCheck, {
    'Application is available': (r) => r.status === 200,
  });
  
  return { baseUrl: BASE_URL, supabaseUrl: SUPABASE_URL };
}

// Función principal de prueba
export default function (data) {
  const userIndex = __VU % testUsers.length;
  const user = testUsers[userIndex];
  
  // Simular flujo de usuario completo
  userJourney(data, user);
  
  // Pausa entre iteraciones (simular tiempo de reflexión del usuario)
  sleep(Math.random() * 3 + 1); // 1-4 segundos
}

function userJourney(data, user) {
  // 1. Cargar página principal
  loadHomePage(data.baseUrl);
  
  // 2. Autenticación
  const authToken = authenticateUser(data.supabaseUrl, user);
  
  if (authToken) {
    // 3. Cargar perfil
    loadProfile(data.supabaseUrl, authToken);
    
    // 4. Actualizar perfil
    updateProfile(data.supabaseUrl, authToken, user);
    
    // 5. Cargar aplicaciones
    loadApplications(data.supabaseUrl, authToken);
  }
}

function loadHomePage(baseUrl) {
  const response = http.get(baseUrl);
  
  check(response, {
    'Home page loaded': (r) => r.status === 200,
    'Home page has content': (r) => r.body.includes('ClearHire') || r.body.includes('<!DOCTYPE html>'),
  }) || errorRate.add(1);
  
  sleep(0.5);
}

function authenticateUser(supabaseUrl, user) {
  const authPayload = {
    email: user.email,
    password: user.password,
  };
  
  const authResponse = http.post(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    JSON.stringify(authPayload),
    {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
      },
    }
  );
  
  const authSuccess = check(authResponse, {
    'Authentication successful': (r) => r.status === 200,
    'Auth token received': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.access_token !== undefined;
      } catch {
        return false;
      }
    },
  });
  
  if (!authSuccess) {
    errorRate.add(1);
    return null;
  }
  
  try {
    const authData = JSON.parse(authResponse.body);
    return authData.access_token;
  } catch {
    errorRate.add(1);
    return null;
  }
}

function loadProfile(supabaseUrl, authToken) {
  const startTime = Date.now();
  
  const profileResponse = http.get(
    `${supabaseUrl}/rest/v1/profiles?select=*`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const loadTime = Date.now() - startTime;
  profileLoadTime.add(loadTime);
  
  check(profileResponse, {
    'Profile loaded successfully': (r) => r.status === 200,
    'Profile data is valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  
  sleep(0.3);
}

function updateProfile(supabaseUrl, authToken, user) {
  const startTime = Date.now();
  
  const updatePayload = {
    ...sampleProfile,
    email: user.email,
    first_name: `LoadTest-${__VU}`,
    updated_at: new Date().toISOString(),
  };
  
  const updateResponse = http.patch(
    `${supabaseUrl}/rest/v1/profiles`,
    JSON.stringify(updatePayload),
    {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
    }
  );
  
  const saveTime = Date.now() - startTime;
  profileSaveTime.add(saveTime);
  
  check(updateResponse, {
    'Profile updated successfully': (r) => r.status === 200 || r.status === 204,
  }) || errorRate.add(1);
  
  sleep(0.5);
}

function loadApplications(supabaseUrl, authToken) {
  const applicationsResponse = http.get(
    `${supabaseUrl}/rest/v1/applications?select=*`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  
  check(applicationsResponse, {
    'Applications loaded': (r) => r.status === 200,
    'Applications data is array': (r) => {
      try {
        const data = JSON.parse(r.body);
        return Array.isArray(data);
      } catch {
        return false;
      }
    },
  }) || errorRate.add(1);
  
  sleep(0.2);
}

// Función de teardown (ejecutada una vez al final)
export function teardown(data) {
  console.log('🏁 Pruebas de carga completadas');
  console.log('📊 Revisa los resultados para métricas detalladas');
}

// Escenarios adicionales para diferentes tipos de prueba
export const stressTest = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '5m', target: 100 },  // Ramp up to 100 users
    { duration: '10m', target: 100 }, // Stay at 100 users
    { duration: '5m', target: 200 },  // Ramp up to 200 users
    { duration: '10m', target: 200 }, // Stay at 200 users
    { duration: '5m', target: 0 },    // Ramp down
  ],
};

export const spikeTest = {
  executor: 'ramping-vus',
  startVUs: 0,
  stages: [
    { duration: '2m', target: 10 },   // Normal load
    { duration: '1m', target: 100 },  // Spike to 100 users
    { duration: '2m', target: 100 },  // Maintain spike
    { duration: '1m', target: 10 },   // Return to normal
    { duration: '2m', target: 10 },   // Maintain normal
  ],
};