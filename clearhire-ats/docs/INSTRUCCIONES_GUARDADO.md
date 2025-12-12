# 🔧 Instrucciones para Guardar Datos en Supabase

## ✅ Correcciones Implementadas

He implementado las siguientes mejoras para solucionar el problema de guardado:

### 1. **Mejor Manejo de Autenticación**
- El sistema ahora detecta si hay un usuario autenticado
- Muestra mensajes claros cuando no hay autenticación
- Previene errores de UUID inválidos

### 2. **Notificaciones Visuales**
- Toast notifications para éxito/error
- Indicador visual del estado de guardado
- Mensajes claros sobre qué está pasando

### 3. **Panel de Debug de Autenticación**
- Panel en la esquina inferior izquierda (solo en desarrollo)
- Muestra el estado de autenticación actual
- Permite iniciar sesión rápidamente

## 🚀 Cómo Usar

### Opción 1: Crear Usuario en Supabase (RECOMENDADO)

1. **Ve al Dashboard de Supabase**
   - Abre: https://vzcuumrnilzeufizyfei.supabase.co

2. **Navega a Authentication > Users**

3. **Crea un nuevo usuario**
   - Click en "Add User"
   - Email: `test@clearhire.com`
   - Password: `test123456`
   - Click en "Create User"

4. **Usa el Panel de Debug**
   - En la aplicación, verás un panel en la esquina inferior izquierda
   - Ingresa las credenciales:
     - Email: `test@clearhire.com`
     - Password: `test123456`
   - Click en "Iniciar Sesión"

5. **¡Listo!**
   - Ahora todos los cambios se guardarán automáticamente en Supabase
   - Verás notificaciones de éxito cuando se guarde

### Opción 2: Usar el Script SQL con UUID Real

Si ya tienes un usuario en Supabase:

1. **Obtén tu UUID**
   - Ve a Authentication > Users
   - Copia el UUID de tu usuario

2. **Actualiza el script**
   - Abre: `clearhire-ats/scripts/insert-mock-data-simple.sql`
   - En la línea 11, reemplaza el UUID:
   ```sql
   v_user_id UUID := 'TU-UUID-AQUI';
   ```

3. **Ejecuta el script**
   - En el SQL Editor de Supabase
   - Pega y ejecuta el script completo

## 🔍 Verificar que Funciona

### Señales de que está funcionando:

1. **Panel de Debug muestra "✅ Autenticado"**
2. **Al editar el perfil, ves:**
   - "Guardando..." (indicador de guardado)
   - "Perfil guardado exitosamente" (toast verde)
3. **En la consola del navegador:**
   - `✅ Usuario autenticado: [UUID]`
   - `✅ Perfil guardado exitosamente`

### Si algo falla:

1. **Toast rojo con mensaje de error**
   - Lee el mensaje para saber qué pasó
2. **Panel de Debug muestra "❌ No autenticado"**
   - Necesitas iniciar sesión
3. **En la consola:**
   - Busca mensajes de error en rojo
   - Comparte el error para ayudarte

## 📝 Notas Importantes

- **Auto-guardado**: Los cambios se guardan automáticamente después de 1 segundo de inactividad
- **Modo Mock**: Si no hay autenticación, los cambios solo se guardan localmente (se pierden al recargar)
- **Panel de Debug**: Solo aparece en modo desarrollo (no en producción)

## 🐛 Solución de Problemas

### "Usuario no autenticado"
→ Usa el panel de debug para iniciar sesión

### "Error: invalid input syntax for type uuid"
→ Asegúrate de estar autenticado con un usuario real de Supabase

### "Los cambios no se guardan"
→ Verifica que el panel de debug muestre "✅ Autenticado"

### "Error al guardar el perfil"
→ Revisa la consola del navegador para más detalles

## 🎯 Próximos Pasos

Una vez que confirmes que el guardado funciona:

1. Puedes ocultar el panel de debug (ya está configurado para solo desarrollo)
2. Implementar un sistema de login completo para producción
3. Agregar más validaciones según necesites

---

**¿Necesitas ayuda?** Comparte los mensajes de error que veas en la consola o en los toasts.
