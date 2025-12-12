-- ============================================
-- MIGRACIÓN DE DATOS: OFERTAS MOCK A SUPABASE
-- ============================================

DO $$
DECLARE
  v_user_id UUID;
  v_profile_id UUID;
  v_offer_bn_id UUID;
  v_offer_mutual_id UUID;
  v_offer_accenture_id UUID;
  v_offer_intel_id UUID;
  v_offer_gorilla_id UUID;
BEGIN
  -- 1. Obtener el perfil del usuario actual (o el primero que encuentre)
  SELECT user_id, id INTO v_user_id, v_profile_id 
  FROM profiles 
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RAISE NOTICE '⚠️ No se encontró perfil. Ejecuta primero insert-mock-data-simple.sql';
    RETURN;
  END IF;

  RAISE NOTICE 'Iniciando migración de ofertas para perfil %', v_profile_id;

  -- Limpiar ofertas anteriores para evitar duplicados en esta prueba
  DELETE FROM offer_benefits WHERE offer_id IN (SELECT id FROM job_offers WHERE profile_id = v_profile_id);
  DELETE FROM negotiation_messages WHERE offer_id IN (SELECT id FROM job_offers WHERE profile_id = v_profile_id);
  DELETE FROM job_offers WHERE profile_id = v_profile_id;

  -- 2. INSERTAR OFERTA 1: Banco Nacional (Aceptada según solicitud del usuario)
  INSERT INTO job_offers (
    profile_id, application_id, company_name, position_title, 
    salary_min, salary_max, currency, country, 
    offer_date, expiration_date, status, negotiation_notes
  ) VALUES (
    v_profile_id, 'app_1', 'Banco Nacional de Costa Rica', 'Desarrollador Full Stack Senior',
    1850000, 2400000, 'CRC', 'CR',
    NOW() - INTERVAL '2 days', NOW() + INTERVAL '12 days', 'accepted', -- Marcada como aceptada
    'Oferta aceptada - Esperando contrato'
  ) RETURNING id INTO v_offer_bn_id;

  INSERT INTO offer_benefits (offer_id, name, category, estimated_value, currency) VALUES
  (v_offer_bn_id, 'Seguro Médico', 'health', 0, 'CRC'),
  (v_offer_bn_id, 'Seguro Dental', 'health', 0, 'CRC'),
  (v_offer_bn_id, 'Seguro de Vida', 'financial', 0, 'CRC'),
  (v_offer_bn_id, 'Vales de Despensa', 'financial', 0, 'CRC'),
  (v_offer_bn_id, 'Asignación Transporte', 'transport', 0, 'CRC'),
  (v_offer_bn_id, 'Presupuesto Educación', 'education', 0, 'CRC'),
  (v_offer_bn_id, 'Aguinaldo', 'financial', 0, 'CRC'),
  (v_offer_bn_id, 'Bono Vacacional', 'financial', 0, 'CRC'),
  (v_offer_bn_id, 'Horario Flexible', 'wellness', 0, 'CRC');

  -- 3. INSERTAR OFERTA 2: Grupo Mutual (Pendiente)
  INSERT INTO job_offers (
    profile_id, application_id, company_name, position_title, 
    fixed_salary, currency, country, 
    offer_date, expiration_date, status, negotiation_notes
  ) VALUES (
    v_profile_id, 'app_2', 'Grupo Mutual Alajuela La Vivienda', 'Desarrollador Frontend React',
    1650000, 'CRC', 'CR',
    NOW() - INTERVAL '1 day', NOW() + INTERVAL '13 days', 'pending',
    'Oferta reciente - Considera negociar'
  ) RETURNING id INTO v_offer_mutual_id;

  INSERT INTO offer_benefits (offer_id, name, category, estimated_value, currency) VALUES
  (v_offer_mutual_id, 'Seguro Médico', 'health', 0, 'CRC'),
  (v_offer_mutual_id, 'Seguro Dental', 'health', 0, 'CRC'),
  (v_offer_mutual_id, 'Vales de Despensa', 'financial', 0, 'CRC'),
  (v_offer_mutual_id, 'Asignación Transporte', 'transport', 0, 'CRC'),
  (v_offer_mutual_id, 'Aguinaldo', 'financial', 0, 'CRC'),
  (v_offer_mutual_id, 'Bono Vacacional', 'financial', 0, 'CRC'),
  (v_offer_mutual_id, 'Trabajo Remoto', 'wellness', 0, 'CRC');

  -- 4. INSERTAR OFERTA 3: Accenture (Pendiente)
  INSERT INTO job_offers (
    profile_id, application_id, company_name, position_title, 
    salary_min, salary_max, currency, country, 
    offer_date, expiration_date, status, negotiation_notes
  ) VALUES (
    v_profile_id, 'app_3', 'Accenture Costa Rica', 'UX/UI Designer Senior',
    1950000, 2650000, 'CRC', 'CR',
    NOW(), NOW() + INTERVAL '14 days', 'pending',
    'Excelente paquete de beneficios'
  ) RETURNING id INTO v_offer_accenture_id;

  INSERT INTO offer_benefits (offer_id, name, category, estimated_value, currency) VALUES
  (v_offer_accenture_id, 'Seguro Médico', 'health', 0, 'CRC'),
  (v_offer_accenture_id, 'Seguro Dental', 'health', 0, 'CRC'),
  (v_offer_accenture_id, 'Gimnasio', 'wellness', 0, 'CRC'),
  (v_offer_accenture_id, 'Vales de Despensa', 'financial', 0, 'CRC'),
  (v_offer_accenture_id, 'Asignación Transporte', 'transport', 0, 'CRC'),
  (v_offer_accenture_id, 'Presupuesto Educación', 'education', 0, 'CRC'),
  (v_offer_accenture_id, 'Seguro de Vida', 'financial', 0, 'CRC'),
  (v_offer_accenture_id, 'Aguinaldo', 'financial', 0, 'CRC'),
  (v_offer_accenture_id, 'Bono Vacacional', 'financial', 0, 'CRC'),
  (v_offer_accenture_id, 'Horario Flexible', 'wellness', 0, 'CRC'),
  (v_offer_accenture_id, 'Trabajo Remoto', 'wellness', 0, 'CRC');

  -- 5. INSERTAR OFERTA 4: Intel (Aceptada)
  INSERT INTO job_offers (
    profile_id, application_id, company_name, position_title, 
    fixed_salary, currency, country, 
    offer_date, expiration_date, status, negotiation_notes
  ) VALUES (
    v_profile_id, 'app_4', 'Intel Costa Rica', 'Ingeniero de Software Backend',
    2200000, 'CRC', 'CR',
    NOW() - INTERVAL '10 days', NOW() + INTERVAL '5 days', 'accepted',
    'Contrato firmado - Inicio: 1 de febrero'
  ) RETURNING id INTO v_offer_intel_id;

  INSERT INTO offer_benefits (offer_id, name, category, estimated_value, currency) VALUES
  (v_offer_intel_id, 'Seguro Médico', 'health', 0, 'CRC'),
  (v_offer_intel_id, 'Seguro Dental', 'health', 0, 'CRC'),
  (v_offer_intel_id, 'Seguro de Vida', 'financial', 0, 'CRC'),
  (v_offer_intel_id, 'Gimnasio', 'wellness', 0, 'CRC'),
  (v_offer_intel_id, 'Vales de Despensa', 'financial', 0, 'CRC'),
  (v_offer_intel_id, 'Asignación Transporte', 'transport', 0, 'CRC'),
  (v_offer_intel_id, 'Presupuesto Educación', 'education', 0, 'CRC'),
  (v_offer_intel_id, 'Aguinaldo', 'financial', 0, 'CRC'),
  (v_offer_intel_id, 'Bono Vacacional', 'financial', 0, 'CRC'),
  (v_offer_intel_id, 'Horario Flexible', 'wellness', 0, 'CRC'),
  (v_offer_intel_id, 'Trabajo Remoto', 'wellness', 0, 'CRC');

  -- 6. INSERTAR OFERTA 5: Gorilla Logic (Negociando)
  INSERT INTO job_offers (
    profile_id, application_id, company_name, position_title, 
    salary_min, salary_max, currency, country, 
    offer_date, expiration_date, status, negotiation_notes
  ) VALUES (
    v_profile_id, 'app_5', 'Gorilla Logic', 'Tech Lead Full Stack',
    2800000, 3500000, 'CRC', 'CR',
    NOW() - INTERVAL '5 days', NOW() + INTERVAL '9 days', 'negotiating',
    'En negociación'
  ) RETURNING id INTO v_offer_gorilla_id;

  INSERT INTO offer_benefits (offer_id, name, category, estimated_value, currency) VALUES
  (v_offer_gorilla_id, 'Seguro Médico', 'health', 0, 'CRC'),
  (v_offer_gorilla_id, 'Seguro Dental', 'health', 0, 'CRC'),
  (v_offer_gorilla_id, 'Seguro de Vida', 'financial', 0, 'CRC'),
  (v_offer_gorilla_id, 'Gimnasio', 'wellness', 0, 'CRC'),
  (v_offer_gorilla_id, 'Vales de Despensa', 'financial', 0, 'CRC'),
  (v_offer_gorilla_id, 'Presupuesto Educación', 'education', 0, 'CRC'),
  (v_offer_gorilla_id, 'Aguinaldo', 'financial', 0, 'CRC'),
  (v_offer_gorilla_id, 'Bono Vacacional', 'financial', 0, 'CRC'),
  (v_offer_gorilla_id, 'Horario Flexible', 'wellness', 0, 'CRC'),
  (v_offer_gorilla_id, 'Trabajo Remoto', 'wellness', 0, 'CRC');

  RAISE NOTICE '✅ Se han migrado las 5 ofertas mock a Supabase exitosamente.';

END $$;
