# 🔑 Encontrar las Claves Correctas de Supabase

## ❌ Claves que Tienes (No Sirven para JavaScript)

```
Publishable key: sb_publishable_O3xsR9ilDJyVyGsj1BTltg_u3s1vyi2
Secret key: sb_secret_6AJX2KLkKa9Zhyi0k9kF8w_JwUlOQIu
```

Estas son claves de **Supabase Realtime** (nuevo sistema), pero para usar `@supabase/supabase-js` necesitas las claves **JWT**.

---

## ✅ Cómo Encontrar las Claves Correctas

### Opción 1: Settings → API (Recomendado)

1. Ve a https://app.supabase.com
2. Abre tu proyecto: `vzcuumrnilzeufizyfei`
3. En el menú lateral, click en **⚙️ Settings**
4. Click en **API**
5. Baja hasta la sección **"Project API keys"**

Ahí verás:

```
Project URL
https://vzcuumrnilzeufizyfei.supabase.co
[Copy]

anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTU5NzAsImV4cCI6MjA0OTUzMTk3MH0.XXXXXXXXXXXXXXX
[Copy]  ← Esta es la que necesitas

service_role secret
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk1NTk3MCwiZXhwIjoyMDQ5NTMxOTcwfQ.XXXXXXXXXXXXXXX
[Copy]  ← NO uses esta (es secreta)
```

### Opción 2: Project Settings → Configuration

1. Ve a https://app.supabase.com
2. Abre tu proyecto
3. Click en **⚙️ Settings** (menú lateral)
4. Click en **Configuration**
5. Busca la sección **"API"**

---

## 📝 Actualizar tu .env

Una vez que encuentres la clave **anon public** (la que empieza con `eyJ...`):

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://vzcuumrnilzeufizyfei.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTU5NzAsImV4cCI6MjA0OTUzMTk3MH0.XXXXXXXXXXXXXXX

# Feature Flags
VITE_USE_SUPABASE=true

# App Configuration
VITE_APP_NAME=ClearHire
VITE_APP_VERSION=1.0.0
```

**Importante**: Reemplaza `XXXXXXXXXXXXXXX` con la clave completa que copies.

---

## 🔍 Cómo Identificar la Clave Correcta

### ✅ anon key (CORRECTA)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTU5NzAsImV4cCI6MjA0OTUzMTk3MH0.XXXXXXXXXXXXXXX
```
- ✅ Empieza con `eyJ`
- ✅ Tiene 3 partes separadas por `.`
- ✅ Es muy larga (300+ caracteres)
- ✅ Es un JWT (JSON Web Token)

### ❌ Publishable key (INCORRECTA para JavaScript)
```
sb_publishable_O3xsR9ilDJyVyGsj1BTltg_u3s1vyi2
```
- ❌ Empieza con `sb_publishable_`
- ❌ Es para Supabase Realtime (nuevo sistema)
- ❌ No funciona con `@supabase/supabase-js`

### ❌ Secret key (INCORRECTA para JavaScript)
```
sb_secret_6AJX2KLkKa9Zhyi0k9kF8w_JwUlOQIu
```
- ❌ Empieza con `sb_secret_`
- ❌ Es para Supabase Realtime
- ❌ No funciona con `@supabase/supabase-js`

---

## 🎯 Ubicación Exacta en Supabase

### Ruta en el Dashboard:

```
Supabase Dashboard
  └─ Tu Proyecto (vzcuumrnilzeufizyfei)
      └─ ⚙️ Settings (menú lateral)
          └─ API
              └─ Project API keys
                  ├─ Project URL: https://vzcuumrnilzeufizyfei.supabase.co
                  ├─ anon public: eyJ... ← COPIA ESTA
                  └─ service_role: eyJ... ← NO USES ESTA
```

---

## 📸 Captura Visual

En la página de Settings → API verás algo así:

```
┌─────────────────────────────────────────────────────────┐
│ Project API keys                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Project URL                                             │
│ https://vzcuumrnilzeufizyfei.supabase.co              │
│ [Copy]                                                  │
│                                                         │
│ anon public                                             │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJz... │
│ [Copy] [Reveal]  ← Click aquí para copiar              │
│                                                         │
│ service_role secret                                     │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJz... │
│ [Copy] [Reveal]  ← NO uses esta                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ Nota Importante

Las claves que tienes (`sb_publishable_...` y `sb_secret_...`) son del **nuevo sistema de Supabase Realtime** que se usa para:
- Conexiones WebSocket
- Realtime subscriptions
- Broadcast channels

Pero para usar la librería `@supabase/supabase-js` (que es lo que usa tu aplicación), necesitas las claves **JWT tradicionales** (las que empiezan con `eyJ...`).

---

## 🚀 Después de Actualizar

1. **Guarda el archivo .env**
2. **Reinicia el servidor**:
```bash
# Ctrl+C para detener
npm run dev
```
3. **Abre la aplicación**: http://localhost:5175/
4. **Verifica en la consola** (F12):
```
✅ Supabase configured successfully
✅ Conexión a Supabase exitosa
```

---

## 🆘 Si No Encuentras las Claves

Si no ves la sección "Project API keys" en Settings → API:

1. Verifica que estés en el proyecto correcto
2. Intenta refrescar la página
3. Verifica que tengas permisos de administrador en el proyecto
4. Contacta al soporte de Supabase si el problema persiste

---

## ✅ Resumen

**Problema**: Tienes claves de Realtime (`sb_publishable_...`)
**Solución**: Necesitas claves JWT (`eyJ...`)
**Dónde**: Settings → API → "anon public"

**Una vez que uses la clave correcta, todo funcionará.** 🎉
