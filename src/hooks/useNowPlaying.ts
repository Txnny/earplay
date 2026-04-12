import { useEffect, useState } from "react";

const API_URL = "https://stream.surfacedradio.com/api/nowplaying/selectsoundsradio";
const POLL_INTERVAL = 30_000;

export interface NowPlayingData {
  isOnAir: boolean;
  songTitle: string;
  songArtist: string;
  streamerName: string;
  listeners: number;
  albumArt: string | null;
}

export function useNowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null);

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const res = await fetch(API_URL);
        const station = await res.json();
        if (!station) return;

        const isOnAir = station.is_online === true || station.live?.is_live === true;
        setData({
          isOnAir,
          songTitle: station.now_playing?.song?.title ?? "",
          songArtist: station.now_playing?.song?.artist ?? "",
          streamerName: station.live?.streamer_name || station.station?.name || "Surfaced Radio",
          listeners: station.listeners?.current ?? 0,
          albumArt: station.now_playing?.song?.art ?? null,
        });
      } catch (error) {
        console.error("Failed to fetch now playing data:", error);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return data;
}
