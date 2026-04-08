import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, ExternalLink, Save, Loader2 } from "lucide-react";

interface ProfileData {
  display_name: string;
  bio: string;
  avatar_url: string;
  pro_registered: boolean;
  pro_organization: string;
  socials: { website?: string; twitter?: string; instagram?: string };
}

const DEFAULT: ProfileData = {
  display_name: "", bio: "", avatar_url: "",
  pro_registered: false, pro_organization: "",
  socials: {},
};

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState<ProfileData>(DEFAULT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, bio, avatar_url, pro_registered, pro_organization, socials")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            display_name: data.display_name ?? "",
            bio: data.bio ?? "",
            avatar_url: data.avatar_url ?? "",
            pro_registered: data.pro_registered ?? false,
            pro_organization: data.pro_organization ?? "",
            socials: (data.socials as any) ?? {},
          });
        }
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name || null,
        bio: form.bio || null,
        avatar_url: form.avatar_url || null,
        pro_registered: form.pro_registered,
        pro_organization: form.pro_organization || null,
        socials: form.socials,
      })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated");
  };

  const setSocial = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, socials: { ...prev.socials, [key]: value } }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-xl space-y-6">
        <div className="flex items-center gap-3">
          <span className="signal-dot" />
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        </div>

        <div className="space-y-4">
          <div className="section-label">Basic Info</div>
          <div className="card-brutal space-y-4">
            <div className="space-y-2">
              <Label className="font-mono-accent text-xs">Display Name</Label>
              <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="border-brutal" />
            </div>
            <div className="space-y-2">
              <Label className="font-mono-accent text-xs">Bio</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="border-brutal" placeholder="Tell us about yourself..." />
            </div>
            <div className="space-y-2">
              <Label className="font-mono-accent text-xs">Avatar URL</Label>
              <Input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} className="border-brutal" placeholder="https://..." />
            </div>
          </div>

          <div className="section-label">PRO Registration</div>
          <div className="card-brutal space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Registered with a PRO?</p>
                <p className="text-xs text-muted-foreground">SoundExchange, ASCAP, BMI, SOCAN, PRS, etc.</p>
              </div>
              <Switch checked={form.pro_registered} onCheckedChange={(v) => setForm({ ...form, pro_registered: v })} />
            </div>
            {form.pro_registered && (
              <div className="space-y-2">
                <Label className="font-mono-accent text-xs">PRO Organization</Label>
                <Input value={form.pro_organization} onChange={(e) => setForm({ ...form, pro_organization: e.target.value })} className="border-brutal" placeholder="e.g. SoundExchange, ASCAP" />
              </div>
            )}
            <a
              href="https://www.soundexchange.com/artist-copyright-owner/enroll/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary text-xs hover:underline"
            >
              Register with SoundExchange <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="section-label">Social Links</div>
          <div className="card-brutal space-y-3">
            {[
              { key: "website", label: "Website", placeholder: "https://yoursite.com" },
              { key: "twitter", label: "X / Twitter", placeholder: "@handle" },
              { key: "instagram", label: "Instagram", placeholder: "@handle" },
            ].map((s) => (
              <div key={s.key} className="space-y-1">
                <Label className="font-mono-accent text-xs">{s.label}</Label>
                <Input
                  value={(form.socials as any)[s.key] ?? ""}
                  onChange={(e) => setSocial(s.key, e.target.value)}
                  className="border-brutal"
                  placeholder={s.placeholder}
                />
              </div>
            ))}
          </div>

          <Button onClick={save} disabled={saving} className="w-full gap-2 glow-sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
