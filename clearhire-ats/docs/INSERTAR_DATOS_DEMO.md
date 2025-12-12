# 📊 Insertar Datos de Demostración

## 🎯 Script Simplificado

He creado un script más simple que no requiere UUIDs manuales.

---

## 🚀 Pasos Rápidos

### 1. Obtener tu User ID

**Opción A: Crear usuario de prueba**

En Supabase Dashboard:
1. Ve a **Authentication** → **Users**
2. Click en **Add user** → **Create new user**
3. Email: `juan.perez@example.com`
4. Password: `Test123456!`
5. Click **Create user**
6. **Copia el UID** (ejemplo: `550e8400-e29b-41d4-a716-446655440000`)

**Opción B: Usar SQL para crear usuario**

```sql
-- Ejecuta esto primero en SQL Editor
SELECT auth.uid(); -- Si ya estás autenticado, esto te da tu ID
```

### 2. Actualizar el Script

1. Abre: `scripts/insert-mock-data-simple.sql`
2. Busca **todas** las líneas que dicen `'YOUR_USER_ID'` (hay varias)
3. Reemplaza con tu UUID real:

**Antes:**
```sql
'YOUR_USER_ID'
```

**Después:**
```sql
'550e8400-e29b-41d4-a716-446655440000'
```

**Tip**: Usa buscar y reemplazar (Ctrl+H) para cambiar todas a la vez.

### 3. Ejecutar el Script

1. Ve a Supabase → **SQL Editor**
2. Copia TODO el contenido de `insert-mock-data-simple.sql`
3. Pega en el editor
4. Click en **Run**
5. Espera 2-3 segundos

### 4. Verificar

Al final del script verás una tabla con el resumen:

```
mensaje                          | perfiles | experiencias | educacion | idiomas | habilidades | referencias | badges
✅ Datos insertados correctamente |    1     |      2       |     1     |    3    |      4      |      1      |   3
```

---

## 📊 Datos que se Insertan

### Perfil
- Juan Pérez
- juan.perez@example.com
- México
- Desarrollador Full Stack

### Experiencia (2)
- Tech Startup MX (2022-2025)
- Agencia Digital (2020-2021)

### Educación (1)
- UNAM - Ingeniería en Computación

### Idiomas (3)
- Español (Nativo)
- Inglés (Avanzado)
- Portugués (Básico)

### Habilidades (4)
- Trabajo en Equipo
- Liderazgo
- Comunicación
- Resolución de Problemas

### Referencias (1)
- María López

### Badges (3)
- Early Bird
- Skill Master
- Perfect Profile

### Gamificación
- 85% completitud
- Ranking #42
- 3 aplicaciones totales

---

## ✅ Verificar en la Aplicación

1. Abre http://localhost:5175/
2. Ve a **Profile**
3. Deberías ver el perfil de Juan Pérez con todos sus datos
4. Ve a **Badges**
5. Deberías ver las 3 insignias

---

## 🔄 Ejecutar Múltiples Veces

El script:
- ✅ Elimina datos anteriores antes de insertar
- ✅ Usa `ON CONFLICT` para evitar duplicados
- ✅ Puedes ejecutarlo múltiples veces sin problemas

---

## 🆘 Solución de Problemas

### Error: "invalid input syntax for type uuid"
**Solución**: Asegúrate de reemplazar `'YOUR_USER_ID'` con un UUID válido.

### Error: "violates foreign key constraint"
**Solución**: El user_id no existe en auth.users. Crea el usuario primero en Authentication.

### No veo los datos en la aplicación
**Solución**: 
1. Verifica que el user_id sea correcto
2. Recarga la aplicación (F5)
3. Verifica que `VITE_USE_SUPABASE=true` en .env

---

## 🎉 ¡Listo!

Una vez ejecutado, tu aplicación tendrá datos de demostración reales en Supabase.

**Archivo a usar**: `scripts/insert-mock-data-simple.sql`
