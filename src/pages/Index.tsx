import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Radio, Disc3, Shield, Music, Headphones, BarChart3, ArrowRight } from "lucide-react";

const features = [
  { icon: Music, title: "Submit Tracks", desc: "Artists upload tracks and monitor submission status in real time." },
  { icon: Headphones, title: "Build Playlists", desc: "DJs browse approved tracks and curate killer playlists for their shows." },
  { icon: BarChart3, title: "Track Spins", desc: "Every play is logged. See analytics, royalties, and rotation data." },
];

const roles = [
  { icon: Radio, label: "Artist", desc: "Submit tracks, track spins & royalties" },
  { icon: Disc3, label: "DJ", desc: "Build playlists, schedule shows" },
  { icon: Shield, label: "Admin", desc: "Full reporting & management" },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-xl font-bold tracking-tight text-gradient">WAVEFORM</span>
          <div className="flex items-center gap-4">
            <Link to="/listen">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                Listen Live
              </Button>
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
        <div className="container max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            Now Live
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1]">
            Your station,{" "}
            <span className="text-gradient">fully wired</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Artist submissions, DJ playlists, spin analytics, and royalty tracking — all in one dashboard built for independent radio.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="glow-md gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-t border-border/40">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-4 hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 border-t border-border/40">
        <div className="container text-center space-y-12">
          <h2 className="text-3xl font-bold">Three roles, one platform</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {roles.map((r) => (
              <div key={r.label} className="p-6 rounded-xl border border-border/50 bg-card/50 space-y-3">
                <r.icon className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold">{r.label}</h3>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/40 text-center text-sm text-muted-foreground">
        <div className="container">© 2026 Waveform. Built for independent radio.</div>
      </footer>
    </div>
  );
}
