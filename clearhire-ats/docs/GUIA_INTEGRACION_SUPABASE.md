# 🔌 Guía de Integración con Supabase

## ✅ Estado Actual

- ✅ Tablas creadas en Supabase (21 tablas)
- ✅ Servicios de integración creados
- ✅ Hooks personalizados listos
- ✅ Fallback a mock data automático

---

## 📁 Archivos Creados

### Servicios
1. **`src/services/supabase/profileService.ts`**
   - Gestión completa de perfiles
   - CRUD de experiencia, educación, idiomas, etc.
   - Fallback automático a mock data

2. **`src/services/supabase/applicationService.ts`**
   - Gestión de aplicaciones a trabajos
   - Seguimiento de etapas
   - Recomendaciones y feedback

### Hooks
3. **`src/hooks/useProfile.ts`**
   - Hook para usar perfiles en componentes
   - Auto-carga y auto-guardado
   - Manejo de estados (loading, error, saving)

---

## 🚀 Cómo Usar en tus Componentes

### Ejemplo 1: Usar Perfil en un Componente

```typescript
import { useProfile } from '../hooks/useProfile';

function ProfilePage() {
  const { profile, loading, saving, saveProfile, updateField } = useProfile();

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  if (!profile) {
    return <div>No se encontró perfil</div>;
  }

  const handleSave = async () => {
    const updatedProfile = {
      ...profile,
      personalInfo: {
        ...profile.personalInfo,
        firstName: 'Nuevo Nombre',
      },
    };

    await saveProfile(updatedProfile);
  };

  return (
    <div>
      <h1>{profile.personalInfo.firstName} {profile.personalInfo.lastName}</h1>
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  );
}
```

### Ejemplo 2: Actualizar Campo Específico

```typescript
import { useProfile } from '../hooks/useProfile';

function EditNameForm() {
  const { profile, updateField, saving } = useProfile();
  const [name, setName] = useState(profile?.personalInfo.firstName || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateField('personalInfo', {
      ...profile!.personalInfo,
      firstName: name,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit" disabled={saving}>
        Guardar
      </button>
    </form>
  );
}
```

### Ejemplo 3: Usar Aplicaciones

```typescript
import { useState, useEffect } from 'react';
import { applicationService } from '../services/supabase/applicationService';
import type { Application } from '../types/application';

function ApplicationsList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await applicationService.getApplications('candidate-id');
      setApplications(apps);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      {applications.map(app => (
        <div key={app.id}>
          <h3>{app.position} en {app.company}</h3>
          <p>Estado: {app.status}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔄 Modo Híbrido (Mock + Supabase)

La aplicación funciona en **modo híbrido**:

### ✅ Con Supabase Configurado
- Lee y escribe datos reales en Supabase
- Persistencia entre sesiones
- Datos compartidos entre dispositivos

### ✅ Sin Supabase (Mock Mode)
- Usa datos mock automáticamente
- No requiere configuración
- Perfecto para desarrollo y demos

### Detección Automática

```typescript
import { isSupabaseConfigured } from '../lib/supabase';

if (isSupabaseConfigured()) {
  console.log('✅ Usando Supabase');
  // Guardar en base de datos
} else {
  console.log('📦 Usando mock data');
  // Solo actualizar estado local
}
```

---

## 📝 Próximos Pasos para Integración Completa

### 1. Actualizar Componentes Existentes

Reemplaza el uso directo de mock data con los nuevos servicios:

**Antes:**
```typescript
import { mockProfile } from '../services/mock/mockData';

function Component() {
  const profile = mockProfile;
  // ...
}
```

**Después:**
```typescript
import { useProfile } from '../hooks/useProfile';

function Component() {
  const { profile, loading } = useProfile();
  // ...
}
```

### 2. Crear Hooks Adicionales

Puedes crear hooks similares para otras entidades:

- `useApplications()` - Para aplicaciones
- `useOffers()` - Para ofertas de trabajo
- `useBadges()` - Para gamificación
- `useNotifications()` - Para notificaciones

### 3. Implementar Autenticación

Para usar Supabase completamente, necesitas autenticación:

```typescript
// src/services/supabase/authService.ts
import { supabase } from '../../lib/supabase';

export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase!.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase!.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase!.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase!.auth.getUser();
    return user;
  },
};
```

### 4. Crear Páginas de Login/Registro

```typescript
// src/pages/Login.tsx
import { useState } from 'react';
import { authService } from '../services/supabase/authService';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.signIn(email, password);
      // Redirigir al dashboard
    } catch (error) {
      console.error('Error de login:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input 
        type="email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
      />
      <button type="submit">Iniciar Sesión</button>
    </form>
  );
}
```

---

## 🎯 Ventajas de Esta Integración

### ✅ Gradual
- No necesitas cambiar todo de una vez
- Puedes migrar componente por componente
- Mock data sigue funcionando

### ✅ Segura
- Fallback automático si Supabase falla
- Manejo de errores incluido
- No rompe la aplicación

### ✅ Flexible
- Funciona con o sin autenticación
- Funciona con o sin Supabase configurado
- Fácil de testear

### ✅ Completa
- CRUD completo para perfiles
- Relaciones entre tablas manejadas
- Optimizada con queries eficientes

---

## 🔧 Configuración Actual

Tu aplicación ya tiene:
- ✅ Cliente de Supabase configurado (`src/lib/supabase.ts`)
- ✅ Variables de entorno configuradas (`.env`)
- ✅ Indicador de conexión (`SupabaseStatus.tsx`)
- ✅ Hook de verificación (`useSupabase.ts`)

---

## 📊 Ejemplo Completo: Migrar Página de Perfil

### Antes (Solo Mock)

```typescript
import { mockProfile } from '../services/mock/mockData';

function ProfilePage() {
  const [profile, setProfile] = useState(mockProfile);

  const handleSave = () => {
    console.log('Guardado (solo local):', profile);
  };

  return (
    <div>
      <input 
        value={profile.personalInfo.firstName}
        onChange={(e) => setProfile({
          ...profile,
          personalInfo: {
            ...profile.personalInfo,
            firstName: e.target.value,
          }
        })}
      />
      <button onClick={handleSave}>Guardar</button>
    </div>
  );
}
```

### Después (Con Supabase)

```typescript
import { useProfile } from '../hooks/useProfile';

function ProfilePage() {
  const { profile, loading, saving, saveProfile } = useProfile();
  const [localProfile, setLocalProfile] = useState(profile);

  useEffect(() => {
    if (profile) setLocalProfile(profile);
  }, [profile]);

  const handleSave = async () => {
    if (!localProfile) return;
    
    try {
      await saveProfile(localProfile);
      alert('✅ Perfil guardado en Supabase');
    } catch (error) {
      alert('❌ Error guardando perfil');
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!localProfile) return <div>No hay perfil</div>;

  return (
    <div>
      <input 
        value={localProfile.personalInfo.firstName}
        onChange={(e) => setLocalProfile({
          ...localProfile,
          personalInfo: {
            ...localProfile.personalInfo,
            firstName: e.target.value,
          }
        })}
      />
      <button onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando...' : 'Guardar en Supabase'}
      </button>
    </div>
  );
}
```

---

## 🎉 ¡Listo para Usar!

Tu aplicación ahora puede:
- ✅ Guardar perfiles en Supabase
- ✅ Consultar datos reales
- ✅ Funcionar sin Supabase (mock mode)
- ✅ Manejar errores automáticamente

**Empieza a usar los servicios en tus componentes y verás los datos guardándose en Supabase.** 🚀
