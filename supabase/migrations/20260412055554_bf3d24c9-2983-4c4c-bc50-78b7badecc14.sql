
-- 1) Add columns to spins
ALTER TABLE public.spins
  ADD COLUMN IF NOT EXISTS station_shortcode text,
  ADD COLUMN IF NOT EXISTS source_label text,
  ADD COLUMN IF NOT EXISTS started_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS artist text,
  ADD COLUMN IF NOT EXISTS title text;

-- 2) Dedupe unique index on spins
CREATE UNIQUE INDEX IF NOT EXISTS spins_dedupe_uidx
  ON public.spins (station_shortcode, source_label, started_at, artist, title);

-- 3) Add station_shortcode column to shows for station association
ALTER TABLE public.shows
  ADD COLUMN IF NOT EXISTS station_shortcode text;

-- 4) Create station_sync_state table
CREATE TABLE IF NOT EXISTS public.station_sync_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_shortcode text NOT NULL UNIQUE,
  last_polled_at timestamp with time zone,
  last_is_live boolean DEFAULT false,
  last_ingested_spin_at timestamp with time zone,
  last_now_playing text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.station_sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage sync state" ON public.station_sync_state
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read sync state" ON public.station_sync_state
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "Authenticated can read sync state" ON public.station_sync_state
  FOR SELECT TO authenticated
  USING (true);

-- 5) Create unmatched_spin_events table
CREATE TABLE IF NOT EXISTS public.unmatched_spin_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  station_shortcode text NOT NULL,
  artist text,
  title text,
  started_at timestamp with time zone,
  raw_payload jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.unmatched_spin_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage unmatched spins" ON public.unmatched_spin_events
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 6) Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
