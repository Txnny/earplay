import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2 } from "lucide-react";

interface AudioPreviewProps {
  fileUrl: string | null;
  compact?: boolean;
}

export default function AudioPreview({ fileUrl, compact = false }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return () => { audioRef.current?.pause(); };
  }, []);

  if (!fileUrl) {
    return <span className="text-xs text-muted-foreground italic">No file</span>;
  }

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); } else { audio.play(); }
    setPlaying(!playing);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`flex items-center gap-2 ${compact ? "" : "bg-secondary/30 rounded-lg p-2"}`}>
      <audio
        ref={audioRef}
        src={fileUrl}
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={toggle}>
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
      {!compact && (
        <>
          <Slider
            value={[progress]}
            max={duration || 1}
            step={0.1}
            className="flex-1 min-w-[80px]"
            onValueChange={([v]) => {
              if (audioRef.current) audioRef.current.currentTime = v;
              setProgress(v);
            }}
          />
          <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
            {fmt(progress)}
          </span>
        </>
      )}
    </div>
  );
}
