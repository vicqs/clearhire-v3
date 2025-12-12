-- ============================================
-- SEED DATA: OFERTAS DE TRABAJO
-- ============================================

-- Variable con el user_id (REEMPLAZAR CON TU UUID SI ES DIFERENTE)
DO $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
  v_offer_id UUID;
BEGIN
  -- Intentar obtener el ID del usuario actual (esto funcionará si corres el script autenticado o hardcodealo)
  -- Para este script de ejemplo, buscaremos el perfil creado anteriormente
  SELECT user_id, id INTO v_user_id, v_profile_id 
  FROM profiles 
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RAISE NOTICE '⚠️ No se encontró perfil. Ejecuta primero insert-mock-data-simple.sql';
    RETURN;
  END IF;

  -- 1. INSERTAR OFERTAS
  
  -- Oferta 1: Tech Startup (Pendiente)
  INSERT INTO job_offers (
    profile_id,
    application_id,
    company_name,
    position_title,
    fixed_salary,
    -- max_fixed_salary removed
    salary_min,
    salary_max,
    currency,
    country,
    offer_date,
    expiration_date,
    status,
    negotiation_notes
  ) VALUES (
    v_profile_id,
    'job-101',
    'Tech Startup MX',
    'Senior Frontend Developer',
    NULL,
    -- NULL for max_fixed_salary removed
    4500000,
    5500000,
    'CRC',
    'CR',
    NOW(),
    NOW() + INTERVAL '7 days',
    'pending',
    'Oferta inicial recibida'
  ) RETURNING id INTO v_offer_id;

  -- Beneficios oferta 1
  INSERT INTO offer_benefits (offer_id, name, category, estimated_value, currency) VALUES
  (v_offer_id, 'Seguro Médico Privado', 'health', 150000, 'CRC'),
  (v_offer_id, 'Trabajo Remoto', 'wellness', 100000, 'CRC'),
  (v_offer_id, 'Bono Anual', 'financial', 2000000, 'CRC');

  -- Oferta 2: Enterprise Corp (Aceptada)
  INSERT INTO job_offers (
    profile_id,
    application_id,
    company_name,
    position_title,
    fixed_salary,
    currency,
    country,
    offer_date,
    expiration_date,
    status,
    negotiation_notes
  ) VALUES (
    v_profile_id,
    'job-102',
    'Global Enterprise',
    'Tech Lead',
    3500,
    'USD',
    'CR',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '2 days',
    'accepted',
    'Oferta aceptada el 12/12/2024'
  );

  RAISE NOTICE '✅ Ofertas de ejemplo insertadas correctamente para el perfil %', v_profile_id;

END $$;
