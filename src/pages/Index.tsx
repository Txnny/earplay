import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Radio, Disc3, Shield, Music, Headphones, BarChart3, ArrowRight, DollarSign, Calendar, Users } from "lucide-react";

const features = [
  { icon: Music, title: "Submit Tracks", desc: "Artists upload tracks and monitor submission status in real time." },
  { icon: Headphones, title: "Build Playlists", desc: "DJs browse approved tracks and curate killer playlists for their shows." },
  { icon: BarChart3, title: "Track Spins", desc: "Every play is logged. See analytics, royalties, and rotation data." },
  { icon: DollarSign, title: "Royalty Tracking", desc: "Estimated royalties at SoundExchange rates. Monthly cue sheet exports for PRO submission." },
  { icon: Calendar, title: "24/7 Schedule", desc: "Genre-fluid, DJ-curated blocks + live submission drops. Always on." },
  { icon: Users, title: "Membership", desc: "Free and premium tiers. Stripe billing. Support independent radio." },
];

const roles = [
  { icon: Radio, label: "Artist", desc: "Submit tracks, track spins & royalties" },
  { icon: Disc3, label: "DJ", desc: "Build playlists, schedule & broadcast shows" },
  { icon: Shield, label: "Admin", desc: "Full reporting, cue sheets & management" },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="signal-dot" />
            <span className="text-xl font-bold tracking-[0.2em] uppercase">SURFACED RADIO</span>
          </span>
          <div className="flex items-center gap-4">
            <Link to="/listen">
              <Button variant="ghost" size="sm" className="gap-1.5 font-mono-accent">
                Listen Live
              </Button>
            </Link>
            <Link to="/pricing">
              <Button variant="ghost" size="sm" className="font-mono-accent">Pricing</Button>
            </Link>
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="glow-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl space-y-8">
          <div className="border-l-[3px] border-primary pl-4 space-y-6">
            <div className="font-mono-accent text-primary">24-HOUR ONLINE RADIO · UNDERGROUND & UNDERREPRESENTED ARTISTS</div>
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1]">
              Your station,{" "}
              <span className="text-gradient">fully wired</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Artist submissions, DJ playlists, spin analytics, and royalty tracking — all in one dashboard built for independent radio.
              Every track logged, every spin paid. Think college radio — but global and always on.
            </p>
            <div className="flex gap-4">
              <Link to="/auth">
                <Button size="lg" className="glow-md gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/listen">
                <Button size="lg" variant="outline" className="gap-2">
                  <span className="signal-dot" /> Listen Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/40">
        <div className="container">
          <div className="section-label mb-8">Platform Features</div>
          <div className="grid md:grid-cols-3 gap-3">
            {features.map((f) => (
              <div key={f.title} className="card-brutal space-y-3 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-2">
                  <f.icon className="w-4 h-4 text-primary" />
                  <h3 className="font-mono-accent text-foreground text-xs">{f.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 border-t border-border/40">
        <div className="container space-y-8">
          <div className="section-label">Three Roles, One Platform</div>
          <div className="grid md:grid-cols-3 gap-3 max-w-3xl">
            {roles.map((r, i) => (
              <div key={r.label} className="card-brutal flex gap-3">
                <span className="text-xl font-bold text-primary">{String(i + 1).padStart(2, "0")}</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <r.icon className="w-4 h-4 text-primary" />
                    <h3 className="font-mono-accent text-foreground text-xs">{r.label}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Model */}
      <section className="py-20 border-t border-border/40">
        <div className="container">
          <div className="section-label">Revenue Model</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
            {[
              { emoji: "🎙", label: "Listener Memberships" },
              { emoji: "🏷", label: "Brand Sponsorships" },
              { emoji: "🎟", label: "Live Event Tie-ins" },
              { emoji: "📦", label: "Artist Promo Packages" },
              { emoji: "🎓", label: "DJ Workshop Fees" },
              { emoji: "📡", label: "White-Label Streams" },
            ].map((r) => (
              <div key={r.label} className="card-brutal text-center space-y-2">
                <div className="text-xl">{r.emoji}</div>
                <div className="font-mono-accent text-muted-foreground">{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/40 text-center">
        <div className="container font-mono-accent text-muted-foreground">
          SURFACED RADIO · BUILT FOR THE ARTISTS THE ALGORITHM IGNORES
        </div>
      </footer>
    </div>
  );
}
