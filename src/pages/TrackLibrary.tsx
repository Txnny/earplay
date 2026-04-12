import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Music, Plus } from "lucide-react";
import AudioPreview from "@/components/AudioPreview";

interface Track {
  id: string;
  title: string;
  genre: string | null;
  file_url: string | null;
}

interface Playlist {
  id: string;
  name: string;
}

export default function TrackLibrary() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>("");
  const [addingTrack, setAddingTrack] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: t } = await supabase.from("tracks").select("id, title, genre, file_url").eq("status", "approved");
      setTracks(t ?? []);
      if (user) {
        const { data: p } = await supabase.from("playlists").select("id, name").eq("dj_id", user.id);
        setPlaylists(p ?? []);
      }
    };
    load();
  }, [user]);

  const addToPlaylist = async (trackId: string) => {
    if (!selectedPlaylist) { toast.error("Select a playlist first"); return; }
    const { error } = await supabase.from("playlist_tracks").insert({
      playlist_id: selectedPlaylist,
      track_id: trackId,
    });
    if (error) toast.error(error.message);
    else { toast.success("Track added to playlist"); setAddingTrack(null); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Music className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Approved Track Library</h1>
        </div>
        {tracks.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No approved tracks yet.</p>
        ) : (
          <div className="border border-border/50 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tracks.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell className="text-muted-foreground">{t.genre ?? "—"}</TableCell>
                    <TableCell><AudioPreview fileUrl={t.file_url} compact /></TableCell>
                    <TableCell>
                      <Dialog open={addingTrack === t.id} onOpenChange={(o) => setAddingTrack(o ? t.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm"><Plus className="w-4 h-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add to Playlist</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Select value={selectedPlaylist} onValueChange={setSelectedPlaylist}>
                              <SelectTrigger><SelectValue placeholder="Choose playlist" /></SelectTrigger>
                              <SelectContent>
                                {playlists.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button onClick={() => addToPlaylist(t.id)} className="w-full" disabled={!selectedPlaylist}>
                              Add Track
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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
