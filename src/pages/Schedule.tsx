import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, Plus, Trash2 } from "lucide-react";

interface Show {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  playlist_id: string | null;
}

interface Playlist {
  id: string;
  name: string;
}

export default function Schedule() {
  const { user } = useAuth();
  const [shows, setShows] = useState<Show[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", starts_at: "", ends_at: "", playlist_id: "" });

  const load = async () => {
    if (!user) return;
    const { data: s } = await supabase.from("shows").select("id, title, starts_at, ends_at, playlist_id").eq("dj_id", user.id).order("starts_at", { ascending: true });
    const { data: p } = await supabase.from("playlists").select("id, name").eq("dj_id", user.id);
    setShows(s ?? []);
    setPlaylists(p ?? []);
  };

  useEffect(() => { load(); }, [user]);

  const create = async () => {
    if (!user || !form.title || !form.starts_at || !form.ends_at) return;
    const { error } = await supabase.from("shows").insert({
      dj_id: user.id,
      title: form.title,
      starts_at: form.starts_at,
      ends_at: form.ends_at,
      playlist_id: form.playlist_id || null,
    });
    if (error) toast.error(error.message);
    else { toast.success("Show scheduled"); setOpen(false); setForm({ title: "", starts_at: "", ends_at: "", playlist_id: "" }); load(); }
  };

  const remove = async (id: string) => {
    await supabase.from("shows").delete().eq("id", id);
    load();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Show Schedule</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Schedule Show</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Schedule a Show</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Show Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Friday Night Vibes" />
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Playlist (optional)</Label>
                  <Select value={form.playlist_id} onValueChange={(v) => setForm({ ...form, playlist_id: v })}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      {playlists.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={create} className="w-full">Schedule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {shows.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No shows scheduled.</p>
        ) : (
          <div className="space-y-3">
            {shows.map((s) => (
              <Card key={s.id} className="border-border/50 bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div>
                    <CardTitle className="text-base">{s.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(s.starts_at).toLocaleString()} — {new Date(s.ends_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(s.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
