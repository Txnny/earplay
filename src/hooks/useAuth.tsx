import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface SubscriptionInfo {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  loading: boolean;
  subscription: SubscriptionInfo;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_SUB: SubscriptionInfo = { subscribed: false, productId: null, subscriptionEnd: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(DEFAULT_SUB);

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    setRoles(data?.map((r) => r.role) ?? []);
  };

  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error || !data) { setSubscription(DEFAULT_SUB); return; }
      setSubscription({
        subscribed: data.subscribed ?? false,
        productId: data.product_id ?? null,
        subscriptionEnd: data.subscription_end ?? null,
      });
    } catch {
      setSubscription(DEFAULT_SUB);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchRoles(session.user.id);
          // Don't await — let it run in background
          checkSubscription();
        } else {
          setRoles([]);
          setSubscription(DEFAULT_SUB);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchRoles(session.user.id);
        checkSubscription();
      }
      setLoading(false);
    });

    return () => authSub.unsubscribe();
  }, [checkSubscription]);

  // Auto-refresh subscription every 60 seconds
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [session, checkSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setRoles([]);
    setSubscription(DEFAULT_SUB);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider value={{
      session, user: session?.user ?? null, roles, loading,
      subscription, signOut, hasRole, refreshSubscription: checkSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
