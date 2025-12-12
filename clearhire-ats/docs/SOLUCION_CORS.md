# 🔧 Solución para Error de CORS en Supabase

## 🚨 **Problema Actual**

```
Access to fetch at 'https://vzcuumrnilzeufizyfei.supabase.co/auth/v1/token' 
from origin 'http://localhost:5175' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
Redirect is not allowed for a preflight request.
```

## 🔍 **Diagnóstico del Problema**

El error indica que:
1. **El proyecto Supabase no existe** o fue eliminado
2. **Las credenciales son inválidas**
3. **Hay un redirect** en lugar de una respuesta válida

## ✅ **Solución Paso a Paso**

### **Opción 1: Crear Nuevo Proyecto Supabase (Recomendado)**

#### **1. Crear Proyecto**
1. Ve a [supabase.com](https://supabase.com)
2. Crea cuenta o inicia sesión
3. Haz clic en **"New Project"**
4. Completa:
   - **Name**: `clearhire-ats`
   - **Database Password**: (genera una segura)
   - **Region**: Selecciona la más cercana
5. Haz clic en **"Create new project"**
6. Espera 2-3 minutos a que se cree

#### **2. Obtener Credenciales**
1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL**: `https://tu-nuevo-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### **3. Actualizar .env**
```env
# Reemplaza en tu archivo .env
VITE_SUPABASE_URL=https://tu-nuevo-id.supabase.co
VITE_SUPABASE_ANON_KEY=tu-nueva-clave-aqui
VITE_USE_SUPABASE=true
```

#### **4. Reiniciar Servidor**
```bash
# Detener servidor (Ctrl+C)
# Reiniciar
npm run dev
```

### **Opción 2: Usar Modo Mock (Solución Inmediata)**

Si necesitas continuar trabajando mientras configuras Supabase:

```env
# En .env
VITE_USE_SUPABASE=false
```

**Beneficios:**
- ✅ **Sin errores**: Elimina todos los problemas de CORS
- ✅ **Desarrollo fluido**: Puedes continuar trabajando
- ✅ **Datos consistentes**: Usa datos de prueba locales

## 🛠️ **Herramientas de Diagnóstico**

### **1. Usar el Diagnóstico Integrado**
1. Abrir **DebugSidebar** (esquina inferior derecha)
2. Ir a **"Diagnóstico CORS"**
3. Hacer clic en **"Ejecutar Diagnóstico"**
4. Ver resultados detallados

### **2. Verificación Manual**
Abre la consola del navegador y ejecuta:

```javascript
// Verificar si el proyecto existe
fetch('https://vzcuumrnilzeufizyfei.supabase.co/rest/v1/', {
  method: 'HEAD',
  headers: {
    'apikey': 'tu-clave-aqui'
  }
}).then(response => {
  console.log('Status:', response.status);
  console.log('OK:', response.ok);
}).catch(error => {
  console.log('Error:', error.message);
});
```

## 🎯 **Configuración Recomendada para Desarrollo**

### **Para Desarrollo Diario:**
```env
VITE_USE_SUPABASE=false
```
- Sin errores de red
- Desarrollo más rápido
- Datos consistentes

### **Para Testing con Supabase:**
```env
VITE_USE_SUPABASE=true
# Con credenciales válidas
```

## 🔧 **Configuración de Supabase (Una vez creado el proyecto)**

### **1. Configurar Autenticación**
1. Ve a **Authentication** → **Settings**
2. En **Site URL** agrega: `http://localhost:5175`
3. En **Redirect URLs** agrega: `http://localhost:5175/**`

### **2. Configurar Base de Datos**
1. Ve a **SQL Editor**
2. Ejecuta el script de inicialización (si tienes uno)
3. O crea las tablas necesarias

### **3. Configurar Políticas RLS**
1. Ve a **Authentication** → **Policies**
2. Configura las políticas de seguridad según tus necesidades

## 🚀 **Verificar que Funciona**

### **1. Después de Configurar Supabase:**
1. Cambiar `VITE_USE_SUPABASE=true`
2. Reiniciar servidor
3. Intentar login
4. Verificar en DebugSidebar que muestra "Conectado"

### **2. Si Sigue Fallando:**
1. Verificar credenciales en Supabase dashboard
2. Verificar que el proyecto está activo
3. Usar el diagnóstico integrado
4. Volver a modo mock temporalmente

## 💡 **Consejos Adicionales**

### **✅ Buenas Prácticas:**
- Mantén las credenciales en `.env` (nunca en el código)
- Usa `.env.example` para documentar las variables necesarias
- Configura `.gitignore` para excluir `.env`

### **🔒 Seguridad:**
- Nunca compartas las credenciales reales
- Usa diferentes proyectos para desarrollo/producción
- Configura RLS (Row Level Security) en Supabase

### **🧪 Testing:**
- Usa modo mock para tests unitarios
- Usa Supabase real para tests de integración
- Mantén datos de prueba separados

## 🎉 **Resultado Esperado**

Una vez configurado correctamente:
- ✅ **Login funciona** sin errores de CORS
- ✅ **Datos se guardan** en Supabase real
- ✅ **DebugSidebar** muestra estado "Conectado"
- ✅ **Sin errores** en consola del navegador

---

**El problema actual es que el proyecto `vzcuumrnilzeufizyfei` no existe o fue eliminado. Crear un nuevo proyecto Supabase resolverá completamente el problema de CORS.**