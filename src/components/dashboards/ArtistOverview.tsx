import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Music, BarChart3, Clock, CheckCircle } from "lucide-react";

export default function ArtistOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, spins: 0 });

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
      setStats({ total, approved, pending, spins });
    };
    load();
  }, [user]);

  const cards = [
    { label: "Total Tracks", value: stats.total, icon: Music },
    { label: "Approved", value: stats.approved, icon: CheckCircle },
    { label: "Pending", value: stats.pending, icon: Clock },
    { label: "Total Spins", value: stats.spins, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Artist Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
}
