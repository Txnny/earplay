import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Music } from "lucide-react";

interface Track {
  id: string;
  title: string;
  genre: string | null;
  status: string;
  submitted_at: string;
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function MyTracks() {
  const { user, hasRole } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      let query = supabase.from("tracks").select("id, title, genre, status, submitted_at").order("submitted_at", { ascending: false });
      // Artists see own, admins see all
      if (hasRole("artist") && !hasRole("admin")) {
        query = query.eq("artist_id", user.id);
      }
      const { data } = await query;
      setTracks(data ?? []);
    };
    load();
  }, [user, hasRole]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Music className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">{hasRole("admin") ? "All Tracks" : "My Tracks"}</h1>
        </div>
        {tracks.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center">No tracks yet.</p>
        ) : (
          <div className="border border-border/50 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracks.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell className="text-muted-foreground">{t.genre ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor[t.status]}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(t.submitted_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
