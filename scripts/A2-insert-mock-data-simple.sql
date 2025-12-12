-- ============================================
-- INSERTAR DATOS MOCK EN SUPABASE (VERSIÓN SIMPLIFICADA)
-- Ejecutar DESPUÉS de crear las tablas
-- ============================================

-- IMPORTANTE: Este script usa un UUID de ejemplo
-- Para obtener tu user_id real de Supabase:
-- 1. Ve a Authentication > Users en el dashboard de Supabase
-- 2. Copia el UUID de tu usuario
-- 3. Reemplaza el valor en la variable a continuación

-- Variable con el user_id (UUID real del usuario creado)
-- UUID del usuario: 9a0ee8bb-7651-4149-ba8c-5b9e62d7e6ff
DO $$
DECLARE
  v_user_id UUID := '9a0ee8bb-7651-4149-ba8c-5b9e62d7e6ff'; -- ✅ UUID REAL
BEGIN

  -- ============================================
  -- 1. INSERTAR PERFIL
  -- ============================================

  -- Insertar o actualizar perfil
  INSERT INTO profiles (
    user_id,
    first_name,
    last_name,
    email,
    phone,
    country,
    trade
  ) VALUES (
    v_user_id,
    'Juan',
    'Pérez',
    'juan.perez@example.com',
    '+52 55 1234 5678',
    'México',
    'Desarrollo de Software'
  ) ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    country = EXCLUDED.country,
    trade = EXCLUDED.trade,
    updated_at = NOW();

  -- ============================================
  -- 2. INSERTAR EXPERIENCIA LABORAL
  -- ============================================

  -- Primero eliminar experiencias existentes para este perfil
  DELETE FROM experiences 
  WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id);

  -- Insertar experiencias
  INSERT INTO experiences (profile_id, company, position, start_date, end_date, description)
  SELECT 
    p.id,
    'Tech Startup MX',
    'Desarrollador Full Stack',
    '2022-01-01',
    '2025-11-01',
    'Desarrollo de aplicaciones web con React, Node.js y PostgreSQL. Implementación de CI/CD con GitHub Actions.'
  FROM profiles p WHERE p.user_id = v_user_id
  UNION ALL
  SELECT 
    p.id,
    'Agencia Digital',
    'Desarrollador Frontend',
    '2020-06-01',
    '2021-12-31',
    'Creación de sitios web responsivos con HTML, CSS, JavaScript y WordPress.'
  FROM profiles p WHERE p.user_id = v_user_id;

  -- ============================================
  -- 3. INSERTAR EDUCACIÓN
  -- ============================================

  DELETE FROM education 
  WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id);

  INSERT INTO education (profile_id, institution, degree, field_of_study, graduation_year)
  SELECT 
    p.id,
    'Universidad Nacional Autónoma de México',
    'Ingeniería en Computación',
    'Ciencias de la Computación',
    '2020'
  FROM profiles p WHERE p.user_id = v_user_id;

  -- ============================================
  -- 4. INSERTAR IDIOMAS
  -- ============================================

  DELETE FROM languages 
  WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id);

  INSERT INTO languages (profile_id, language, proficiency)
  SELECT p.id, 'Español', 'Nativo' FROM profiles p WHERE p.user_id = v_user_id
  UNION ALL
  SELECT p.id, 'Inglés', 'Avanzado' FROM profiles p WHERE p.user_id = v_user_id
  UNION ALL
  SELECT p.id, 'Portugués', 'Básico' FROM profiles p WHERE p.user_id = v_user_id;

  -- ============================================
  -- 5. INSERTAR HABILIDADES BLANDAS
  -- ============================================

  DELETE FROM soft_skills 
  WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id);

  INSERT INTO soft_skills (profile_id, skill)
  SELECT p.id, 'Trabajo en Equipo' FROM profiles p WHERE p.user_id = v_user_id
  UNION ALL
  SELECT p.id, 'Liderazgo' FROM profiles p WHERE p.user_id = v_user_id
  UNION ALL
  SELECT p.id, 'Comunicación' FROM profiles p WHERE p.user_id = v_user_id
  UNION ALL
  SELECT p.id, 'Resolución de Problemas' FROM profiles p WHERE p.user_id = v_user_id;

  -- ============================================
  -- 6. INSERTAR REFERENCIAS
  -- ============================================

  DELETE FROM candidate_references 
  WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id);

  INSERT INTO candidate_references (profile_id, name, email, phone)
  SELECT 
    p.id,
    'María López',
    'maria.lopez@techstartup.mx',
    '+52 55 9876 5432'
  FROM profiles p WHERE p.user_id = v_user_id;

  -- ============================================
  -- 7. INSERTAR BADGES
  -- ============================================

  DELETE FROM badges 
  WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id);

  INSERT INTO badges (profile_id, name, description, icon, earned_at, rarity)
  SELECT p.id, 'Early Bird', 'Aplicaste en las primeras 24 horas', 'sunrise', '2025-11-20', 'common' FROM profiles p WHERE p.user_id = v_user_id
  UNION ALL
  SELECT p.id, 'Skill Master', 'Completaste todas las secciones de habilidades', 'award', '2025-11-22', 'rare' FROM profiles p WHERE p.user_id = v_user_id
  UNION ALL
  SELECT p.id, 'Perfect Profile', 'Alcanzaste 100% de completitud de perfil', 'star', '2025-11-25', 'epic' FROM profiles p WHERE p.user_id = v_user_id;

  -- ============================================
  -- 8. INSERTAR DATOS DE GAMIFICACIÓN
  -- ============================================

  DELETE FROM gamification_data 
  WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id);

  INSERT INTO gamification_data (profile_id, profile_completion, has_fast_pass, ranking, total_applications, success_rate)
  SELECT 
    p.id,
    85.00,
    false,
    42,
    3,
    33.33
  FROM profiles p WHERE p.user_id = v_user_id;

  -- ============================================
  -- 9. INSERTAR PREFERENCIAS DE USUARIO
  -- ============================================

  DELETE FROM user_preferences 
  WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id);

  INSERT INTO user_preferences (profile_id, whatsapp_notifications, email_notifications, language, timezone)
  SELECT 
    p.id,
    true,
    true,
    'es',
    'America/Mexico_City'
  FROM profiles p WHERE p.user_id = v_user_id;

  -- ============================================
  -- VERIFICACIÓN
  -- ============================================

  RAISE NOTICE '✅ Datos insertados correctamente';
  RAISE NOTICE 'Perfiles: %', (SELECT COUNT(*) FROM profiles WHERE user_id = v_user_id);
  RAISE NOTICE 'Experiencias: %', (SELECT COUNT(*) FROM experiences WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id));
  RAISE NOTICE 'Educación: %', (SELECT COUNT(*) FROM education WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id));
  RAISE NOTICE 'Idiomas: %', (SELECT COUNT(*) FROM languages WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id));
  RAISE NOTICE 'Habilidades: %', (SELECT COUNT(*) FROM soft_skills WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id));
  RAISE NOTICE 'Referencias: %', (SELECT COUNT(*) FROM candidate_references WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id));
  RAISE NOTICE 'Badges: %', (SELECT COUNT(*) FROM badges WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = v_user_id));

END $$;
