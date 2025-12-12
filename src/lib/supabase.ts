import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno existan
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Using mock data.');
} else {
  console.log('✅ Supabase configured successfully');
}

// Crear cliente de Supabase (solo si las credenciales existen)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // Deshabilitar para evitar redirects en CORS
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'clearhire-auth',
      flowType: 'pkce' // Usar PKCE flow para mejor seguridad sin redirects
    },
    global: {
      headers: {
        'X-Client-Info': 'clearhire-ats@1.0.0'
      }
    }
  })
  : null;

// Helper para verificar si Supabase está configurado
export const isSupabaseConfigured = () => {
  // En desarrollo, permitir desactivar Supabase fácilmente
  if (import.meta.env.DEV && import.meta.env.VITE_USE_SUPABASE !== 'true') {
    return false;
  }
  return !!supabase && !!supabaseUrl && !!supabaseAnonKey;
};

// Exportar por defecto también para compatibilidad
export default supabase;
