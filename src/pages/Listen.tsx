import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LivePlayer from "@/components/LivePlayer";
import { Radio, Calendar, Users, ExternalLink } from "lucide-react";
import { useNowPlaying } from "@/hooks/useNowPlaying";

interface Show {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  is_live: boolean;
  now_playing: string | null;
}

const DEFAULT_GRID = [
  { time: "00:00 – 06:00", title: "The Overnight Drift", desc: "Ambient, lo-fi, experimental — algorithmically curated from submissions" },
  { time: "06:00 – 10:00", title: "Morning Frequency", desc: "Soul, jazz, afrobeats, global sounds — hosted, with artist spotlights" },
  { time: "10:00 – 13:00", title: "The Submission Drop", desc: "Live listener votes on new submissions. Best track gets added to rotation" },
  { time: "13:00 – 17:00", title: "Midday Selectors", desc: "Guest DJs — independent curators from different cities & scenes" },
  { time: "17:00 – 20:00", title: "Rush Hour Roots", desc: "Hip-hop, reggae, dancehall, grime — emerging voices only" },
  { time: "20:00 – 23:00", title: "Prime Time Underground", desc: "Flagship slot — featured artist interviews + full project playbacks" },
  { time: "23:00 – 00:00", title: "Last Transmission", desc: "Weekly recap, top-spun tracks, upcoming artist news" },
];

const DJ_URL = "https://stream.surfacedradio.com/public/selectsoundsradio/dj";
const SCHEDULE_URL = "https://stream.surfacedradio.com/public/selectsoundsradio/schedule";

export default function Listen() {
  const [shows, setShows] = useState<Show[]>([]);
  const np = useNowPlaying();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("shows")
        .select("id, title, description, starts_at, ends_at, is_live, now_playing")
        .gte("ends_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(20);
      setShows(data ?? []);
    };
    load();
  }, []);

  const nowPlayingText = np?.songTitle
    ? `${np.songArtist} — ${np.songTitle}`
    : null;

  return (
    <div className="min-h-screen pb-20">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-gradient">SURFACED RADIO</Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing"><Button variant="ghost" size="sm">Pricing</Button></Link>
            <Link to="/auth"><Button variant="ghost" size="sm">Sign In</Button></Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 container max-w-3xl space-y-10">
        {/* Live Now — from AzuraCast API */}
        {np?.isOnAir ? (
          <div className="border-l-[3px] border-primary pl-4 space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="signal-dot" />
              <span className="font-mono-accent text-primary">ON AIR</span>
              {np.listeners > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-2">
                  <Users className="w-3 h-3" /> {np.listeners}
                </span>
              )}
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{np.streamerName}</h2>
            {nowPlayingText && (
              <p className="text-muted-foreground">🎵 {nowPlayingText}</p>
            )}
            {np.albumArt && (
              <img src={np.albumArt} alt="Album art" className="w-24 h-24 rounded-md object-cover" />
            )}
          </div>
        ) : (
          <div className="border-l-[3px] border-muted pl-4 space-y-3">
            <Radio className="w-8 h-8 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Off Air</h2>
            <p className="text-muted-foreground text-sm">Check the schedule below for upcoming shows.</p>
          </div>
        )}

        {/* Quick links */}
        <div className="flex gap-3 flex-wrap">
          <a href={DJ_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              DJ Connect <ExternalLink className="w-3 h-3" />
            </Button>
          </a>
          <a href={SCHEDULE_URL} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              Full Schedule <ExternalLink className="w-3 h-3" />
            </Button>
          </a>
        </div>

        {/* Upcoming Scheduled Shows */}
        {shows.length > 0 && (
          <div className="space-y-4">
            <div className="section-label flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Upcoming Shows
            </div>
            <div className="space-y-2">
              {shows.map((s) => (
                <div key={s.id} className="card-brutal flex items-start gap-4">
                  <div className="font-mono-accent text-primary min-w-[80px] pt-0.5">
                    {new Date(s.starts_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{s.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.starts_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      {" – "}
                      {new Date(s.ends_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 24-Hour Programming Grid */}
        <div className="space-y-4">
          <div className="section-label">24-Hour Programming Grid</div>
          <div className="space-y-0">
            {DEFAULT_GRID.map((slot) => (
              <div key={slot.time} className="flex items-start gap-4 py-3 border-b border-border/20">
                <div className="font-mono-accent text-primary min-w-[100px] pt-0.5">{slot.time}</div>
                <div>
                  <h4 className="font-medium text-sm">{slot.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{slot.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LivePlayer />
    </div>
  );
}
