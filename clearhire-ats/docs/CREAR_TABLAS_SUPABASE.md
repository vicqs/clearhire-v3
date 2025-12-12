# 🗄️ Crear Tablas en Supabase

## Método Recomendado: Copiar y Pegar SQL

### Pasos:

1. **Abre tu proyecto en Supabase**
   - Ve a https://app.supabase.com
   - Selecciona tu proyecto: `vzcuumrnilzeufizyfei`

2. **Abre el SQL Editor**
   - En el menú lateral, busca **"SQL Editor"**
   - Haz clic en **"New query"**

3. **Copia el SQL**
   - Abre el archivo: `scripts/database-schema.sql`
   - Selecciona TODO el contenido (Ctrl+A)
   - Copia (Ctrl+C)

4. **Pega y Ejecuta**
   - Pega el SQL en el editor de Supabase (Ctrl+V)
   - Haz clic en **"Run"** o presiona Ctrl+Enter
   - Espera a que termine (debería tomar 2-3 segundos)

5. **Verifica**
   - Ve a **"Table Editor"** en el menú lateral
   - Deberías ver 21 tablas creadas:
     - ✅ profiles
     - ✅ experiences
     - ✅ education
     - ✅ languages
     - ✅ soft_skills
     - ✅ candidate_references
     - ✅ job_offers
     - ✅ offer_benefits
     - ✅ negotiation_messages
     - ✅ applications
     - ✅ application_stages
     - ✅ stage_recommendations
     - ✅ test_results
     - ✅ test_result_details
     - ✅ badges
     - ✅ user_preferences
     - ✅ gamification_data
     - ✅ time_slots
     - ✅ interview_schedules
     - ✅ notifications
     - ✅ notification_preferences

6. **¡Listo!**
   - Recarga tu aplicación en http://localhost:5175/
   - El indicador de Supabase debería mostrar ✅ "Conectado"

---

## ¿Qué se creó?

### 📊 21 Tablas

1. **profiles** - Información personal del candidato
2. **experiences** - Historial laboral
3. **education** - Educación y certificaciones
4. **languages** - Idiomas que habla
5. **soft_skills** - Habilidades blandas
6. **candidate_references** - Referencias laborales
7. **job_offers** - Ofertas de trabajo recibidas
8. **offer_benefits** - Beneficios de cada oferta
9. **negotiation_messages** - Chat de negociación
10. **applications** - Aplicaciones a trabajos
11. **application_stages** - Etapas del proceso de aplicación
12. **stage_recommendations** - Recomendaciones por etapa
13. **test_results** - Resultados de pruebas técnicas/psicométricas
14. **test_result_details** - Detalles de cada resultado de prueba
15. **badges** - Insignias de gamificación
16. **user_preferences** - Preferencias del usuario
17. **gamification_data** - Datos de gamificación (ranking, completitud)
18. **time_slots** - Horarios disponibles para entrevistas
19. **interview_schedules** - Agendamiento de entrevistas
20. **notifications** - Sistema de notificaciones
21. **notification_preferences** - Preferencias de notificaciones

### 🔒 Seguridad (RLS)

Todas las tablas tienen **Row Level Security** habilitado:
- Los usuarios solo pueden ver sus propios datos
- No pueden acceder a datos de otros usuarios
- Las políticas se aplican automáticamente

### 📈 Índices

Se crearon índices para mejorar el rendimiento:
- Búsquedas por usuario
- Búsquedas por email
- Relaciones entre tablas

---

## Solución de Problemas

### ❌ Error: "relation already exists"
**Solución**: Las tablas ya existen. No necesitas hacer nada.

### ❌ Error: "permission denied"
**Solución**: Asegúrate de estar usando tu proyecto correcto en Supabase.

### ❌ Error: "syntax error"
**Solución**: Asegúrate de copiar TODO el contenido del archivo SQL, desde la primera línea hasta la última.

### ⚠️ El indicador sigue en naranja
**Solución**: 
1. Recarga la página (F5)
2. Verifica que las tablas se crearon en Table Editor
3. Revisa la consola del navegador (F12) para ver errores

---

## Próximos Pasos

Una vez que las tablas estén creadas:

1. ✅ Tu app puede guardar datos reales
2. ✅ Puedes crear usuarios con autenticación
3. ✅ Los datos persisten entre sesiones
4. ✅ Puedes acceder desde cualquier dispositivo

Para empezar a usar Supabase en tu código, consulta:
- `CONEXION_SUPABASE_COMPLETADA.md` - Ejemplos de uso
- `docs/SUPABASE_INTEGRATION_GUIDE.md` - Guía completa

---

## 🎉 ¡Eso es todo!

Una vez ejecutado el SQL, tu aplicación estará completamente conectada a Supabase y lista para guardar datos reales.
