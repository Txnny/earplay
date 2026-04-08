-- Allow anon to read shows for the public listen page
CREATE POLICY "Shows viewable by anyone" ON public.shows FOR SELECT TO anon USING (true);

-- Allow anon to read station config (stream URL)
CREATE POLICY "Anyone can read config" ON public.station_config FOR SELECT TO anon USING (true);