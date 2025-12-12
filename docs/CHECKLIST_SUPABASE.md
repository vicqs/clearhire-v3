# ✅ Checklist de Verificación Supabase

## 🎯 **Verificaciones en el Dashboard de Supabase**

### **1. 🏗️ Proyecto Creado y Activo**

**En [supabase.com](https://supabase.com) → Dashboard:**

- [ ] **Proyecto existe**: Puedes ver tu proyecto `clearhire-ats` en la lista
- [ ] **Estado activo**: El proyecto muestra estado "Active" (no "Paused" o "Inactive")
- [ ] **Sin errores**: No hay alertas rojas en el dashboard
- [ ] **Base de datos funcionando**: Puedes acceder a la pestaña "Table Editor"

### **2. 🔑 Credenciales Correctas**

**En Settings → API:**

- [ ] **Project URL copiada**: Formato `https://abcdefghijk.supabase.co`
- [ ] **anon public key copiada**: Empieza con `eyJhbGciOiJIUzI1NiIs...`
- [ ] **service_role key visible**: (No la uses en frontend, solo para verificar que existe)
- [ ] **JWT Secret visible**: (Solo para verificar configuración)

**Verificar formato:**
```
✅ URL correcta: https://[proyecto-id].supabase.co
❌ URL incorrecta: https://supabase.co/dashboard/project/[id]
```

### **3. 🔐 Configuración de Autenticación**

**En Authentication → Settings:**

- [ ] **Site URL configurada**: `http://localhost:3000`
- [ ] **Redirect URLs configuradas**: 
  - `http://localhost:3000/**`
  - `http://localhost:3000/auth/callback` (si usas OAuth)
- [ ] **Email confirmations**: Configurado según tus necesidades
- [ ] **Providers habilitados**: Al menos "Email" debe estar activo

### **4. 🛡️ Configuración de Seguridad**

**En Settings → API:**

- [ ] **RLS habilitado**: Row Level Security activado en tablas sensibles
- [ ] **CORS configurado**: No debería ser necesario configurar manualmente
- [ ] **Rate limiting**: Configurado según tus necesidades

### **5. 🗄️ Base de Datos (Si aplica)**

**En Table Editor:**

- [ ] **Tablas creadas**: Si necesitas tablas específicas
- [ ] **Políticas RLS**: Configuradas para cada tabla
- [ ] **Índices creados**: Para optimizar consultas
- [ ] **Triggers configurados**: Si los necesitas

## 🧪 **Verificaciones en tu Aplicación**

### **1. 📝 Variables de Entorno**

**En tu archivo `.env`:**

- [ ] **VITE_SUPABASE_URL**: URL real (no placeholder)
- [ ] **VITE_SUPABASE_ANON_KEY**: Key real (no placeholder)
- [ ] **VITE_USE_SUPABASE**: `true` para usar Supabase
- [ ] **Sin espacios extra**: No hay espacios al inicio/final de las variables

### **2. 🔄 Servidor Reiniciado**

- [ ] **Servidor detenido**: Ctrl+C en la terminal
- [ ] **Servidor reiniciado**: `npm run dev`
- [ ] **Variables cargadas**: Nuevas variables de entorno activas

### **3. 🌐 Conectividad Básica**

**Abrir consola del navegador (F12) y ejecutar:**

```javascript
// Test 1: Verificar variables
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

// Test 2: Probar conectividad
fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
  headers: {
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + import.meta.env.VITE_SUPABASE_ANON_KEY
  }
}).then(r => console.log('Status:', r.status, r.statusText));
```

**Resultados esperados:**
- [ ] **Variables no son undefined**
- [ ] **Status: 200 OK** (o 401/403 que indica que el servidor responde)
- [ ] **Sin errores de CORS**

### **4. 🔍 Diagnóstico Integrado**

**En tu aplicación:**

- [ ] **DebugSidebar abierto**: Esquina inferior derecha
- [ ] **Diagnóstico ejecutado**: Botón "Diagnosticar" en sección Supabase
- [ ] **Resultados verdes**: URL válida ✅, Key válida ✅
- [ ] **Sin errores en consola**: No hay errores rojos relacionados con Supabase

### **5. 🧪 Prueba de Autenticación**

**Probar login:**

- [ ] **Formulario de login funciona**: No se congela
- [ ] **Sin errores de red**: No aparecen errores de "Failed to fetch"
- [ ] **Respuesta de Supabase**: Aunque falle el login, debe haber respuesta del servidor
- [ ] **Estado actualizado**: El estado de autenticación cambia correctamente

## 🚨 **Problemas Comunes y Soluciones**

### **❌ Error: "Failed to fetch"**
**Causa:** Proyecto no existe o credenciales incorrectas
**Solución:** Verificar que el proyecto esté activo y las credenciales sean correctas

### **❌ Error: "Invalid JWT"**
**Causa:** Key incorrecta o expirada
**Solución:** Copiar nuevamente la anon key desde Settings → API

### **❌ Error: "CORS policy"**
**Causa:** Configuración de CORS o proyecto inactivo
**Solución:** Verificar que el proyecto esté activo y la URL sea correcta

### **❌ Error: "Network request failed"**
**Causa:** Problemas de conectividad o DNS
**Solución:** Verificar conexión a internet y que la URL sea accesible

## 🎯 **Verificación Final**

### **✅ Todo Funcionando Correctamente:**

1. **Dashboard Supabase**: Proyecto activo y sin errores
2. **Credenciales**: Copiadas correctamente en `.env`
3. **Servidor**: Reiniciado después de cambiar `.env`
4. **Conectividad**: Test básico devuelve status 200
5. **Diagnóstico**: Todas las verificaciones en verde
6. **Login**: Funciona sin errores de red

### **🔧 Si Algo Falla:**

1. **Verificar cada paso** de esta checklist
2. **Usar modo mock temporalmente**: `VITE_USE_SUPABASE=false`
3. **Revisar logs** en consola del navegador
4. **Ejecutar diagnóstico integrado**
5. **Verificar estado del proyecto** en Supabase dashboard

## 📞 **Comandos de Diagnóstico Rápido**

**En consola del navegador:**

```javascript
// Diagnóstico completo
window.debugSupabaseConnection?.();

// Verificar configuración
console.log({
  url: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  useSupabase: import.meta.env.VITE_USE_SUPABASE
});

// Test de conectividad simple
fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/')
  .then(r => console.log('✅ Conectividad OK:', r.status))
  .catch(e => console.log('❌ Error:', e.message));
```

---

**Una vez que todos los elementos de esta checklist estén ✅, Supabase debería funcionar perfectamente con tu aplicación.**