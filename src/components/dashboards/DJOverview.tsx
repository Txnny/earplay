import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { ListMusic, Calendar, Music, Wifi } from "lucide-react";
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
    { label: "MY PLAYLISTS", value: stats.playlists, icon: ListMusic },
    { label: "SCHEDULED SHOWS", value: stats.shows, icon: Calendar },
    { label: "AVAILABLE TRACKS", value: stats.approvedTracks, icon: Music },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="signal-dot" />
        <h1 className="text-2xl font-bold tracking-tight">DJ Dashboard</h1>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="card-brutal">
            <div className="font-mono-accent text-muted-foreground mb-2">{c.label}</div>
            <div className="text-xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <DJGoLive />
        <div className="space-y-3">
          <div className="section-label">Quick Links</div>
          {[
            { to: "/dashboard/library", icon: Music, label: "Browse Track Library", desc: "Find approved tracks for your sets" },
            { to: "/dashboard/playlists", icon: ListMusic, label: "Manage Playlists", desc: "Create & organize your playlists" },
            { to: "/dashboard/schedule", icon: Calendar, label: "Show Schedule", desc: "Plan & publish your upcoming shows" },
          ].map((l) => (
            <Link key={l.to} to={l.to}>
              <div className="card-brutal hover:border-primary/30 transition-colors cursor-pointer flex items-center gap-3">
                <l.icon className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <h4 className="font-mono-accent text-foreground text-xs">{l.label}</h4>
                  <p className="text-xs text-muted-foreground">{l.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
