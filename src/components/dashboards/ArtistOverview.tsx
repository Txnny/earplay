import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, BarChart3, Clock, CheckCircle, Upload, DollarSign } from "lucide-react";

const RATE_PER_SPIN = 0.0024;

export default function ArtistOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, spins: 0, royalty: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: tracks } = await supabase.from("tracks").select("id, status").eq("artist_id", user.id);
      const total = tracks?.length ?? 0;
      const approved = tracks?.filter((t) => t.status === "approved").length ?? 0;
      const pending = tracks?.filter((t) => t.status === "pending").length ?? 0;

      const trackIds = tracks?.map((t) => t.id) ?? [];
      let spins = 0;
      if (trackIds.length > 0) {
        const { count } = await supabase.from("spins").select("id", { count: "exact", head: true }).in("track_id", trackIds);
        spins = count ?? 0;
      }
      setStats({ total, approved, pending, spins, royalty: spins * RATE_PER_SPIN });
    };
    load();
  }, [user]);

  const cards = [
    { label: "TOTAL TRACKS", value: String(stats.total), icon: Music },
    { label: "APPROVED", value: String(stats.approved), icon: CheckCircle },
    { label: "PENDING", value: String(stats.pending), icon: Clock },
    { label: "TOTAL SPINS", value: stats.spins.toLocaleString(), icon: BarChart3 },
    { label: "EST. ROYALTIES", value: `$${stats.royalty.toFixed(2)}`, icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="signal-dot" />
        <h1 className="text-2xl font-bold tracking-tight">Artist Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="card-brutal">
            <div className="font-mono-accent text-muted-foreground mb-2">{c.label}</div>
            <div className="text-xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <Link to="/dashboard/submit">
          <div className="card-brutal hover:border-primary/30 transition-colors cursor-pointer flex items-center gap-3">
            <Upload className="w-5 h-5 text-primary shrink-0" />
            <div>
              <h3 className="font-mono-accent text-foreground text-xs">Submit a Track</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Upload a new track for review.</p>
            </div>
          </div>
        </Link>
        <Link to="/dashboard/analytics">
          <div className="card-brutal hover:border-primary/30 transition-colors cursor-pointer flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary shrink-0" />
            <div>
              <h3 className="font-mono-accent text-foreground text-xs">Spin Analytics</h3>
              <p className="text-xs text-muted-foreground mt-0.5">View per-track spins & royalty estimates.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
