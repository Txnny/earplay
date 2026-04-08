
-- Role enum
CREATE TYPE public.app_role AS ENUM ('artist', 'dj', 'admin');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: users can read their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- RLS: admins can manage all roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  pro_registered BOOLEAN DEFAULT FALSE,
  pro_organization TEXT,
  socials JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tracks table (artist submissions)
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  genre TEXT,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists view own tracks" ON public.tracks
  FOR SELECT TO authenticated USING (auth.uid() = artist_id);
CREATE POLICY "Artists submit tracks" ON public.tracks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = artist_id AND public.has_role(auth.uid(), 'artist'));
CREATE POLICY "DJs view approved tracks" ON public.tracks
  FOR SELECT TO authenticated USING (status = 'approved' AND public.has_role(auth.uid(), 'dj'));
CREATE POLICY "Admins manage all tracks" ON public.tracks
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Playlists table (DJ)
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DJs manage own playlists" ON public.playlists
  FOR ALL TO authenticated USING (auth.uid() = dj_id AND public.has_role(auth.uid(), 'dj'));
CREATE POLICY "Admins view all playlists" ON public.playlists
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Playlist tracks (junction)
CREATE TABLE public.playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "DJs manage own playlist tracks" ON public.playlist_tracks
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_id AND dj_id = auth.uid())
  );

-- Shows / schedule
CREATE TABLE public.shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dj_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  playlist_id UUID REFERENCES public.playlists(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_live BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shows viewable by all authenticated" ON public.shows
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "DJs manage own shows" ON public.shows
  FOR ALL TO authenticated USING (auth.uid() = dj_id AND public.has_role(auth.uid(), 'dj'));
CREATE POLICY "Admins manage all shows" ON public.shows
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Spin log (for royalty tracking)
CREATE TABLE public.spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES public.tracks(id) NOT NULL,
  show_id UUID REFERENCES public.shows(id),
  spun_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INTEGER,
  source TEXT DEFAULT 'manual'
);
ALTER TABLE public.spins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists view spins of own tracks" ON public.spins
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.tracks WHERE id = track_id AND artist_id = auth.uid())
  );
CREATE POLICY "DJs can log spins" ON public.spins
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'dj'));
CREATE POLICY "Admins view all spins" ON public.spins
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for track uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('tracks', 'tracks', false);

CREATE POLICY "Artists upload tracks" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'tracks' AND public.has_role(auth.uid(), 'artist'));
CREATE POLICY "Authenticated users can read tracks" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'tracks');
