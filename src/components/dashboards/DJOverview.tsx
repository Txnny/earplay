import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListMusic, Calendar, Music } from "lucide-react";
import DJGoLive from "@/components/DJGoLive";

export default function DJOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ playlists: 0, shows: 0, approvedTracks: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { count: playlists } = await supabase.from("playlists").select("id", { count: "exact", head: true }).eq("dj_id", user.id);
      const { count: shows } = await supabase.from("shows").select("id", { count: "exact", head: true }).eq("dj_id", user.id);
      const { count: approvedTracks } = await supabase.from("tracks").select("id", { count: "exact", head: true }).eq("status", "approved");
      setStats({ playlists: playlists ?? 0, shows: shows ?? 0, approvedTracks: approvedTracks ?? 0 });
    };
    load();
  }, [user]);

  const cards = [
    { label: "My Playlists", value: stats.playlists, icon: ListMusic },
    { label: "Scheduled Shows", value: stats.shows, icon: Calendar },
    { label: "Available Tracks", value: stats.approvedTracks, icon: Music },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">DJ Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/50 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <DJGoLive />
    </div>
  );
}
