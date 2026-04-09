import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Pause, Radio } from "lucide-react";

export default function LivePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [liveShow, setLiveShow] = useState<{ title: string; now_playing?: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: config } = await supabase
        .from("station_config")
        .select("value")
        .eq("key", "stream_url")
        .single();
      if (config) setStreamUrl(config.value);

      const { data: show } = await supabase
        .from("shows")
        .select("title, now_playing")
        .eq("is_live", true)
        .limit(1)
        .maybeSingle();
      if (show) setLiveShow(show);
    };
    load();

    // Subscribe to live show changes
    const channel = supabase
      .channel("live-shows")
      .on("postgres_changes", { event: "*", schema: "public", table: "shows", filter: "is_live=eq.true" }, (payload) => {
        if (payload.eventType === "DELETE") {
          setLiveShow(null);
        } else {
          const row = payload.new as any;
          setLiveShow({ title: row.title, now_playing: row.now_playing });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current || !streamUrl) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.src = "";
    } else {
      audioRef.current.src = streamUrl;
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  const handleVolume = (val: number[]) => {
    setVolume(val[0]);
    if (audioRef.current) audioRef.current.volume = val[0] / 100;
    if (val[0] > 0 && muted) setMuted(false);
  };

  const toggleMute = () => {
    if (audioRef.current) audioRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-md">
      <audio ref={audioRef} />
      <div className="container flex items-center gap-4 h-16">
        {/* Play/Pause */}
        <Button variant="ghost" size="icon" onClick={togglePlay} className="shrink-0">
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>

        {/* Live indicator + Now Playing */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          {liveShow ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                LIVE
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{liveShow.title}</p>
                {liveShow.now_playing && (
                  <p className="text-xs text-muted-foreground truncate">{liveShow.now_playing}</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Radio className="w-4 h-4" />
              <span className="text-sm">Surfaced Radio</span>
            </div>
          )}
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-36 shrink-0">
          <Button variant="ghost" size="icon" onClick={toggleMute} className="h-8 w-8">
            {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Slider value={[muted ? 0 : volume]} onValueChange={handleVolume} max={100} step={1} className="flex-1" />
        </div>
      </div>
    </div>
  );
}
