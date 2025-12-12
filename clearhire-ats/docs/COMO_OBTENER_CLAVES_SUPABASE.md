# 🔑 Cómo Obtener las Claves Correctas de Supabase

## ❌ Problema Actual

Estás usando una clave incorrecta:
```
VITE_SUPABASE_ANON_KEY=sb_publishable_O3xsR9ilDJyVyGsj1BTltg_u3s1vyi22
```

Esta es una **publishable key**, pero necesitas la **anon key**.

---

## ✅ Solución: Obtener las Claves Correctas

### Paso 1: Ve a tu Proyecto en Supabase

1. Abre https://app.supabase.com
2. Inicia sesión
3. Selecciona tu proyecto: `vzcuumrnilzeufizyfei`

### Paso 2: Ve a Settings → API

1. En el menú lateral izquierdo, haz clic en **⚙️ Settings**
2. Luego haz clic en **API**

### Paso 3: Copia las Claves Correctas

Verás una sección llamada **"Project API keys"** con dos claves:

#### 1. Project URL
```
https://vzcuumrnilzeufizyfei.supabase.co
```
✅ Esta ya la tienes correcta

#### 2. anon public (anon key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTU5NzAsImV4cCI6MjA0OTUzMTk3MH0...
```
⚠️ **Esta es la que necesitas** (empieza con `eyJ...`)

**NO uses:**
- ❌ `service_role` key (es secreta, solo para backend)
- ❌ `publishable` key (no es la correcta)

---

## 📝 Actualizar tu .env

Una vez que tengas la **anon key** correcta:

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza la línea de `VITE_SUPABASE_ANON_KEY` con la clave correcta:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://vzcuumrnilzeufizyfei.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTU5NzAsImV4cCI6MjA0OTUzMTk3MH0...

# Feature Flags
VITE_USE_SUPABASE=true

# App Configuration
VITE_APP_NAME=ClearHire
VITE_APP_VERSION=1.0.0
```

3. **Guarda el archivo**
4. **Reinicia el servidor de desarrollo**:
```bash
# Detén el servidor (Ctrl+C)
# Vuelve a iniciarlo
npm run dev
```

---

## 🔍 Cómo Identificar la Clave Correcta

### ✅ anon key (CORRECTA)
- Empieza con: `eyJ...`
- Es muy larga (varios cientos de caracteres)
- Es un JWT (JSON Web Token)
- Ejemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...`

### ❌ publishable key (INCORRECTA)
- Empieza con: `sb_publishable_...`
- Es más corta
- Ejemplo: `sb_publishable_O3xsR9ilDJyVyGsj1BTltg_u3s1vyi22`

### ❌ service_role key (NO USAR EN FRONTEND)
- Empieza con: `eyJ...` (similar a anon)
- Dice "service_role" en la etiqueta
- **NUNCA** la uses en el frontend (es secreta)

---

## 🎯 Verificación

Después de actualizar la clave:

1. **Reinicia el servidor**:
```bash
npm run dev
```

2. **Abre la aplicación** en http://localhost:5175/

3. **Abre la consola del navegador** (F12)

4. **Busca estos mensajes**:

### ✅ Si funciona:
```
✅ Supabase configured successfully
🔧 Modo de datos: SUPABASE
✅ Conexión a Supabase exitosa
```

### ❌ Si sigue fallando:
```
⚠️ Supabase credentials not found
Error: Invalid API key
```

---

## 📸 Captura de Pantalla de Referencia

En Supabase Dashboard → Settings → API, verás algo así:

```
Project API keys

Project URL
https://vzcuumrnilzeufizyfei.supabase.co
[Copy]

anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTU5NzAsImV4cCI6MjA0OTUzMTk3MH0...
[Copy]  ← Copia esta

service_role secret
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzk1NTk3MCwiZXhwIjoyMDQ5NTMxOTcwfQ...
[Copy]  ← NO uses esta
```

---

## 🆘 Solución Rápida

Si no puedes encontrar la clave, aquí está el proceso completo:

1. Ve a https://app.supabase.com
2. Click en tu proyecto
3. Click en **⚙️ Settings** (menú lateral)
4. Click en **API**
5. Busca la sección **"Project API keys"**
6. Copia la clave que dice **"anon public"**
7. Pégala en tu `.env` como `VITE_SUPABASE_ANON_KEY`
8. Reinicia el servidor

---

## ✅ Resultado Esperado

Una vez que uses la clave correcta:

- ✅ El indicador de Supabase mostrará "Conectado" (verde)
- ✅ Los datos se guardarán en la base de datos
- ✅ Podrás ver los datos en Supabase Table Editor
- ✅ La aplicación funcionará con datos reales

---

## 💡 Nota Importante

La clave `anon public` es **segura para usar en el frontend** porque:
- Solo tiene permisos de lectura/escritura limitados
- Las políticas RLS protegen los datos
- No puede hacer operaciones administrativas

**Nunca uses la `service_role` key en el frontend.**

---

¡Una vez que actualices la clave, todo funcionará! 🚀
