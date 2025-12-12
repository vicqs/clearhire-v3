# Guía de Integración con Supabase

## 📋 Tabla de Contenidos
1. [Configuración Inicial](#configuración-inicial)
2. [Instalación](#instalación)
3. [Estructura de Base de Datos](#estructura-de-base-de-datos)
4. [Configuración del Cliente](#configuración-del-cliente)
5. [Servicios y Hooks](#servicios-y-hooks)
6. [Autenticación](#autenticación)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [Migración desde Mock Data](#migración-desde-mock-data)

---

## 🚀 Configuración Inicial

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Guarda las credenciales:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

⚠️ **Importante:** Agrega `.env` a tu `.gitignore`

```gitignore
# Environment variables
.env
.env.local
.env.production
```

---

## 📦 Instalación

```bash
npm install @supabase/supabase-js
```

O con yarn:

```bash
yarn add @supabase/supabase-js
```

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales

#### 1. **profiles** (Perfiles de Candidatos)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  country TEXT,
  city TEXT,
  address TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  trade TEXT,
  profile_picture_url TEXT,
  cv_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

#### 2. **experiences** (Experiencia Laboral)

```sql
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_experiences_profile_id ON experiences(profile_id);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own experiences"
  ON experiences FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

#### 3. **education** (Educación)

```sql
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_education_profile_id ON education(profile_id);

ALTER TABLE education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own education"
  ON education FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

#### 4. **languages** (Idiomas)

```sql
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  proficiency TEXT NOT NULL CHECK (proficiency IN ('basic', 'intermediate', 'advanced', 'native')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_languages_profile_id ON languages(profile_id);

ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own languages"
  ON languages FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

#### 5. **soft_skills** (Habilidades Blandas)

```sql
CREATE TABLE soft_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_soft_skills_profile_id ON soft_skills(profile_id);

ALTER TABLE soft_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own soft_skills"
  ON soft_skills FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

#### 6. **references** (Referencias)

```sql
CREATE TABLE references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_references_profile_id ON references(profile_id);

ALTER TABLE references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own references"
  ON references FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

#### 7. **job_offers** (Ofertas de Trabajo)

```sql
CREATE TABLE job_offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position_title TEXT NOT NULL,
  fixed_salary DECIMAL(12, 2),
  salary_min DECIMAL(12, 2),
  salary_max DECIMAL(12, 2),
  currency TEXT NOT NULL DEFAULT 'CRC',
  country TEXT NOT NULL DEFAULT 'CR',
  offer_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'negotiating', 'expired')),
  negotiation_notes TEXT,
  awaiting_candidate_response BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_job_offers_profile_id ON job_offers(profile_id);
CREATE INDEX idx_job_offers_status ON job_offers(status);

ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own job_offers"
  ON job_offers FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

#### 8. **offer_benefits** (Beneficios de Ofertas)

```sql
CREATE TABLE offer_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID REFERENCES job_offers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_value DECIMAL(12, 2),
  currency TEXT NOT NULL DEFAULT 'CRC',
  description TEXT,
  is_percentage BOOLEAN DEFAULT FALSE,
  percentage_value DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_offer_benefits_offer_id ON offer_benefits(offer_id);

ALTER TABLE offer_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage benefits of own offers"
  ON offer_benefits FOR ALL
  USING (
    offer_id IN (
      SELECT id FROM job_offers WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );
```

#### 9. **negotiation_messages** (Mensajes de Negociación)

```sql
CREATE TABLE negotiation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id UUID REFERENCES job_offers(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('candidate', 'company')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_negotiation_messages_offer_id ON negotiation_messages(offer_id);
CREATE INDEX idx_negotiation_messages_created_at ON negotiation_messages(created_at);

ALTER TABLE negotiation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage messages of own offers"
  ON negotiation_messages FOR ALL
  USING (
    offer_id IN (
      SELECT id FROM job_offers WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );
```

#### 10. **applications** (Aplicaciones a Trabajos)

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  position_title TEXT NOT NULL,
  application_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('applied', 'reviewing', 'interview', 'offer', 'rejected', 'withdrawn')),
  notes TEXT,
  job_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_applications_profile_id ON applications(profile_id);
CREATE INDEX idx_applications_status ON applications(status);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own applications"
  ON applications FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );
```

---

## ⚙️ Configuración del Cliente

### Archivo: `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
```

### Tipos TypeScript

Genera los tipos automáticamente desde tu base de datos:

```bash
npx supabase gen types typescript --project-id "tu-project-id" > src/types/supabase.ts
```

O crea manualmente: `src/types/supabase.ts`

```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          country: string | null
          city: string | null
          address: string | null
          linkedin_url: string | null
          github_url: string | null
          portfolio_url: string | null
          trade: string | null
          profile_picture_url: string | null
          cv_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          country?: string | null
          city?: string | null
          address?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          trade?: string | null
          profile_picture_url?: string | null
          cv_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          country?: string | null
          city?: string | null
          address?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          trade?: string | null
          profile_picture_url?: string | null
          cv_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // ... más tablas
    }
  }
}
```

---

## 🔧 Servicios y Hooks

### Servicio de Perfil: `src/services/profileService.ts`

```typescript
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/profile';

export const profileService = {
  // Obtener perfil del usuario actual
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        experiences (*),
        education (*),
        languages (*),
        soft_skills (*),
        references (*)
      `)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return this.mapToProfile(data);
  },

  // Actualizar perfil
  async updateProfile(profile: Partial<Profile>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('No authenticated user');

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: profile.personalInfo?.firstName,
        last_name: profile.personalInfo?.lastName,
        email: profile.personalInfo?.email,
        phone: profile.personalInfo?.phone,
        country: profile.personalInfo?.country,
        city: profile.personalInfo?.city,
        address: profile.personalInfo?.address,
        linkedin_url: profile.personalInfo?.linkedinUrl,
        github_url: profile.personalInfo?.githubUrl,
        portfolio_url: profile.personalInfo?.portfolioUrl,
        trade: profile.trade,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Agregar experiencia
  async addExperience(profileId: string, experience: any): Promise<void> {
    const { error } = await supabase
      .from('experiences')
      .insert({
        profile_id: profileId,
        company_name: experience.companyName,
        position: experience.position,
        start_date: experience.startDate,
        end_date: experience.endDate,
        is_current: experience.isCurrent,
        description: experience.description,
        location: experience.location,
      });

    if (error) throw error;
  },

  // Actualizar experiencia
  async updateExperience(experienceId: string, experience: any): Promise<void> {
    const { error } = await supabase
      .from('experiences')
      .update({
        company_name: experience.companyName,
        position: experience.position,
        start_date: experience.startDate,
        end_date: experience.endDate,
        is_current: experience.isCurrent,
        description: experience.description,
        location: experience.location,
        updated_at: new Date().toISOString(),
      })
      .eq('id', experienceId);

    if (error) throw error;
  },

  // Eliminar experiencia
  async deleteExperience(experienceId: string): Promise<void> {
    const { error } = await supabase
      .from('experiences')
      .delete()
      .eq('id', experienceId);

    if (error) throw error;
  },

  // Mapear datos de Supabase a tipo Profile
  mapToProfile(data: any): Profile {
    return {
      personalInfo: {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone || '',
        country: data.country || '',
        city: data.city || '',
        address: data.address || '',
        linkedinUrl: data.linkedin_url || '',
        githubUrl: data.github_url || '',
        portfolioUrl: data.portfolio_url || '',
      },
      experience: data.experiences?.map((exp: any) => ({
        id: exp.id,
        companyName: exp.company_name,
        position: exp.position,
        startDate: exp.start_date,
        endDate: exp.end_date,
        isCurrent: exp.is_current,
        description: exp.description,
        location: exp.location,
      })) || [],
      education: data.education?.map((edu: any) => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.field_of_study,
        startDate: edu.start_date,
        endDate: edu.end_date,
        isCurrent: edu.is_current,
        description: edu.description,
      })) || [],
      languages: data.languages?.map((lang: any) => ({
        id: lang.id,
        language: lang.language,
        proficiency: lang.proficiency,
      })) || [],
      softSkills: data.soft_skills?.map((skill: any) => skill.skill) || [],
      trade: data.trade || '',
      references: data.references?.map((ref: any) => ({
        id: ref.id,
        name: ref.name,
        position: ref.position,
        company: ref.company,
        email: ref.email,
        phone: ref.phone,
        relationship: ref.relationship,
      })) || [],
    };
  },
};
```

### Hook de Perfil: `src/hooks/useProfile.ts`

```typescript
import { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import type { Profile } from '../types/profile';

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getCurrentProfile();
      setProfile(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      await profileService.updateProfile(updates);
      await loadProfile(); // Recargar perfil
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    reload: loadProfile,
  };
};
```

---

## 🔐 Autenticación

### Servicio de Auth: `src/services/authService.ts`

```typescript
import { supabase } from '../lib/supabase';

export const authService = {
  // Registro
  async signUp(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
        },
      },
    });

    if (error) throw error;

    // Crear perfil
    if (data.user) {
      await supabase.from('profiles').insert({
        user_id: data.user.id,
        email: email,
        first_name: userData.firstName,
        last_name: userData.lastName,
      });
    }

    return data;
  },

  // Login
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Obtener usuario actual
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Cambiar contraseña
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  // Recuperar contraseña
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },
};
```

### Hook de Auth: `src/hooks/useAuth.ts`

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
};
```

---

## 💡 Ejemplos de Uso

### En un Componente

```typescript
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '../hooks/useAuth';

function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const { profile, loading, updateProfile } = useProfile();

  if (!isAuthenticated) {
    return <div>Por favor inicia sesión</div>;
  }

  if (loading) {
    return <div>Cargando perfil...</div>;
  }

  const handleUpdate = async () => {
    await updateProfile({
      personalInfo: {
        ...profile.personalInfo,
        firstName: 'Nuevo Nombre',
      },
    });
  };

  return (
    <div>
      <h1>Perfil de {profile?.personalInfo.firstName}</h1>
      <button onClick={handleUpdate}>Actualizar</button>
    </div>
  );
}
```

### Real-time Subscriptions

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

function OffersPage() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    // Cargar ofertas iniciales
    loadOffers();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .channel('job_offers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'job_offers',
        },
        (payload) => {
          console.log('Change received!', payload);
          loadOffers(); // Recargar ofertas
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadOffers = async () => {
    const { data } = await supabase
      .from('job_offers')
      .select('*')
      .order('created_at', { ascending: false });
    
    setOffers(data || []);
  };

  return <div>{/* Renderizar ofertas */}</div>;
}
```

---

## 🔄 Migración desde Mock Data

### Paso 1: Mantener Compatibilidad

Crea un servicio que funcione con ambos (mock y Supabase):

```typescript
// src/services/dataService.ts
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

export const dataService = {
  async getProfile() {
    if (USE_SUPABASE) {
      return await profileService.getCurrentProfile();
    } else {
      return mockProfile;
    }
  },
  
  async updateProfile(profile: Profile) {
    if (USE_SUPABASE) {
      return await profileService.updateProfile(profile);
    } else {
      // Mock update
      console.log('Mock update:', profile);
    }
  },
};
```

### Paso 2: Migración Gradual

1. Implementa Supabase para una funcionalidad a la vez
2. Usa feature flags para activar/desactivar
3. Prueba exhaustivamente cada migración
4. Mantén los mocks como fallback

---

## 🛡️ Seguridad

### Row Level Security (RLS)

Supabase usa RLS para proteger datos. Asegúrate de:

1. ✅ Habilitar RLS en todas las tablas
2. ✅ Crear políticas apropiadas
3. ✅ Probar con diferentes usuarios
4. ✅ Nunca exponer la `service_role_key`

### Validación

```typescript
// Validar datos antes de guardar
const validateProfile = (profile: Profile) => {
  if (!profile.personalInfo.email) {
    throw new Error('Email es requerido');
  }
  
  if (!profile.personalInfo.firstName) {
    throw new Error('Nombre es requerido');
  }
  
  // Más validaciones...
};
```

---

## 📊 Storage (Archivos)

### Subir CV o Foto de Perfil

```typescript
export const storageService = {
  async uploadCV(file: File, userId: string) {
    const fileName = `${userId}/cv_${Date.now()}.pdf`;
    
    const { data, error } = await supabase.storage
      .from('cvs')
      .upload(fileName, file);

    if (error) throw error;

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('cvs')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async uploadProfilePicture(file: File, userId: string) {
    const fileName = `${userId}/profile_${Date.now()}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  },
};
```

---

## 🚀 Deployment

### Variables de Entorno en Producción

En Vercel, Netlify, etc.:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_USE_SUPABASE=true
```

---

## 📚 Recursos Adicionales

- [Documentación Oficial de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time](https://supabase.com/docs/guides/realtime)
- [Storage](https://supabase.com/docs/guides/storage)

---

## ✅ Checklist de Implementación

- [ ] Crear proyecto en Supabase
- [ ] Configurar variables de entorno
- [ ] Instalar `@supabase/supabase-js`
- [ ] Crear tablas en la base de datos
- [ ] Configurar RLS
- [ ] Crear cliente de Supabase
- [ ] Implementar servicios
- [ ] Crear hooks personalizados
- [ ] Implementar autenticación
- [ ] Migrar desde mock data
- [ ] Probar en desarrollo
- [ ] Configurar storage (opcional)
- [ ] Deploy a producción
