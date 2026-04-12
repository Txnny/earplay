import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useActiveRole } from "@/hooks/useActiveRole";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Radio, Disc3, Shield, LayoutDashboard, Music, ListMusic, Calendar, BarChart3, LogOut, Upload, Wifi, ClipboardCheck, Settings, Download, PieChart, UserCircle } from "lucide-react";

const navByRole = {
  artist: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/submit", icon: Upload, label: "Submit Track" },
    { to: "/dashboard/tracks", icon: Music, label: "My Tracks" },
    { to: "/dashboard/analytics", icon: BarChart3, label: "Spin Analytics" },
    { to: "/dashboard/profile", icon: UserCircle, label: "Profile" },
  ],
  dj: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/library", icon: Music, label: "Track Library" },
    { to: "/dashboard/playlists", icon: ListMusic, label: "Playlists" },
    { to: "/dashboard/schedule", icon: Calendar, label: "Schedule" },
    { to: "/dashboard/broadcast", icon: Wifi, label: "Broadcast" },
  ],
  admin: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/review", icon: ClipboardCheck, label: "Track Review" },
    { to: "/dashboard/tracks", icon: Music, label: "All Tracks" },
    { to: "/dashboard/admin-analytics", icon: PieChart, label: "Analytics" },
    { to: "/dashboard/cue-sheets", icon: Download, label: "Cue Sheets" },
    { to: "/dashboard/settings", icon: Settings, label: "Settings" },
  ],
};

const roleIcon = { artist: Radio, dj: Disc3, admin: Shield };
const roleLabel = { artist: "Artist", dj: "DJ", admin: "Admin" };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, roles, signOut } = useAuth();
  const { activeRole, setActiveRole } = useActiveRole();
  const location = useLocation();
  const navigate = useNavigate();

  const currentRole = activeRole ?? "artist";
  const RoleIcon = roleIcon[currentRole] ?? Radio;
  const links = navByRole[currentRole] ?? navByRole.artist;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 bg-sidebar flex flex-col">
        <div className="p-4 border-b border-border/40">
          <Link to="/" className="text-lg font-bold text-gradient">SURFACED RADIO</Link>
        </div>

        {/* Role Toggle */}
        {roles.length > 1 && (
          <div className="px-3 pt-3 pb-1">
            <div className="flex rounded-lg bg-secondary/50 p-1 gap-1">
              {roles.map((r) => {
                const Icon = roleIcon[r] ?? Radio;
                return (
                  <button
                    key={r}
                    onClick={() => { setActiveRole(r); navigate("/dashboard"); }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all",
                      currentRole === r
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {roleLabel[r]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                location.pathname === l.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border/40 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <RoleIcon className="w-4 h-4 text-primary" />
            <span className="capitalize text-muted-foreground">{roleLabel[currentRole]}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => { signOut(); navigate("/"); }}
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
