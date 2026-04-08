import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Download, FileText, Loader2 } from "lucide-react";

export default function CueSheetExport() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Generate last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    };
  });

  const exportCSV = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split("-").map(Number);
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month, 1).toISOString();

      // Fetch spins for the month
      const { data: spins } = await supabase
        .from("spins")
        .select("track_id, spun_at, duration_seconds, source")
        .gte("spun_at", start)
        .lt("spun_at", end)
        .order("spun_at", { ascending: true });

      if (!spins || spins.length === 0) {
        toast.error("No spins found for this month");
        setLoading(false);
        return;
      }

      // Fetch track details
      const trackIds = [...new Set(spins.map((s) => s.track_id))];
      const { data: tracks } = await supabase
        .from("tracks")
        .select("id, title, artist_id, genre")
        .in("id", trackIds);

      // Fetch artist names
      const artistIds = [...new Set(tracks?.map((t) => t.artist_id) ?? [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", artistIds);

      const trackMap = new Map(tracks?.map((t) => [t.id, t]) ?? []);
      const nameMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) ?? []);

      // Build CSV — SoundExchange-compatible format
      const headers = [
        "Date", "Time", "Duration (s)", "Artist", "Track Title",
        "Genre", "Source", "ISRC",
      ];

      const rows = spins.map((s) => {
        const track = trackMap.get(s.track_id);
        const artistName = track ? (nameMap.get(track.artist_id) ?? "Unknown") : "Unknown";
        const d = new Date(s.spun_at);
        return [
          d.toISOString().split("T")[0],
          d.toTimeString().split(" ")[0],
          s.duration_seconds ?? "",
          artistName,
          track?.title ?? "Unknown",
          track?.genre ?? "",
          s.source ?? "manual",
          "", // ISRC placeholder
        ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cue-sheet-${selectedMonth}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${spins.length} spins`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="signal-dot" />
          <h1 className="text-2xl font-bold tracking-tight">Cue Sheet Export</h1>
        </div>

        <Card className="border-brutal bg-card/50 max-w-lg">
          <CardContent className="pt-6 space-y-6">
            <div className="card-brutal space-y-2">
              <div className="font-mono-accent text-muted-foreground">What is a cue sheet?</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A cue sheet is a timestamped log of every track played on the station during a given period.
                Submit it monthly to your PRO (SoundExchange, SOCAN, PPL) for accurate royalty distribution.
              </p>
            </div>

            <div className="space-y-3">
              <div className="section-label">Export Month</div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="border-brutal">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full gap-2" onClick={exportCSV} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {loading ? "Exporting..." : "Download CSV Cue Sheet"}
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• CSV format compatible with SoundExchange, SOCAN, and PPL submissions</p>
              <p>• Includes date, time, duration, artist, title, genre, and ISRC fields</p>
              <p>• Add ISRC codes to your tracks for accurate PRO matching</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
