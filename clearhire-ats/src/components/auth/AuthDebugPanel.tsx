/**
 * Panel de debug para autenticación
 */
import React, { useState, useEffect } from 'react';
import { authService, type AuthUser } from '../../services/authService';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AuthDebugPanel: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('test@clearhire.com');
  const [password, setPassword] = useState('test123456');

  useEffect(() => {
    setLoading(true);
    
    // Escuchar cambios de autenticación
    const unsubscribe = authService.onAuthStateChange((authUser) => {
      setUser(authUser);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      setConnecting(true);
      setError(null);
      const result = await authService.signIn(email, password);
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setConnecting(false);
    }
  };

  const handleCreateAnonymous = async () => {
    try {
      setConnecting(true);
      setError(null);
      await authService.refreshSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando usuario anónimo');
    } finally {
      setConnecting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar sesión');
    }
  };

  const handleRefresh = async () => {
    try {
      await authService.refreshSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error refrescando sesión');
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <h3 className="font-semibold text-yellow-800">Modo Mock</h3>
        <p className="text-yellow-700 text-sm">Supabase no configurado. Usando datos de prueba.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-gray-600">Cargando estado de autenticación...</p>
      </div>
    );
  }

  if (connecting) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-blue-700">Conectando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800">Estado de Autenticación</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {user ? (
        <div className="space-y-3">
          <div className={`p-3 border rounded ${user.isMock ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
            <p className={`font-semibold ${user.isMock ? 'text-yellow-800' : 'text-green-800'}`}>
              {user.isMock ? '📦 Modo Mock' : '✅ Autenticado'}
            </p>
            <p className={user.isMock ? 'text-yellow-700' : 'text-green-700'}>
              {user.email || 'Sin email'}
            </p>
            <p className={`text-sm ${user.isMock ? 'text-yellow-600' : 'text-green-600'}`}>
              ID: {user.id}
            </p>
            <p className={`text-xs ${user.isMock ? 'text-yellow-500' : 'text-green-500'}`}>
              Modo: {user.isMock ? 'Mock/Local' : 'Supabase'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Salir
            </button>
            <button
              onClick={handleRefresh}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Refrescar
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="font-semibold text-red-800">❌ No autenticado</p>
            <p className="text-red-700">Los cambios no se guardarán en Supabase</p>
          </div>
          
          <div className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleLogin}
              className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Login
            </button>
            <button
              onClick={handleCreateAnonymous}
              className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Usuario Anónimo
            </button>
            <button
              onClick={handleRefresh}
              className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
            >
              Refrescar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};