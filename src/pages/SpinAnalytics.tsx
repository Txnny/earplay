import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, DollarSign, Disc3, TrendingUp, ExternalLink, Info } from "lucide-react";

// SoundExchange statutory rate for non-interactive webcasting (per performance)
const RATE_PER_SPIN = 0.0024;

interface SpinRow {
  track_title: string;
  track_id: string;
  spin_count: number;
  estimated_royalty: number;
}

export default function SpinAnalytics() {
  const { user, hasRole } = useAuth();
  const [data, setData] = useState<SpinRow[]>([]);
  const [totalSpins, setTotalSpins] = useState(0);
  const [totalRoyalty, setTotalRoyalty] = useState(0);
  const [monthlySpins, setMonthlySpins] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      let tracksQuery = supabase.from("tracks").select("id, title");
      if (!hasRole("admin")) {
        tracksQuery = tracksQuery.eq("artist_id", user.id);
      }
      const { data: tracks } = await tracksQuery;
      if (!tracks || tracks.length === 0) { setData([]); return; }

      const trackIds = tracks.map((t) => t.id);
      const { data: spins } = await supabase.from("spins").select("track_id, spun_at").in("track_id", trackIds);

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const countMap: Record<string, number> = {};
      let monthly = 0;
      spins?.forEach((s) => {
        countMap[s.track_id] = (countMap[s.track_id] || 0) + 1;
        if (s.spun_at >= monthStart) monthly++;
      });

      const rows = tracks.map((t) => ({
        track_title: t.title,
        track_id: t.id,
        spin_count: countMap[t.id] || 0,
        estimated_royalty: (countMap[t.id] || 0) * RATE_PER_SPIN,
      })).sort((a, b) => b.spin_count - a.spin_count);

      setData(rows);
      setTotalSpins(rows.reduce((sum, r) => sum + r.spin_count, 0));
      setTotalRoyalty(rows.reduce((sum, r) => sum + r.estimated_royalty, 0));
      setMonthlySpins(monthly);
    };
    load();
  }, [user, hasRole]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="signal-dot" />
          <h1 className="text-2xl font-bold tracking-tight">Spin Analytics & Royalties</h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "TOTAL SPINS", value: totalSpins.toLocaleString(), icon: Disc3 },
            { label: "THIS MONTH", value: monthlySpins.toLocaleString(), icon: TrendingUp },
            { label: "EST. ROYALTIES", value: `$${totalRoyalty.toFixed(2)}`, icon: DollarSign },
            { label: "RATE / SPIN", value: `$${RATE_PER_SPIN}`, icon: BarChart3 },
          ].map((s) => (
            <div key={s.label} className="card-brutal">
              <div className="font-mono-accent text-muted-foreground mb-2">{s.label}</div>
              <div className="text-xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Track breakdown */}
        <div>
          <div className="section-label">Track Breakdown</div>
          <Card className="border-brutal bg-card/50">
            <CardContent className="p-0">
              {data.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No spin data yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-mono-accent">Track</TableHead>
                      <TableHead className="text-right font-mono-accent">Spins</TableHead>
                      <TableHead className="text-right font-mono-accent">Est. Royalty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((r) => (
                      <TableRow key={r.track_id}>
                        <TableCell className="font-medium">{r.track_title}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.spin_count}</TableCell>
                        <TableCell className="text-right tabular-nums text-primary">${r.estimated_royalty.toFixed(4)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PRO Registration Guide */}
        <div>
          <div className="section-label">PRO Registration</div>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              {
                step: "01",
                title: "Register with a PRO",
                desc: "Sign up with ASCAP, BMI, SESAC (US), SOCAN (CA), PRS (UK), or your national PRO to collect performance royalties.",
                link: "https://www.soundexchange.com/register/",
                linkLabel: "SoundExchange Enrollment",
              },
              {
                step: "02",
                title: "Register with SoundExchange",
                desc: "SoundExchange collects digital performance royalties for non-interactive webcasting (like this station).",
                link: "https://www.soundexchange.com/",
                linkLabel: "SoundExchange.com",
              },
              {
                step: "03",
                title: "Submit Your ISRC Codes",
                desc: "Ensure your tracks have ISRC codes. This links your recordings to spin logs for accurate royalty distribution.",
              },
              {
                step: "04",
                title: "Transparency Dashboard",
                desc: "This page shows your real-time spin counts and estimated royalty accruals. No black box — full visibility.",
              },
            ].map((item) => (
              <div key={item.step} className="card-brutal flex gap-3">
                <span className="text-xl font-bold text-primary shrink-0">{item.step}</span>
                <div className="space-y-1">
                  <h4 className="font-mono-accent text-foreground text-xs">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary text-xs hover:underline mt-1"
                    >
                      {item.linkLabel} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-brutal flex items-start gap-3">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Estimated royalties are calculated using the current SoundExchange statutory rate for non-interactive webcasting
            (${RATE_PER_SPIN} per performance). Actual payouts depend on your PRO agreements, listener count, and territory.
            Cue sheets are auto-exported monthly for PRO submission.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
