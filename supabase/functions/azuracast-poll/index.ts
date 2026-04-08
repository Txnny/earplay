import { createClient } from "https://esm.sh/@supabase/supabase-js@2.102.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.102.1/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get AzuraCast API URL from station_config
    const { data: config } = await supabase
      .from("station_config")
      .select("value")
      .eq("key", "azuracast_api_url")
      .single();

    if (!config?.value) {
      return new Response(JSON.stringify({ message: "No azuracast_api_url configured" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Poll AzuraCast now-playing endpoint
    const azuraUrl = config.value.replace(/\/$/, "");
    const res = await fetch(`${azuraUrl}/api/nowplaying`);

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: "AzuraCast API error", detail: text }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();

    // AzuraCast returns array of stations or single station
    const stations = Array.isArray(data) ? data : [data];
    const station = stations[0];

    if (!station?.now_playing?.song) {
      return new Response(JSON.stringify({ message: "No song playing" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const song = station.now_playing.song;
    const nowPlaying = `${song.artist} — ${song.title}`;
    const isLive = station.live?.is_live ?? false;

    // Update any currently live show with now_playing metadata
    const { data: liveShows } = await supabase
      .from("shows")
      .select("id")
      .eq("is_live", true);

    if (liveShows && liveShows.length > 0) {
      for (const show of liveShows) {
        await supabase
          .from("shows")
          .update({ now_playing: nowPlaying })
          .eq("id", show.id);
      }
    }

    return new Response(JSON.stringify({ now_playing: nowPlaying, is_live: isLive, updated_shows: liveShows?.length ?? 0 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
