# 🔑 Explicación de las Claves de Supabase

## 📋 **Claves Disponibles en tu Proyecto**

Según el dashboard de Supabase, tienes **dos claves diferentes**:

### **1. Publishable Key (Corta)**
```
sb_publishable_O3xsR9ilDJyVyGsj1BTltg_u3s1vyi2
```
- **Formato**: Empieza con `sb_publishable_`
- **Longitud**: Corta (~40 caracteres)
- **Uso**: Para ciertas funcionalidades específicas de Supabase

### **2. Anon Key (Larga - JWT)**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Nzg1MzYsImV4cCI6MjA4MDQ1NDUzNn0.75eJJ1fxDaL4eRiyoQ_-EOdNTGV61uwQHqbuYS8rx9A
```
- **Formato**: JWT que empieza con `eyJ`
- **Longitud**: Larga (~200+ caracteres)
- **Uso**: Para autenticación y API REST (la más común)

## 🎯 **¿Cuál Usar?**

### **Para tu aplicación React/JavaScript:**
**Usa la Anon Key (JWT larga)**

```env
# Configuración correcta
VITE_SUPABASE_URL=https://vzcuumrnilzeufizyfei.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Razones:**
- ✅ **Es un JWT válido** con información del proyecto
- ✅ **Funciona con createClient()** de @supabase/supabase-js
- ✅ **Permite autenticación** y acceso a la API REST
- ✅ **Es la estándar** para aplicaciones web

## 🔍 **Diferencias Técnicas**

### **Anon Key (JWT)**
```javascript
// Decodificando el JWT
{
  "iss": "supabase",
  "ref": "vzcuumrnilzeufizyfei",
  "role": "anon",
  "iat": 1764878536,
  "exp": 2080454536
}
```
- Contiene información del proyecto
- Tiene fecha de expiración (2035)
- Rol "anon" para acceso público

### **Publishable Key**
- Clave simple sin información adicional
- Para funcionalidades específicas
- No es un JWT

## ✅ **Configuración Final Correcta**

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://vzcuumrnilzeufizyfei.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3V1bXJuaWx6ZXVmaXp5ZmVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Nzg1MzYsImV4cCI6MjA4MDQ1NDUzNn0.75eJJ1fxDaL4eRiyoQ_-EOdNTGV61uwQHqbuYS8rx9A
VITE_USE_SUPABASE=true
```

```javascript
// Código correcto
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY  // JWT larga
);
```

## 🧪 **Próximo Paso**

Ahora que tienes las credenciales correctas:

1. **Reinicia el servidor** (ya aplicado)
2. **Usa el verificador integrado** en DebugSidebar
3. **Verifica si el proyecto está pausado**

Si el proyecto está activo, debería funcionar perfectamente con estas credenciales.

---

**Resumen: Usa la Anon Key (JWT larga) para tu aplicación, no la Publishable Key (corta).**