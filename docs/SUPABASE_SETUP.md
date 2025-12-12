# 🚀 Configuración Rápida de Supabase

## Pasos para Conectar tu Aplicación a Supabase

### 1️⃣ Crear Cuenta y Proyecto

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Espera a que se inicialice (2-3 minutos)

### 2️⃣ Obtener Credenciales

En tu proyecto de Supabase:

1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3️⃣ Configurar Variables de Entorno

1. Copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita `.env` con tus credenciales:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
   VITE_USE_SUPABASE=true
   ```

### 4️⃣ Instalar Dependencias

```bash
npm install @supabase/supabase-js
```

### 5️⃣ Crear Tablas en Supabase

1. Ve a **SQL Editor** en tu proyecto de Supabase
2. Copia y ejecuta el SQL de `docs/SUPABASE_INTEGRATION_GUIDE.md`
3. Verifica que las tablas se crearon en **Table Editor**

### 6️⃣ Configurar Row Level Security (RLS)

Las políticas de RLS ya están incluidas en el SQL. Verifica que estén activas:

1. Ve a **Authentication** → **Policies**
2. Verifica que cada tabla tenga políticas activas
3. Las políticas aseguran que cada usuario solo vea sus propios datos

### 7️⃣ Probar la Conexión

Reinicia tu servidor de desarrollo:

```bash
npm run dev
```

Si todo está configurado correctamente, verás en la consola:
```
✅ Supabase connected successfully
```

### 8️⃣ Habilitar Autenticación

En Supabase:

1. Ve a **Authentication** → **Providers**
2. Habilita **Email** (ya está habilitado por defecto)
3. Opcional: Habilita **Google**, **GitHub**, etc.

### 9️⃣ Configurar Storage (Opcional)

Para subir CVs y fotos de perfil:

1. Ve a **Storage**
2. Crea dos buckets:
   - `cvs` (privado)
   - `avatars` (público)
3. Configura políticas de acceso

### 🔟 Migrar Datos Mock (Opcional)

Si quieres migrar tus datos de prueba:

```typescript
// Ejecuta este script una vez
import { supabase } from './lib/supabase';
import { mockProfile } from './services/mock/mockData';

async function migrateData() {
  // Insertar perfil de prueba
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: 'tu-user-id',
      first_name: mockProfile.personalInfo.firstName,
      last_name: mockProfile.personalInfo.lastName,
      email: mockProfile.personalInfo.email,
      // ... más campos
    });
  
  console.log('Migración completa:', data);
}
```

---

## 🎯 Verificación

### Checklist de Configuración

- [ ] Proyecto creado en Supabase
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Tablas creadas
- [ ] RLS configurado
- [ ] Autenticación habilitada
- [ ] Storage configurado (opcional)
- [ ] Aplicación conectada exitosamente

### Comandos Útiles

```bash
# Instalar dependencias
npm install @supabase/supabase-js

# Generar tipos TypeScript desde Supabase
npx supabase gen types typescript --project-id "tu-project-id" > src/types/supabase.ts

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

---

## 🆘 Solución de Problemas

### Error: "Invalid API key"
- Verifica que copiaste correctamente el `anon key`
- Asegúrate de usar el `anon/public key`, NO el `service_role key`

### Error: "Failed to fetch"
- Verifica que la URL de Supabase sea correcta
- Verifica tu conexión a internet
- Revisa la consola del navegador para más detalles

### Error: "Row Level Security"
- Verifica que las políticas de RLS estén configuradas
- Asegúrate de estar autenticado
- Revisa los logs en Supabase Dashboard

### Los datos no se guardan
- Verifica que el usuario esté autenticado
- Revisa las políticas de RLS
- Verifica la consola para errores

---

## 📚 Próximos Pasos

1. **Implementar Autenticación**: Crea páginas de login/registro
2. **Migrar Servicios**: Reemplaza mock data con llamadas a Supabase
3. **Real-time**: Implementa actualizaciones en tiempo real
4. **Storage**: Sube archivos (CVs, fotos)
5. **Testing**: Prueba todas las funcionalidades

---

## 🔗 Enlaces Útiles

- [Dashboard de Supabase](https://app.supabase.com)
- [Documentación](https://supabase.com/docs)
- [Guía de Integración Completa](./docs/SUPABASE_INTEGRATION_GUIDE.md)
- [Ejemplos de Código](https://github.com/supabase/supabase/tree/master/examples)

---

## 💡 Tips

- Usa el **SQL Editor** para ejecutar queries directamente
- Revisa los **Logs** en tiempo real para debugging
- Usa **Table Editor** para ver y editar datos manualmente
- Configura **Email Templates** para emails de autenticación personalizados
- Habilita **2FA** en tu cuenta de Supabase para mayor seguridad
