/**
 * Utilidad para probar la conexión a Supabase
 * Ejecuta esto en la consola del navegador para diagnosticar problemas
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

export async function testSupabaseConnection() {
  console.log('🔍 Probando conexión a Supabase...\n');

  // 1. Verificar variables de entorno
  console.log('📋 Variables de entorno:');
  console.log('  VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('  VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Configurada' : '❌ No configurada');
  console.log('  VITE_USE_SUPABASE:', import.meta.env.VITE_USE_SUPABASE);
  console.log('');

  // 2. Verificar si está configurado
  console.log('🔧 Estado de configuración:');
  console.log('  isSupabaseConfigured():', isSupabaseConfigured() ? '✅ Sí' : '❌ No');
  console.log('  Cliente creado:', supabase ? '✅ Sí' : '❌ No');
  console.log('');

  if (!isSupabaseConfigured() || !supabase) {
    console.log('❌ Supabase no está configurado correctamente');
    console.log('');
    console.log('📝 Pasos para configurar:');
    console.log('1. Ve a https://app.supabase.com');
    console.log('2. Settings → API');
    console.log('3. Copia la "anon public" key (empieza con eyJ...)');
    console.log('4. Actualiza .env con VITE_SUPABASE_PUBLISHABLE_KEY');
    console.log('5. Reinicia el servidor (npm run dev)');
    return;
  }

  // 3. Probar conexión básica
  console.log('🌐 Probando conexión...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.log('❌ Error de conexión:', error.message);
      console.log('');
      
      if (error.message.includes('Invalid API key')) {
        console.log('🔑 La API key es inválida');
        console.log('');
        console.log('Verifica que estés usando la clave correcta:');
        console.log('✅ Debe empezar con: eyJ...');
        console.log('❌ NO debe empezar con: sb_publishable_...');
        console.log('');
        console.log('Pasos:');
        console.log('1. Ve a Supabase Dashboard → Settings → API');
        console.log('2. Copia la clave "anon public"');
        console.log('3. Actualiza VITE_SUPABASE_PUBLISHABLE_KEY en .env');
        console.log('4. Reinicia el servidor');
      } else if (error.code === '42P01') {
        console.log('📊 Las tablas no existen en Supabase');
        console.log('');
        console.log('Pasos:');
        console.log('1. Abre scripts/database-schema.sql');
        console.log('2. Copia TODO el contenido');
        console.log('3. Ve a Supabase → SQL Editor');
        console.log('4. Pega y ejecuta el SQL');
      } else {
        console.log('Error desconocido. Detalles:', error);
      }
    } else {
      console.log('✅ Conexión exitosa!');
      console.log('');
      console.log('🎉 Supabase está funcionando correctamente');
      console.log('');
      console.log('Puedes:');
      console.log('- Guardar perfiles');
      console.log('- Crear aplicaciones');
      console.log('- Consultar datos reales');
    }
  } catch (err) {
    console.log('❌ Error inesperado:', err);
  }
}

// Exportar para uso en consola
(window as any).testSupabaseConnection = testSupabaseConnection;

console.log('💡 Ejecuta testSupabaseConnection() en la consola para probar la conexión');
