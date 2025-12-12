-- ==============================================================================
-- Script para corregir problemas de RLS en la tabla notifications
-- ERROR: new row violates row-level security policy for table "notifications"
-- ==============================================================================

-- 1. Asegurar que tenemos la política para INSERT
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (candidate_id = auth.uid()::text);

-- 2. Asegurar que tenemos la política para SELECT (ya debería existir, pero por seguridad)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (candidate_id = auth.uid()::text);

-- 3. Asegurar que tenemos la política para UPDATE
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (candidate_id = auth.uid()::text);

-- 4. Verificar configuración
DO $$
BEGIN
  RAISE NOTICE '✅ Políticas de seguridad actualizadas para la tabla notifications';
  RAISE NOTICE '   - Users can now INSERT own notifications';
END $$;
