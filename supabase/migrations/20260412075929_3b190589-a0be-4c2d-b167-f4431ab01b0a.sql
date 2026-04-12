-- Fix playlist_tracks: replace ALL policy with explicit per-command policies
DROP POLICY IF EXISTS "DJs manage own playlist tracks" ON public.playlist_tracks;

CREATE POLICY "DJs select own playlist tracks"
ON public.playlist_tracks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM playlists
    WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.dj_id = auth.uid()
  )
);

CREATE POLICY "DJs insert own playlist tracks"
ON public.playlist_tracks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM playlists
    WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.dj_id = auth.uid()
  )
);

CREATE POLICY "DJs delete own playlist tracks"
ON public.playlist_tracks
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM playlists
    WHERE playlists.id = playlist_tracks.playlist_id
      AND playlists.dj_id = auth.uid()
  )
);

-- Admins can manage all playlist tracks
CREATE POLICY "Admins manage all playlist tracks"
ON public.playlist_tracks
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add UPDATE/DELETE storage policies for artists
CREATE POLICY "Artists update own tracks"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'tracks' AND has_role(auth.uid(), 'artist'::app_role));

CREATE POLICY "Artists delete own tracks"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'tracks' AND has_role(auth.uid(), 'artist'::app_role));