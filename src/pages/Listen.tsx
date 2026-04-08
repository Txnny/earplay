import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LivePlayer from "@/components/LivePlayer";
import { Radio, Calendar, ArrowLeft } from "lucide-react";

interface Show {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  is_live: boolean;
  now_playing: string | null;
}

export default function Listen() {
  const [shows, setShows] = useState<Show[]>([]);
  const [liveShow, setLiveShow] = useState<Show | null>(null);

  useEffect(() => {
    const load = async () => {
      // Upcoming shows
      const { data } = await supabase
        .from("shows")
        .select("id, title, starts_at, ends_at, is_live, now_playing")
        .gte("ends_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(10);
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
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 container max-w-3xl space-y-10">
        {/* Live Now */}
        {liveShow ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-8 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              LIVE NOW
            </div>
            <h2 className="text-3xl font-bold">{liveShow.title}</h2>
            {liveShow.now_playing && (
              <p className="text-muted-foreground">🎵 {liveShow.now_playing}</p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center space-y-4">
            <Radio className="w-10 h-10 text-muted-foreground mx-auto" />
            <h2 className="text-2xl font-bold">No show live right now</h2>
            <p className="text-muted-foreground">Check the schedule below for upcoming shows.</p>
          </div>
        )}

        {/* Upcoming Schedule */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Shows
          </h3>
          {shows.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming shows scheduled.</p>
          ) : (
            <div className="space-y-3">
              {shows.map((s) => (
                <Card key={s.id} className="border-border/50 bg-card/50">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(s.starts_at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                        {" · "}
                        {new Date(s.starts_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        {" – "}
                        {new Date(s.ends_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Player */}
      <LivePlayer />
    </div>
  );
}
