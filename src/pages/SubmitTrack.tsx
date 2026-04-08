import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function SubmitTrack() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;
    setLoading(true);

    try {
      // Upload file
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage.from("tracks").upload(filePath, file);
      if (uploadErr) throw uploadErr;

      // Create track record
      const { error: trackErr } = await supabase.from("tracks").insert({
        artist_id: user.id,
        title,
        genre: genre || null,
        file_url: filePath,
        notes: notes || null,
      });
      if (trackErr) throw trackErr;

      toast.success("Track submitted for review!");
      navigate("/dashboard/tracks");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto">
        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" /> Submit a Track
            </CardTitle>
            <CardDescription>Upload your track for review. Once approved, DJs can add it to their playlists.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Track Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Awesome Track" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="e.g. House, Jazz, Hip-Hop" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Audio File</Label>
                <Input id="file" type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes for Reviewer</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any context about the track..." rows={3} />
              </div>
              <Button type="submit" className="w-full glow-sm" disabled={loading}>
                {loading ? "Uploading..." : "Submit Track"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
