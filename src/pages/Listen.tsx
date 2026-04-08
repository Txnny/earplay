import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LivePlayer from "@/components/LivePlayer";
import { Radio, Calendar } from "lucide-react";

interface Show {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  is_live: boolean;
  now_playing: string | null;
}

// 24-hour programming grid from concept
const DEFAULT_GRID = [
  { time: "00:00 – 06:00", title: "The Overnight Drift", desc: "Ambient, lo-fi, experimental — algorithmically curated from submissions" },
  { time: "06:00 – 10:00", title: "Morning Frequency", desc: "Soul, jazz, afrobeats, global sounds — hosted, with artist spotlights" },
  { time: "10:00 – 13:00", title: "The Submission Drop", desc: "Live listener votes on new submissions. Best track gets added to rotation" },
  { time: "13:00 – 17:00", title: "Midday Selectors", desc: "Guest DJs — independent curators from different cities & scenes" },
  { time: "17:00 – 20:00", title: "Rush Hour Roots", desc: "Hip-hop, reggae, dancehall, grime — emerging voices only" },
  { time: "20:00 – 23:00", title: "Prime Time Underground", desc: "Flagship slot — featured artist interviews + full project playbacks" },
  { time: "23:00 – 00:00", title: "Last Transmission", desc: "Weekly recap, top-spun tracks, upcoming artist news" },
];

export default function Listen() {
  const [shows, setShows] = useState<Show[]>([]);
  const [liveShow, setLiveShow] = useState<Show | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("shows")
        .select("id, title, description, starts_at, ends_at, is_live, now_playing")
        .gte("ends_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(20);
      const all = data ?? [];
      setLiveShow(all.find((s) => s.is_live) ?? null);
      setShows(all.filter((s) => !s.is_live));
    };
    load();
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-gradient">WAVEFORM</Link>
          <div className="flex items-center gap-4">
            <Link to="/pricing"><Button variant="ghost" size="sm">Pricing</Button></Link>
            <Link to="/auth"><Button variant="ghost" size="sm">Sign In</Button></Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 container max-w-3xl space-y-10">
        {/* Live Now */}
        {liveShow ? (
          <div className="border-l-[3px] border-primary pl-4 space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="signal-dot" />
              <span className="font-mono-accent text-primary">LIVE NOW</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">{liveShow.title}</h2>
            {liveShow.now_playing && (
              <p className="text-muted-foreground">🎵 {liveShow.now_playing}</p>
            )}
          </div>
        ) : (
          <div className="border-l-[3px] border-muted pl-4 space-y-3">
            <Radio className="w-8 h-8 text-muted-foreground" />
            <h2 className="text-2xl font-bold">No show live right now</h2>
            <p className="text-muted-foreground text-sm">Check the schedule below for upcoming shows.</p>
          </div>
        )}

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
