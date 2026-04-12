import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Music, Loader2 } from "lucide-react";
import AudioPreview from "@/components/AudioPreview";

interface Track {
  id: string;
  title: string;
  genre: string | null;
  notes: string | null;
  file_url: string | null;
  status: string;
  submitted_at: string;
  artist_id: string;
  artist_name?: string;
}

export default function AdminReview() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [acting, setActing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  const loadTracks = async () => {
    setLoading(true);
    let query = supabase
      .from("tracks")
      .select("id, title, genre, notes, file_url, status, submitted_at, artist_id")
      .order("submitted_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    if (!data) { setLoading(false); return; }

    // Fetch artist display names
    const artistIds = [...new Set(data.map((t) => t.artist_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", artistIds);

    const nameMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) ?? []);
    setTracks(data.map((t) => ({ ...t, artist_name: nameMap.get(t.artist_id) ?? "Unknown" })));
    setLoading(false);
  };

  useEffect(() => { loadTracks(); }, [filter]);

  const handleReview = async (trackId: string, newStatus: "approved" | "rejected") => {
    if (!user) return;
    setActing(trackId);
    const { error } = await supabase
      .from("tracks")
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        notes: reviewNotes[trackId] || null,
      })
      .eq("id", trackId);

    setActing(null);
    if (error) { toast.error(error.message); return; }
    toast.success(`Track ${newStatus}`);
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
      pending: { variant: "outline", icon: Clock },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: XCircle },
    };
    const s = map[status] ?? map.pending;
    return (
      <Badge variant={s.variant} className="gap-1 capitalize">
        <s.icon className="w-3 h-3" /> {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Music className="w-6 h-6 text-primary" /> Track Review
          </h1>
          <div className="flex gap-2">
            {(["pending", "approved", "rejected", "all"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading tracks...
          </div>
        ) : tracks.length === 0 ? (
          <Card className="border-border/50 bg-card/50">
            <CardContent className="py-12 text-center text-muted-foreground">
              No {filter === "all" ? "" : filter} tracks found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tracks.map((track) => (
              <Card key={track.id} className="border-border/50 bg-card/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{track.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        by {track.artist_name} · {track.genre || "No genre"} · {new Date(track.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    {statusBadge(track.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AudioPreview fileUrl={track.file_url} />
                  {track.notes && (
                    <div className="text-sm bg-secondary/30 rounded-lg p-3">
                      <span className="text-xs font-medium text-muted-foreground block mb-1">Artist Notes</span>
                      {track.notes}
                    </div>
                  )}
                  {track.status === "pending" && (
                    <>
                      <Textarea
                        placeholder="Review notes (optional)..."
                        value={reviewNotes[track.id] ?? ""}
                        onChange={(e) => setReviewNotes((prev) => ({ ...prev, [track.id]: e.target.value }))}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="gap-1"
                          onClick={() => handleReview(track.id, "approved")}
                          disabled={acting === track.id}
                        >
                          {acting === track.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => handleReview(track.id, "rejected")}
                          disabled={acting === track.id}
                        >
                          {acting === track.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                          Reject
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
