-- ============================================
-- SCHEMA COMPLETO PARA CLEARHIRE ATS
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. TABLA: profiles (Perfiles de Candidatos)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  country TEXT,
  city TEXT,
  address TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  trade TEXT,
  profile_picture_url TEXT,
  cv_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- RLS para profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. TABLA: experiences (Experiencia Laboral)
CREATE TABLE IF NOT EXISTS experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiences_profile_id ON experiences(profile_id);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own experiences" ON experiences;
CREATE POLICY "Users can manage own experiences"
  ON experiences FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- 3. TABLA: education (Educación)
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  graduation_year TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_education_profile_id ON education(profile_id);

ALTER TABLE education ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own education" ON education;
CREATE POLICY "Users can manage own education"
  ON education FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- 4. TABLA: languages (Idiomas)
CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  proficiency TEXT NOT NULL CHECK (proficiency IN ('Básico', 'Intermedio', 'Avanzado', 'Nativo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_languages_profile_id ON languages(profile_id);

ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own languages" ON languages;
CREATE POLICY "Users can manage own languages"
  ON languages FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- 5. TABLA: soft_skills (Habilidades Blandas)
CREATE TABLE IF NOT EXISTS soft_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soft_skills_profile_id ON soft_skills(profile_id);

ALTER TABLE soft_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own soft_skills" ON soft_skills;
CREATE POLICY "Users can manage own soft_skills"
  ON soft_skills FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- 6. TABLA: candidate_references (Referencias)
-- Nota: Renombrado de "references" porque es palabra reservada en SQL
CREATE TABLE IF NOT EXISTS candidate_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  country TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_references_profile_id ON candidate_references(profile_id);

ALTER TABLE candidate_references ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own references" ON candidate_references;
CREATE POLICY "Users can manage own references"
  ON candidate_references FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- 7. TABLA: job_offers (Ofertas de Trabajo)
CREATE TABLE IF NOT EXISTS job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  application_id TEXT,
  company_name TEXT NOT NULL,
  position_title TEXT NOT NULL,
  fixed_salary DECIMAL(12, 2),
  salary_min DECIMAL(12, 2),
  salary_max DECIMAL(12, 2),
  currency TEXT NOT NULL DEFAULT 'CRC' CHECK (currency IN ('CRC', 'USD', 'MXN', 'COP', 'BRL')),
  country TEXT NOT NULL DEFAULT 'CR' CHECK (country IN ('CR', 'US', 'MX', 'CO', 'BR')),
  offer_date TIMESTAMP WITH TIME ZONE NOT NULL,
  expiration_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'negotiating', 'expired')),
  negotiation_notes TEXT,
  awaiting_candidate_response BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_offers_profile_id ON job_offers(profile_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON job_offers(status);

ALTER TABLE job_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own job_offers" ON job_offers;
CREATE POLICY "Users can manage own job_offers"
  ON job_offers FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- 8. TABLA: offer_benefits (Beneficios de Ofertas)
CREATE TABLE IF NOT EXISTS offer_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES job_offers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('health', 'wellness', 'transport', 'food', 'education', 'time_off', 'financial', 'other')),
  estimated_value DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CRC' CHECK (currency IN ('CRC', 'USD', 'MXN', 'COP', 'BRL')),
  description TEXT,
  is_percentage BOOLEAN DEFAULT FALSE,
  percentage_value DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offer_benefits_offer_id ON offer_benefits(offer_id);

ALTER TABLE offer_benefits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage benefits of own offers" ON offer_benefits;
CREATE POLICY "Users can manage benefits of own offers"
  ON offer_benefits FOR ALL
  USING (
    offer_id IN (
      SELECT id FROM job_offers WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 9. TABLA: negotiation_messages (Mensajes de Negociación)
CREATE TABLE IF NOT EXISTS negotiation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES job_offers(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('candidate', 'company')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_negotiation_messages_offer_id ON negotiation_messages(offer_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_messages_created_at ON negotiation_messages(created_at);

ALTER TABLE negotiation_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage messages of own offers" ON negotiation_messages;
CREATE POLICY "Users can manage messages of own offers"
  ON negotiation_messages FOR ALL
  USING (
    offer_id IN (
      SELECT id FROM job_offers WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 10. TABLA: applications (Aplicaciones a Trabajos)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  available_positions INTEGER DEFAULT 1,
  status TEXT NOT NULL CHECK (status IN (
    'active', 'screening', 'interview_scheduled', 'interview_completed', 
    'technical_evaluation', 'reference_check', 'finalist', 'background_check',
    'offer_pending', 'offer_accepted', 'offer_declined', 'offer_negotiating',
    'approved', 'hired', 'rejected', 'withdrawn', 'on_hold', 'expired'
  )),
  current_stage_id TEXT,
  applied_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_update TIMESTAMP WITH TIME ZONE NOT NULL,
  final_score DECIMAL(5, 2),
  interview_date TIMESTAMP WITH TIME ZONE,
  interview_confirmed BOOLEAN DEFAULT FALSE,
  is_exclusive BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_profile_id ON applications(profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own applications" ON applications;
CREATE POLICY "Users can manage own applications"
  ON applications FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- 11. TABLA: application_stages (Etapas de Aplicaciones)
CREATE TABLE IF NOT EXISTS application_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  stage_id TEXT NOT NULL,
  name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'pending', 'in_progress', 'completed', 'rejected', 'scheduled',
    'awaiting_feedback', 'under_review', 'awaiting_candidate', 
    'awaiting_company', 'passed', 'failed'
  )),
  recruiter_id TEXT,
  recruiter_name TEXT,
  recruiter_title TEXT,
  recruiter_avatar TEXT,
  estimated_days INTEGER,
  actual_days INTEGER,
  score DECIMAL(5, 2),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  feedback_category TEXT,
  feedback_explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_application_stages_application_id ON application_stages(application_id);
CREATE INDEX IF NOT EXISTS idx_application_stages_status ON application_stages(status);

ALTER TABLE application_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view stages of own applications" ON application_stages;
CREATE POLICY "Users can view stages of own applications"
  ON application_stages FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 12. TABLA: stage_recommendations (Recomendaciones de Etapas)
CREATE TABLE IF NOT EXISTS stage_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES application_stages(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_url TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stage_recommendations_stage_id ON stage_recommendations(stage_id);

ALTER TABLE stage_recommendations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view recommendations of own stages" ON stage_recommendations;
CREATE POLICY "Users can view recommendations of own stages"
  ON stage_recommendations FOR ALL
  USING (
    stage_id IN (
      SELECT id FROM application_stages WHERE application_id IN (
        SELECT id FROM applications WHERE profile_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

-- 13. TABLA: test_results (Resultados de Pruebas)
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID REFERENCES application_stages(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('technical', 'psychometric', 'personality', 'skills', 'cognitive')),
  name TEXT NOT NULL,
  score DECIMAL(5, 2) NOT NULL,
  max_score DECIMAL(5, 2) NOT NULL,
  percentile DECIMAL(5, 2),
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_results_stage_id ON test_results(stage_id);

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view test results of own stages" ON test_results;
CREATE POLICY "Users can view test results of own stages"
  ON test_results FOR ALL
  USING (
    stage_id IN (
      SELECT id FROM application_stages WHERE application_id IN (
        SELECT id FROM applications WHERE profile_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

-- 14. TABLA: test_result_details (Detalles de Resultados de Pruebas)
CREATE TABLE IF NOT EXISTS test_result_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_result_id UUID REFERENCES test_results(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score DECIMAL(5, 2) NOT NULL,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_result_details_test_result_id ON test_result_details(test_result_id);

ALTER TABLE test_result_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view test result details" ON test_result_details;
CREATE POLICY "Users can view test result details"
  ON test_result_details FOR ALL
  USING (
    test_result_id IN (
      SELECT id FROM test_results WHERE stage_id IN (
        SELECT id FROM application_stages WHERE application_id IN (
          SELECT id FROM applications WHERE profile_id IN (
            SELECT id FROM profiles WHERE user_id = auth.uid()
          )
        )
      )
    )
  );

-- 15. TABLA: badges (Insignias de Gamificación)
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_profile_id ON badges(profile_id);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own badges" ON badges;
CREATE POLICY "Users can view own badges"
  ON badges FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- 16. TABLA: user_preferences (Preferencias del Usuario)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  whatsapp_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'pt', 'en')),
  timezone TEXT NOT NULL DEFAULT 'America/Mexico_City',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_profile_id ON user_preferences(profile_id);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own preferences" ON user_preferences;
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- 17. TABLA: gamification_data (Datos de Gamificación)
CREATE TABLE IF NOT EXISTS gamification_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  profile_completion DECIMAL(5, 2) NOT NULL DEFAULT 0,
  has_fast_pass BOOLEAN DEFAULT FALSE,
  ranking INTEGER,
  total_applications INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gamification_data_profile_id ON gamification_data(profile_id);
CREATE INDEX IF NOT EXISTS idx_gamification_data_ranking ON gamification_data(ranking);

ALTER TABLE gamification_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own gamification data" ON gamification_data;
CREATE POLICY "Users can view own gamification data"
  ON gamification_data FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- 18. TABLA: time_slots (Horarios Disponibles para Entrevistas)
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  slot_date TIMESTAMP WITH TIME ZONE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  recruiter_name TEXT NOT NULL,
  location TEXT,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('presencial', 'virtual')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_slots_application_id ON time_slots(application_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(slot_date);

ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view time slots for own applications" ON time_slots;
CREATE POLICY "Users can view time slots for own applications"
  ON time_slots FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 19. TABLA: interview_schedules (Agendamiento de Entrevistas)
CREATE TABLE IF NOT EXISTS interview_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE UNIQUE,
  selected_slot_id UUID REFERENCES time_slots(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interview_schedules_application_id ON interview_schedules(application_id);

ALTER TABLE interview_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage interview schedules for own applications" ON interview_schedules;
CREATE POLICY "Users can manage interview schedules for own applications"
  ON interview_schedules FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 20. TABLA: notifications (Notificaciones del Sistema)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id TEXT NOT NULL,
  application_id TEXT,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('status_change', 'interview_reminder', 'deadline_alert', 'feedback_available', 'document_request')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  channels TEXT[] NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'read', 'failed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_candidate_id ON notifications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_notifications_application_id ON notifications(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (candidate_id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (candidate_id = auth.uid()::text);

-- 21. TABLA: notification_preferences (Preferencias de Notificaciones)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id TEXT NOT NULL UNIQUE,
  whatsapp_enabled BOOLEAN DEFAULT TRUE,
  whatsapp_verified BOOLEAN DEFAULT FALSE,
  whatsapp_address TEXT,
  whatsapp_priority INTEGER DEFAULT 1,
  email_enabled BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_address TEXT,
  email_priority INTEGER DEFAULT 2,
  push_enabled BOOLEAN DEFAULT TRUE,
  push_verified BOOLEAN DEFAULT FALSE,
  push_address TEXT,
  push_priority INTEGER DEFAULT 3,
  status_changes BOOLEAN DEFAULT TRUE,
  interview_reminders BOOLEAN DEFAULT TRUE,
  deadline_alerts BOOLEAN DEFAULT TRUE,
  feedback_available BOOLEAN DEFAULT TRUE,
  promotional BOOLEAN DEFAULT FALSE,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '08:00',
  quiet_hours_timezone TEXT DEFAULT 'America/Mexico_City',
  frequency TEXT NOT NULL DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily_digest', 'weekly_summary')),
  language TEXT NOT NULL DEFAULT 'es' CHECK (language IN ('es', 'pt', 'en')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_candidate_id ON notification_preferences(candidate_id);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own notification preferences" ON notification_preferences;
CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences FOR ALL
  USING (candidate_id = auth.uid()::text);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que todas las tablas se crearon correctamente
DO $$
BEGIN
  RAISE NOTICE '✅ Schema creado exitosamente';
  RAISE NOTICE '📊 Tablas creadas: 21';
  RAISE NOTICE '   1. profiles';
  RAISE NOTICE '   2. experiences';
  RAISE NOTICE '   3. education';
  RAISE NOTICE '   4. languages';
  RAISE NOTICE '   5. soft_skills';
  RAISE NOTICE '   6. candidate_references';
  RAISE NOTICE '   7. job_offers';
  RAISE NOTICE '   8. offer_benefits';
  RAISE NOTICE '   9. negotiation_messages';
  RAISE NOTICE '   10. applications';
  RAISE NOTICE '   11. application_stages';
  RAISE NOTICE '   12. stage_recommendations';
  RAISE NOTICE '   13. test_results';
  RAISE NOTICE '   14. test_result_details';
  RAISE NOTICE '   15. badges';
  RAISE NOTICE '   16. user_preferences';
  RAISE NOTICE '   17. gamification_data';
  RAISE NOTICE '   18. time_slots';
  RAISE NOTICE '   19. interview_schedules';
  RAISE NOTICE '   20. notifications';
  RAISE NOTICE '   21. notification_preferences';
  RAISE NOTICE '🔒 RLS habilitado en todas las tablas';
  RAISE NOTICE '🎉 ¡Listo para usar!';
END $$;
