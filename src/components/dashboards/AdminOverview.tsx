import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Music, BarChart3, Disc3 } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState({ tracks: 0, pending: 0, spins: 0, shows: 0 });

  useEffect(() => {
    const load = async () => {
      const { count: tracks } = await supabase.from("tracks").select("id", { count: "exact", head: true });
      const { count: pending } = await supabase.from("tracks").select("id", { count: "exact", head: true }).eq("status", "pending");
      const { count: spins } = await supabase.from("spins").select("id", { count: "exact", head: true });
      const { count: shows } = await supabase.from("shows").select("id", { count: "exact", head: true });
      setStats({ tracks: tracks ?? 0, pending: pending ?? 0, spins: spins ?? 0, shows: shows ?? 0 });
    };
    load();
  }, []);

  const cards = [
    { label: "Total Tracks", value: stats.tracks, icon: Music },
    { label: "Pending Review", value: stats.pending, icon: Users },
    { label: "Total Spins", value: stats.spins, icon: BarChart3 },
    { label: "Shows Scheduled", value: stats.shows, icon: Disc3 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
