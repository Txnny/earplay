import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Download, Disc3, Music, Users, TrendingUp } from "lucide-react";

const GENRE_COLORS = [
  "hsl(142, 72%, 50%)", "hsl(280, 65%, 60%)", "hsl(200, 70%, 55%)",
  "hsl(40, 80%, 55%)", "hsl(0, 72%, 51%)", "hsl(180, 60%, 45%)",
  "hsl(320, 60%, 55%)", "hsl(60, 70%, 50%)",
];

export default function AdminAnalytics() {
  const [topTracks, setTopTracks] = useState<{ name: string; spins: number }[]>([]);
  const [genreBreakdown, setGenreBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [monthlySpins, setMonthlySpins] = useState<{ month: string; spins: number }[]>([]);
  const [stats, setStats] = useState({ totalSpins: 0, totalTracks: 0, totalShows: 0, pendingTracks: 0 });

  useEffect(() => {
    const load = async () => {
      // Fetch all tracks
      const { data: tracks } = await supabase.from("tracks").select("id, title, genre");
      const { data: spins } = await supabase.from("spins").select("track_id, spun_at");
      const { count: showCount } = await supabase.from("shows").select("id", { count: "exact", head: true });
      const { count: pendingCount } = await supabase.from("tracks").select("id", { count: "exact", head: true }).eq("status", "pending");

      if (!tracks || !spins) return;

      // Stats
      setStats({
        totalSpins: spins.length,
        totalTracks: tracks.length,
        totalShows: showCount ?? 0,
        pendingTracks: pendingCount ?? 0,
      });

      // Top tracks by spin count
      const spinCountMap: Record<string, number> = {};
      spins.forEach((s) => { spinCountMap[s.track_id] = (spinCountMap[s.track_id] || 0) + 1; });

      const trackMap = new Map(tracks.map((t) => [t.id, t]));
      const top = Object.entries(spinCountMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([id, count]) => ({ name: trackMap.get(id)?.title ?? "Unknown", spins: count }));
      setTopTracks(top);

      // Genre breakdown
      const genreMap: Record<string, number> = {};
      spins.forEach((s) => {
        const track = trackMap.get(s.track_id);
        const genre = track?.genre || "Unknown";
        genreMap[genre] = (genreMap[genre] || 0) + 1;
      });
      setGenreBreakdown(Object.entries(genreMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value));

      // Monthly spins (last 6 months)
      const monthly: Record<string, number> = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
        monthly[key] = 0;
      }
      spins.forEach((s) => {
        const d = new Date(s.spun_at);
        const key = d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
        if (key in monthly) monthly[key]++;
      });
      setMonthlySpins(Object.entries(monthly).map(([month, spins]) => ({ month, spins })));
    };
    load();
  }, []);

  const exportCueSheet = () => {
    // This is handled by the dedicated CueSheetExport component now
    window.location.href = "/dashboard/cue-sheets";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="signal-dot" />
            <h1 className="text-2xl font-bold tracking-tight">Analytics & Reporting</h1>
          </div>
          <Button size="sm" variant="outline" className="gap-2 font-mono-accent" onClick={exportCueSheet}>
            <Download className="w-3 h-3" /> Cue Sheets
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "TOTAL SPINS", value: stats.totalSpins.toLocaleString(), icon: Disc3 },
            { label: "TRACKS", value: stats.totalTracks.toLocaleString(), icon: Music },
            { label: "SHOWS", value: stats.totalShows.toLocaleString(), icon: TrendingUp },
            { label: "PENDING REVIEW", value: stats.pendingTracks.toLocaleString(), icon: Users },
          ].map((s) => (
            <div key={s.label} className="card-brutal">
              <div className="font-mono-accent text-muted-foreground mb-2">{s.label}</div>
              <div className="text-xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Monthly Spins */}
          <div>
            <div className="section-label">Monthly Spins</div>
            <Card className="border-brutal bg-card/50">
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlySpins}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(240, 5%, 55%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(240, 5%, 55%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(240, 5%, 10%)", border: "1px solid hsl(240, 4%, 20%)", borderRadius: 2, fontSize: 12 }} />
                    <Bar dataKey="spins" fill="hsl(142, 72%, 50%)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Genre Breakdown */}
          <div>
            <div className="section-label">Genre Breakdown</div>
            <Card className="border-brutal bg-card/50">
              <CardContent className="pt-4 flex items-center gap-4">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie data={genreBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} strokeWidth={0}>
                      {genreBreakdown.map((_, i) => (
                        <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(240, 5%, 10%)", border: "1px solid hsl(240, 4%, 20%)", borderRadius: 2, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 flex-1">
                  {genreBreakdown.slice(0, 6).map((g, i) => (
                    <div key={g.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }} />
                      <span className="truncate text-muted-foreground">{g.name}</span>
                      <span className="ml-auto tabular-nums font-medium">{g.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Tracks */}
        <div>
          <div className="section-label">Top 10 Tracks</div>
          <Card className="border-brutal bg-card/50">
            <CardContent className="p-0">
              {topTracks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No spin data yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono-accent w-10">#</TableHead>
                      <TableHead className="font-mono-accent">Track</TableHead>
                      <TableHead className="text-right font-mono-accent">Spins</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topTracks.map((t, i) => (
                      <TableRow key={t.name}>
                        <TableCell className="text-primary font-bold">{String(i + 1).padStart(2, "0")}</TableCell>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{t.spins}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
