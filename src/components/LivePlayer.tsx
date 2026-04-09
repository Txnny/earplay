import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX, Play, Pause, Radio } from "lucide-react";
import { useNowPlaying } from "@/hooks/useNowPlaying";

const STREAM_URL = "https://stream.surfacedradio.com/listen/selectsoundsradio/radio.mp3";

export default function LivePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const np = useNowPlaying();

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      audioRef.current.src = "";
    } else {
      audioRef.current.src = STREAM_URL;
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

  const nowPlayingText = np?.songTitle
    ? `${np.songArtist} — ${np.songTitle}`
    : null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-md">
      <audio ref={audioRef} />
      <div className="container flex items-center gap-4 h-16">
        <Button variant="ghost" size="icon" onClick={togglePlay} className="shrink-0">
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          {np?.isOnAir ? (
            <>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                ON AIR
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{np.streamerName}</p>
                {nowPlayingText && (
                  <p className="text-xs text-muted-foreground truncate">🎵 {nowPlayingText}</p>
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
