import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ActiveRoleContextType {
  activeRole: AppRole | null;
  setActiveRole: (role: AppRole) => void;
}

const ActiveRoleContext = createContext<ActiveRoleContextType | undefined>(undefined);

export function ActiveRoleProvider({ children }: { children: ReactNode }) {
  const { roles } = useAuth();
  const [activeRole, setActiveRole] = useState<AppRole | null>(null);

  // Sync: if roles change and current active isn't valid, reset
  useEffect(() => {
    if (roles.length === 0) {
      setActiveRole(null);
    } else if (!activeRole || !roles.includes(activeRole)) {
      setActiveRole(roles[0]);
    }
  }, [roles]);

  return (
    <ActiveRoleContext.Provider value={{ activeRole, setActiveRole }}>
      {children}
    </ActiveRoleContext.Provider>
  );
}

export function useActiveRole() {
  const ctx = useContext(ActiveRoleContext);
  if (!ctx) {
    // Fallback for HMR / transient render outside provider
    return { activeRole: null, setActiveRole: () => {} } as ActiveRoleContextType;
  }
  return ctx;
}
