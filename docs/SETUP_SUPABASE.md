# 🚀 Configuración de Supabase - Guía Paso a Paso

## 🎯 **Problema Identificado**

El proyecto Supabase `vzcuumrnilzeufizyfei` no existe o fue eliminado. Necesitas crear un nuevo proyecto.

## ✅ **Solución: Crear Nuevo Proyecto Supabase**

### **Paso 1: Crear Cuenta y Proyecto**

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en **"New Project"**
4. Completa los datos:
   - **Name**: `clearhire-ats`
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: Selecciona la más cercana a tu ubicación
5. Haz clic en **"Create new project"**
6. **Espera 2-3 minutos** mientras se crea el proyecto

### **Paso 2: Obtener Credenciales**

1. Una vez creado el proyecto, ve a **Settings** → **API**
2. Copia las siguientes credenciales:
   - **Project URL**: `https://tu-id-unico.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Paso 3: Actualizar .env**

Reemplaza en tu archivo `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-id-unico.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-completa
VITE_USE_SUPABASE=true
```

### **Paso 4: Configurar Autenticación**

1. En tu proyecto Supabase, ve a **Authentication** → **Settings**
2. En **Site URL**, agrega: `http://localhost:3000`
3. En **Redirect URLs**, agrega: `http://localhost:3000/**`
4. Guarda los cambios

### **Paso 5: Configurar Base de Datos (Opcional)**

Si necesitas tablas específicas:

1. Ve a **SQL Editor**
2. Ejecuta este script básico:

```sql
-- Crear tabla de usuarios (ejemplo)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política básica: usuarios pueden ver/editar su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### **Paso 6: Reiniciar Servidor**

```bash
# Detener el servidor (Ctrl+C en la terminal)
# Reiniciar
npm run dev
```

## 🧪 **Verificar que Funciona**

### **1. Usar el Diagnóstico Integrado**
1. Abre la aplicación en `http://localhost:3000`
2. Abre el **DebugSidebar** (esquina inferior derecha)
3. Ve a **"Diagnóstico Supabase"**
4. Haz clic en **"Ejecutar Diagnóstico"**
5. Verifica que muestre:
   - ✅ URL válida: true
   - ✅ Key válida: true
   - ✅ Conectividad: OK

### **2. Probar Login**
1. Intenta hacer login con cualquier email/contraseña
2. Debería funcionar sin errores de CORS
3. En la consola del navegador deberías ver:
   - `✅ Supabase configured successfully`
   - `🔄 Intentando conectar a Supabase...`

## 🔧 **Si Sigue Sin Funcionar**

### **Opción A: Usar Modo Mock Temporalmente**
```env
VITE_USE_SUPABASE=false
```

### **Opción B: Verificar Configuración**
1. Verifica que las credenciales sean correctas
2. Verifica que el proyecto esté activo en Supabase
3. Limpia el cache del navegador
4. Reinicia el servidor de desarrollo

## 🎉 **Resultado Esperado**

Una vez configurado correctamente:
- ✅ **Sin errores de CORS**
- ✅ **Login funciona**
- ✅ **Datos se guardan en Supabase**
- ✅ **DebugSidebar muestra "Conectado"**

## 📞 **Soporte**

Si necesitas ayuda:
1. Ejecuta el diagnóstico integrado
2. Revisa la consola del navegador
3. Verifica que el proyecto Supabase esté activo
4. Usa modo mock como fallback temporal

---

**Una vez que tengas las nuevas credenciales, actualiza el .env y reinicia el servidor. ¡Debería funcionar perfectamente!**