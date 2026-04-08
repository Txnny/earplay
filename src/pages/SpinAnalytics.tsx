import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3 } from "lucide-react";

interface SpinRow {
  track_title: string;
  spin_count: number;
}

export default function SpinAnalytics() {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState<SpinRow[]>([]);
  const [totalSpins, setTotalSpins] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Get artist's tracks
      let tracksQuery = supabase.from("tracks").select("id, title");
      if (!hasRole("admin")) {
        tracksQuery = tracksQuery.eq("artist_id", user.id);
      }
      const { data: tracks } = await tracksQuery;
      if (!tracks || tracks.length === 0) { setData([]); return; }

      const trackIds = tracks.map((t) => t.id);
      const { data: spins } = await supabase.from("spins").select("track_id").in("track_id", trackIds);

      const countMap: Record<string, number> = {};
      spins?.forEach((s) => { countMap[s.track_id] = (countMap[s.track_id] || 0) + 1; });

      const rows = tracks.map((t) => ({
        track_title: t.title,
        spin_count: countMap[t.id] || 0,
      })).sort((a, b) => b.spin_count - a.spin_count);

      setData(rows);
      setTotalSpins(rows.reduce((sum, r) => sum + r.spin_count, 0));
    };
    load();
  }, [user, hasRole]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Spin Analytics</h1>
        </div>
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg">Total Spins: {totalSpins}</CardTitle>
          </CardHeader>
          <CardContent>
            {data.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No spin data yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Track</TableHead>
                    <TableHead className="text-right">Spins</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((r) => (
                    <TableRow key={r.track_title}>
                      <TableCell className="font-medium">{r.track_title}</TableCell>
                      <TableCell className="text-right">{r.spin_count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
