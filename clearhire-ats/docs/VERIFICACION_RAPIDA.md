# 🚀 Verificación Rápida de Supabase

## 📋 **Checklist Esencial (5 minutos)**

### **1. 🏗️ En Supabase Dashboard**
- [ ] Proyecto existe y está **activo** (no pausado)
- [ ] Puedes acceder a **Settings → API**
- [ ] **Project URL** tiene formato: `https://abc123.supabase.co`
- [ ] **anon public key** empieza con `eyJhbGciOiJIUzI1NiIs...`

### **2. 📝 En tu .env**
- [ ] `VITE_SUPABASE_URL` = URL real (no "tu-nuevo-proyecto")
- [ ] `VITE_SUPABASE_ANON_KEY` = Key real (no "tu-nueva-clave")
- [ ] `VITE_USE_SUPABASE=true`
- [ ] Servidor reiniciado después de cambiar .env

### **3. 🧪 Test Rápido**
Abre consola del navegador (F12) y ejecuta:
```javascript
fetch(import.meta.env.VITE_SUPABASE_URL + '/rest/v1/', {
  headers: { 'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY }
}).then(r => console.log('Status:', r.status));
```

**Resultado esperado:** `Status: 200` o `Status: 401` (ambos indican que el servidor responde)

## 🎯 **Si Todo Está Bien**
- ✅ No hay errores de "Failed to fetch"
- ✅ Login funciona (aunque falle, no hay errores de red)
- ✅ Diagnóstico integrado muestra todo en verde

## 🔧 **Si Algo Falla**
1. **Verificar proyecto activo** en Supabase dashboard
2. **Copiar credenciales nuevamente** desde Settings → API
3. **Reiniciar servidor** después de cambiar .env
4. **Usar modo mock temporalmente**: `VITE_USE_SUPABASE=false`

## 📖 **Documentación Completa**
- `CHECKLIST_SUPABASE.md` - Verificación detallada
- `SETUP_SUPABASE.md` - Crear nuevo proyecto paso a paso