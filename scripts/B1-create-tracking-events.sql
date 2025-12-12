-- ============================================
-- MIGRACIÓN: CREAR TABLA TRACKING_EVENTS
-- ============================================

CREATE TABLE IF NOT EXISTS tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB DEFAULT '{}'::jsonb,
  triggered_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_application_id ON tracking_events(application_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_type ON tracking_events(event_type);

-- RLS
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view tracking events of own applications" ON tracking_events;
CREATE POLICY "Users can view tracking events of own applications"
  ON tracking_events FOR ALL
  USING (
    application_id IN (
      SELECT id FROM applications WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

DO $$
BEGIN
  RAISE NOTICE '✅ Tabla tracking_events creada exitosamente';
END $$;
