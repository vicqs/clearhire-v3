import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Hook personalizado para verificar y usar la conexión a Supabase
 */
export const useSupabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        
        if (!isSupabaseConfigured()) {
          setError('Supabase no está configurado. Usando datos mock.');
          setIsConnected(false);
          setIsLoading(false);
          return;
        }

        // Intentar hacer una consulta simple para verificar la conexión
        const { error: connectionError } = await supabase!
          .from('profiles')
          .select('count')
          .limit(1);

        if (connectionError) {
          // Si la tabla no existe aún, no es un error crítico
          if (connectionError.code === '42P01') {
            console.warn('⚠️ Tablas de Supabase no creadas aún. Ejecuta el SQL del archivo docs/SUPABASE_INTEGRATION_GUIDE.md');
            setError('Tablas no creadas. Ver documentación.');
          } else {
            console.error('Error conectando a Supabase:', connectionError);
            setError(connectionError.message);
          }
          setIsConnected(false);
        } else {
          console.log('✅ Conexión a Supabase exitosa');
          setIsConnected(true);
          setError(null);
        }
      } catch (err) {
        console.error('Error verificando conexión:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  return {
    supabase,
    isConnected,
    isLoading,
    error,
    isConfigured: isSupabaseConfigured(),
  };
};
