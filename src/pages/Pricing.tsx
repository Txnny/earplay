import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Zap, Crown, Loader2, Settings } from "lucide-react";

const TIERS = {
  free: {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Listen live & browse the schedule",
    icon: Zap,
    price_id: null,
    product_id: "prod_UIbw31t6BQzJy3",
    features: [
      "Listen to live broadcasts",
      "Browse show schedule",
      "View now-playing info",
    ],
  },
  premium: {
    name: "Premium",
    price: "$9.99",
    period: "/mo",
    description: "The full WAVEFORM experience",
    icon: Crown,
    price_id: "price_1TK0iwHRu80c4uuWF8BBkTcB",
    product_id: "prod_UIbwXxekmyxLO3",
    features: [
      "Everything in Free",
      "Ad-free listening",
      "Exclusive shows & mixes",
      "HD audio quality",
      "Chat with DJs during shows",
      "Early access to new features",
    ],
  },
};

export default function Pricing() {
  const { session, subscription, refreshSubscription } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleCheckout = async (priceId: string) => {
    if (!session) {
      toast.error("Please sign in first");
      return;
    }
    setLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to start checkout");
    } finally {
      setLoading(null);
    }
  };

  const openPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to open portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const isCurrentPlan = (productId: string) => subscription.subscribed && subscription.productId === productId;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="signal-dot" />
            <span className="text-xl font-bold tracking-[0.2em] uppercase">WAVEFORM</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/listen"><Button variant="ghost" size="sm" className="font-mono-accent">Listen</Button></Link>
            {session ? (
              <Link to="/dashboard"><Button variant="ghost" size="sm">Dashboard</Button></Link>
            ) : (
              <Link to="/auth"><Button size="sm" className="glow-sm">Sign In</Button></Link>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-20 container max-w-4xl">
        <div className="text-center mb-12">
          <div className="font-mono-accent text-primary mb-4">MEMBERSHIP</div>
          <h1 className="text-4xl font-bold mb-3">Support Independent Radio</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Choose the plan that's right for you. Upgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {Object.entries(TIERS).map(([key, tier]) => {
            const isPremium = key === "premium";
            const isCurrent = isCurrentPlan(tier.product_id);
            return (
              <div
                key={key}
                className={`card-brutal relative ${isPremium ? "border-primary/50" : ""} ${isCurrent ? "ring-1 ring-primary" : ""}`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-4">
                    <Badge className="bg-primary text-primary-foreground font-mono-accent">YOUR PLAN</Badge>
                  </div>
                )}
                {isPremium && !isCurrent && (
                  <div className="absolute -top-3 left-4">
                    <Badge className="bg-primary text-primary-foreground font-mono-accent">MOST POPULAR</Badge>
                  </div>
                )}
                <div className="text-center pt-4 pb-2 space-y-2">
                  <tier.icon className={`w-8 h-8 mx-auto ${isPremium ? "text-primary" : "text-muted-foreground"}`} />
                  <h3 className="text-lg font-bold">{tier.name}</h3>
                  <p className="text-xs text-muted-foreground">{tier.description}</p>
                  <div>
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                </div>
                <ul className="space-y-2 my-4">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 shrink-0 ${isPremium ? "text-primary" : "text-muted-foreground"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button variant="outline" className="w-full gap-2 font-mono-accent" onClick={openPortal} disabled={portalLoading}>
                    {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                    Manage Subscription
                  </Button>
                ) : tier.price_id ? (
                  <Button
                    className="w-full glow-sm"
                    onClick={() => handleCheckout(tier.price_id!)}
                    disabled={loading === tier.price_id}
                  >
                    {loading === tier.price_id ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/listen">Start Listening</Link>
                  </Button>
                )}
                {subscription.subscribed && isCurrent && subscription.subscriptionEnd && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Renews {new Date(subscription.subscriptionEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
