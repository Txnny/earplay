-- Add stream_url and now_playing to shows
ALTER TABLE public.shows ADD COLUMN IF NOT EXISTS stream_url text;
ALTER TABLE public.shows ADD COLUMN IF NOT EXISTS now_playing text;

-- Station config for global settings (stream URL, station name, etc.)
CREATE TABLE IF NOT EXISTS public.station_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.station_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read config"
  ON public.station_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins manage config"
  ON public.station_config FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default stream URL placeholder
INSERT INTO public.station_config (key, value) VALUES ('stream_url', 'https://your-azuracast-url/listen/station/stream.mp3')
ON CONFLICT (key) DO NOTHING;