import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Music, Users, BarChart3, Disc3, ClipboardCheck, Settings, PieChart, Download, Mic, Tag, Ticket, Package, GraduationCap, Radio } from "lucide-react";

const RATE_PER_SPIN = 0.0024;

export default function AdminOverview() {
  const [stats, setStats] = useState({ tracks: 0, pending: 0, spins: 0, shows: 0, royalty: 0 });

  useEffect(() => {
    const load = async () => {
      const { count: tracks } = await supabase.from("tracks").select("id", { count: "exact", head: true });
      const { count: pending } = await supabase.from("tracks").select("id", { count: "exact", head: true }).eq("status", "pending");
      const { count: spins } = await supabase.from("spins").select("id", { count: "exact", head: true });
      const { count: shows } = await supabase.from("shows").select("id", { count: "exact", head: true });
      const spinCount = spins ?? 0;
      setStats({ tracks: tracks ?? 0, pending: pending ?? 0, spins: spinCount, shows: shows ?? 0, royalty: spinCount * RATE_PER_SPIN });
    };
    load();
  }, []);

  const cards = [
    { label: "TOTAL TRACKS", value: String(stats.tracks), icon: Music },
    { label: "PENDING REVIEW", value: String(stats.pending), icon: Users },
    { label: "TOTAL SPINS", value: stats.spins.toLocaleString(), icon: BarChart3 },
    { label: "SHOWS", value: String(stats.shows), icon: Disc3 },
    { label: "EST. ROYALTIES", value: `$${stats.royalty.toFixed(2)}`, icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="signal-dot" />
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="card-brutal">
            <div className="font-mono-accent text-muted-foreground mb-2">{c.label}</div>
            <div className="text-xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Quick Actions</div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { to: "/dashboard/review", icon: ClipboardCheck, label: "Review Tracks", desc: `${stats.pending} pending submissions` },
          { to: "/dashboard/admin-analytics", icon: PieChart, label: "Analytics", desc: "Spins, genres, trends" },
          { to: "/dashboard/cue-sheets", icon: Download, label: "Cue Sheets", desc: "Monthly export for PRO submission" },
          { to: "/dashboard/tracks", icon: Music, label: "All Tracks", desc: `${stats.tracks} total tracks` },
          { to: "/dashboard/settings", icon: Settings, label: "Settings", desc: "Station config, stream URL" },
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

      <div className="section-label">Revenue Streams</div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { icon: Mic, label: "Listener Memberships" },
          { icon: Tag, label: "Brand Sponsorships" },
          { icon: Ticket, label: "Live Event Tie-ins" },
          { icon: Package, label: "Artist Promo Packages" },
          { icon: GraduationCap, label: "DJ Workshop Fees" },
          { icon: Radio, label: "White-Label Streams" },
        ].map((r) => (
          <div key={r.label} className="card-brutal text-center space-y-2">
            <r.icon className="w-5 h-5 text-primary mx-auto" />
            <div className="font-mono-accent text-muted-foreground">{r.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
