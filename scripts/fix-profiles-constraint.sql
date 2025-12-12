-- ============================================
-- ARREGLAR RESTRICCIÓN UNIQUE EN PROFILES
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Agregar restricción UNIQUE en user_id para permitir upserts
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Verificar que se creó correctamente
SELECT 
  constraint_name,
  column_name
FROM information_schema.constraint_column_usage 
WHERE table_name = 'profiles' 
  AND constraint_name = 'profiles_user_id_unique';

-- Mensaje de confirmación
SELECT '✅ Restricción UNIQUE agregada a profiles.user_id' as resultado;