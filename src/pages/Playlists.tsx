import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ListMusic, Plus, Trash2 } from "lucide-react";

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export default function Playlists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("playlists").select("*").eq("dj_id", user.id).order("created_at", { ascending: false });
    setPlaylists(data ?? []);
  };

  useEffect(() => { load(); }, [user]);

  const create = async () => {
    if (!user || !newName.trim()) return;
    const { error } = await supabase.from("playlists").insert({ dj_id: user.id, name: newName.trim() });
    if (error) toast.error(error.message);
    else { toast.success("Playlist created"); setNewName(""); setOpen(false); load(); }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("playlists").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Playlist deleted"); load(); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ListMusic className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">My Playlists</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> New Playlist</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Playlist</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Playlist name" />
                <Button onClick={create} className="w-full" disabled={!newName.trim()}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {playlists.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No playlists yet. Create one to get started.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((p) => (
              <Card key={p.id} className="border-border/50 bg-card/50">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <CardDescription>{new Date(p.created_at).toLocaleDateString()}</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => remove(p.id)}>
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
