# 📊 Cómo Insertar Datos Mock en Supabase

## 🎯 Propósito

Este script inserta todos los datos de demostración (mock data) en tu base de datos de Supabase para que puedas probar la aplicación con datos reales.

---

## ⚠️ IMPORTANTE: Obtener tu User ID

Antes de ejecutar el script, necesitas obtener tu **user_id** de Supabase.

### Opción 1: Crear un Usuario de Prueba

1. Ve a tu proyecto en Supabase
2. Click en **Authentication** (menú lateral)
3. Click en **Users**
4. Click en **Add user** → **Create new user**
5. Ingresa:
   - Email: `juan.perez@example.com`
   - Password: `Test123456!`
6. Click en **Create user**
7. **Copia el UUID** que aparece en la columna "UID"
   - Ejemplo: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Opción 2: Usar tu Usuario Actual

Si ya tienes un usuario autenticado:

1. Ve a **Authentication** → **Users**
2. Busca tu usuario
3. Copia el **UID**

---

## 📝 Actualizar el Script

1. Abre el archivo: `scripts/insert-mock-data.sql`

2. Busca esta línea (está al principio):
```sql
user_id,
'YOUR_USER_ID', -- Reemplaza con tu user_id
```

3. Reemplaza `YOUR_USER_ID` con tu UUID real:
```sql
user_id,
'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- Tu user_id real
```

---

## 🚀 Ejecutar el Script

### Paso 1: Ve a Supabase SQL Editor

1. Abre https://app.supabase.com
2. Selecciona tu proyecto: `vzcuumrnilzeufizyfei`
3. Click en **SQL Editor** (menú lateral)
4. Click en **New query**

### Paso 2: Copiar y Pegar el Script

1. Abre el archivo: `scripts/insert-mock-data.sql`
2. **Selecciona TODO** el contenido (Ctrl+A)
3. **Copia** (Ctrl+C)
4. **Pega** en el SQL Editor de Supabase (Ctrl+V)

### Paso 3: Ejecutar

1. Click en **Run** (o presiona Ctrl+Enter)
2. Espera a que termine (debería tomar 2-3 segundos)
3. Verás mensajes de confirmación en la parte inferior

---

## ✅ Verificar que Funcionó

### En Supabase Table Editor

1. Ve a **Table Editor**
2. Verifica que las tablas tengan datos:
   - **profiles**: 1 registro (Juan Pérez)
   - **experiences**: 2 registros
   - **education**: 1 registro
   - **languages**: 3 registros
   - **soft_skills**: 4 registros
   - **candidate_references**: 1 registro
   - **applications**: 3 registros
   - **application_stages**: 12 registros
   - **stage_recommendations**: 4 registros
   - **badges**: 3 registros
   - **gamification_data**: 1 registro
   - **user_preferences**: 1 registro

### En tu Aplicación

1. Abre http://localhost:5175/
2. Deberías ver:
   - **Dashboard**: 3 aplicaciones (Fintech Andina, Desarrollos Monterrey, Tech Solutions)
   - **Profile**: Perfil de Juan Pérez con toda su información
   - **Badges**: 3 insignias (Early Bird, Skill Master, Perfect Profile)

---

## 📊 Datos que se Insertan

### Perfil
- **Nombre**: Juan Pérez
- **Email**: juan.perez@example.com
- **País**: México
- **Trade**: Desarrollo de Software

### Experiencia Laboral
1. Tech Startup MX - Desarrollador Full Stack (2022-2025)
2. Agencia Digital - Desarrollador Frontend (2020-2021)

### Educación
- Universidad Nacional Autónoma de México
- Ingeniería en Computación (2020)

### Idiomas
- Español (Nativo)
- Inglés (Avanzado)
- Portugués (Básico)

### Habilidades Blandas
- Trabajo en Equipo
- Liderazgo
- Comunicación
- Resolución de Problemas

### Aplicaciones
1. **Fintech Andina S.A.** - Desarrollador Full Stack Senior (Activa)
2. **Desarrollos Monterrey** - Frontend Developer React (Rechazada con feedback)
3. **Tech Solutions Brasil** - DevOps Engineer (Aprobada)

### Badges
1. Early Bird (común)
2. Skill Master (raro)
3. Perfect Profile (épico)

---

## 🔄 Ejecutar Múltiples Veces

El script usa `ON CONFLICT DO NOTHING`, lo que significa que:
- ✅ Puedes ejecutarlo múltiples veces sin problemas
- ✅ No duplicará datos
- ✅ Solo insertará datos que no existan

---

## 🗑️ Limpiar Datos (Opcional)

Si quieres eliminar todos los datos mock y empezar de nuevo:

```sql
-- CUIDADO: Esto eliminará TODOS los datos
DELETE FROM application_stages WHERE application_id IN ('app-1', 'app-2', 'app-3');
DELETE FROM applications WHERE id IN ('app-1', 'app-2', 'app-3');
DELETE FROM badges WHERE profile_id = 'profile-mock-1';
DELETE FROM gamification_data WHERE profile_id = 'profile-mock-1';
DELETE FROM user_preferences WHERE profile_id = 'profile-mock-1';
DELETE FROM experiences WHERE profile_id = 'profile-mock-1';
DELETE FROM education WHERE profile_id = 'profile-mock-1';
DELETE FROM languages WHERE profile_id = 'profile-mock-1';
DELETE FROM soft_skills WHERE profile_id = 'profile-mock-1';
DELETE FROM candidate_references WHERE profile_id = 'profile-mock-1';
DELETE FROM profiles WHERE id = 'profile-mock-1';
```

---

## 🆘 Solución de Problemas

### Error: "duplicate key value violates unique constraint"
**Solución**: Los datos ya existen. Puedes ignorar este error o limpiar los datos primero.

### Error: "insert or update on table violates foreign key constraint"
**Solución**: Asegúrate de haber reemplazado `YOUR_USER_ID` con un user_id válido.

### Error: "relation does not exist"
**Solución**: Primero ejecuta `database-schema.sql` para crear las tablas.

### No veo los datos en la aplicación
**Solución**: 
1. Verifica que el `user_id` en el script coincida con el usuario autenticado
2. Recarga la aplicación (F5)
3. Verifica la consola del navegador (F12) para errores

---

## 🎯 Resumen

1. ✅ Obtén tu `user_id` de Supabase Authentication
2. ✅ Reemplaza `YOUR_USER_ID` en el script
3. ✅ Ejecuta el script en Supabase SQL Editor
4. ✅ Verifica los datos en Table Editor
5. ✅ Abre la aplicación y disfruta de los datos de prueba

**¡Listo! Ahora tienes datos de demostración en tu base de datos.** 🎉
