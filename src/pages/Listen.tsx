import React, { useEffect, useMemo, useRef, useState } from "react";

const STREAM_URL = "https://stream.surfacedradio.com/listen/selectsoundsradio/radio.mp3";
const NOW_PLAYING_API = "https://stream.surfacedradio.com/api/nowplaying/selectsoundsradio";

type NowPlayingItem = {
  is_online?: boolean;
  live?: { is_live?: boolean; streamer_name?: string | null };
  now_playing?: { song?: { title?: string; artist?: string; text?: string } };
  station?: { shortcode?: string; name?: string };
};

export default function ListenPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [isOnAir, setIsOnAir] = useState(false);
  const [stationName, setStationName] = useState("Surfaced Radio");
  const [trackText, setTrackText] = useState("Station Offline");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    let active = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch(NOW_PLAYING_API, { cache: "no-store" });
        const station: NowPlayingItem = await res.json();

        if (!active || !station) return;

        const onAir = Boolean(station.is_online || station.live?.is_live);
        setIsOnAir(onAir);
        setStationName(station.station?.name || "Surfaced Radio");

        const song = station.now_playing?.song;
        const text =
          song?.text ||
          [song?.artist, song?.title].filter(Boolean).join(" - ") ||
          (onAir ? "Live now" : "Station Offline");

        setTrackText(text);
        setLoadingStatus(false);
      } catch {
        if (!active) return;
        setLoadingStatus(false);
        setErrorText("Unable to fetch live status right now.");
      }
    };

    fetchStatus();
    const id = setInterval(fetchStatus, 15000);

    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const badge = useMemo(
    () => (isOnAir ? "ON AIR" : loadingStatus ? "CHECKING" : "OFFLINE"),
    [isOnAir, loadingStatus]
  );

  const togglePlay = async () => {
    setErrorText(null);
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch {
      setErrorText(
        "Playback blocked by browser policy. Click again or interact with page first."
      );
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{stationName}</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              isOnAir
                ? "bg-red-600 text-white"
                : "bg-zinc-700 text-zinc-100"
            }`}
          >
            {badge}
          </span>
        </div>

        <p className="mb-4 text-sm opacity-90">{trackText}</p>

        <audio
          ref={audioRef}
          src={STREAM_URL}
          preload="none"
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />

        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <label className="flex items-center gap-2 text-sm">
            Volume
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
            />
          </label>
        </div>

        {!isOnAir && (
          <div className="mt-6 rounded-xl border border-amber-300/30 bg-amber-200/10 p-4">
            <p className="mb-2 text-sm font-semibold">No show live right now</p>
            <p className="text-sm opacity-90">
              AutoDJ is playing. Hit play to listen!
            </p>
          </div>
        )}

        {errorText && (
          <p className="mt-4 text-sm text-red-300">{errorText}</p>
        )}
      </div>
    </main>
  );
}
