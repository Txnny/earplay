import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Radio, Wifi, WifiOff } from "lucide-react";

export default function DJGoLive() {
  const { user } = useAuth();
  const [liveShowId, setLiveShowId] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Check if DJ has a live show
    supabase
      .from("shows")
      .select("id, now_playing")
      .eq("dj_id", user.id)
      .eq("is_live", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setLiveShowId(data.id);
          setNowPlaying(data.now_playing ?? "");
        }
      });
  }, [user]);

  const goLive = async () => {
    if (!user) return;
    setLoading(true);
    // Create an ad-hoc live show
    const { data, error } = await supabase.from("shows").insert({
      dj_id: user.id,
      title: "Live Session",
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4h default
      is_live: true,
    }).select("id").single();
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setLiveShowId(data.id);
    toast.success("You're live! 🎙️");
  };

  const goOffline = async () => {
    if (!liveShowId) return;
    setLoading(true);
    await supabase.from("shows").update({ is_live: false, ends_at: new Date().toISOString() }).eq("id", liveShowId);
    setLiveShowId(null);
    setNowPlaying("");
    setLoading(false);
    toast.success("You're offline.");
  };

  const updateNowPlaying = async () => {
    if (!liveShowId) return;
    await supabase.from("shows").update({ now_playing: nowPlaying }).eq("id", liveShowId);
    toast.success("Now playing updated");
  };

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          Live Broadcast
        </CardTitle>
        {liveShowId && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            ON AIR
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {liveShowId ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Now Playing</Label>
              <div className="flex gap-2">
                <Input
                  value={nowPlaying}
                  onChange={(e) => setNowPlaying(e.target.value)}
                  placeholder="Artist — Track Title"
                  className="text-sm"
                />
                <Button size="sm" variant="secondary" onClick={updateNowPlaying}>Update</Button>
              </div>
            </div>
            <Button variant="destructive" size="sm" className="w-full gap-2" onClick={goOffline} disabled={loading}>
              <WifiOff className="w-4 h-4" /> Go Offline
            </Button>
          </>
        ) : (
          <Button className="w-full gap-2 glow-sm" onClick={goLive} disabled={loading}>
            <Wifi className="w-4 h-4" /> Go Live
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
