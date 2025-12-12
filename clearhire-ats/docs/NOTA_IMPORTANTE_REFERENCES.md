# ⚠️ Nota Importante: Tabla "references" Renombrada

## 🔧 Cambio Realizado

La tabla `references` ha sido renombrada a **`candidate_references`**

### ¿Por qué?

`references` es una **palabra reservada en SQL** (se usa para definir foreign keys).

Al intentar crear una tabla con ese nombre, PostgreSQL/Supabase genera un error:
```
ERROR: 42601: syntax error at or near "references"
```

### ✅ Solución

La tabla ahora se llama: **`candidate_references`**

### 📝 Impacto en el Código

Si tu aplicación usa esta tabla, necesitarás actualizar las referencias en el código:

**Antes:**
```typescript
const { data } = await supabase
  .from('references')
  .select('*');
```

**Después:**
```typescript
const { data } = await supabase
  .from('candidate_references')
  .select('*');
```

### 🎯 Alternativa (No Recomendada)

Podrías usar comillas dobles para escapar el nombre:
```sql
CREATE TABLE IF NOT EXISTS "references" (...)
```

Pero esto **NO es recomendado** porque:
- Siempre tendrías que usar comillas dobles al referenciar la tabla
- Es propenso a errores
- Va contra las mejores prácticas de SQL

### ✅ Mejor Práctica

Usar nombres descriptivos que no sean palabras reservadas:
- ✅ `candidate_references`
- ✅ `user_references`
- ✅ `professional_references`

---

## 📊 Estado Actual

- ✅ Schema SQL corregido
- ✅ Documentación actualizada
- ✅ Sin errores de sintaxis
- ✅ Listo para ejecutar en Supabase

**El schema ahora se ejecutará sin problemas.** 🎉
