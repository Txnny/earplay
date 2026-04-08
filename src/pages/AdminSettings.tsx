import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Save, Plus, Trash2, Loader2 } from "lucide-react";

interface ConfigEntry {
  key: string;
  value: string;
  updated_at: string;
  isNew?: boolean;
}

const KNOWN_KEYS = [
  { key: "stream_url", label: "Stream URL", placeholder: "https://your-azuracast.example.com/radio/8000/main.mp3" },
  { key: "azuracast_api_url", label: "AzuraCast API URL", placeholder: "https://your-azuracast.example.com" },
  { key: "station_name", label: "Station Name", placeholder: "WAVEFORM Radio" },
];

export default function AdminSettings() {
  const [configs, setConfigs] = useState<ConfigEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const load = async () => {
    const { data } = await supabase.from("station_config").select("*").order("key");
    setConfigs(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveConfig = async (key: string, value: string) => {
    setSaving(key);
    const { error } = await supabase
      .from("station_config")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    toast.success(`"${key}" saved`);
    load();
  };

  const deleteConfig = async (key: string) => {
    const { error } = await supabase.from("station_config").delete().eq("key", key);
    if (error) { toast.error(error.message); return; }
    toast.success(`"${key}" deleted`);
    load();
  };

  const addNew = async () => {
    if (!newKey.trim()) return;
    await saveConfig(newKey.trim(), newValue);
    setNewKey("");
    setNewValue("");
  };

  const updateValue = (key: string, value: string) => {
    setConfigs((prev) => prev.map((c) => (c.key === key ? { ...c, value } : c)));
  };

  const existingKeys = new Set(configs.map((c) => c.key));
  const missingKnown = KNOWN_KEYS.filter((k) => !existingKeys.has(k.key));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Station Settings</h1>
        </div>

        {missingKnown.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Quick Setup</CardTitle>
              <CardDescription>These recommended settings haven't been configured yet.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {missingKnown.map((k) => (
                <div key={k.key} className="space-y-1">
                  <Label className="text-sm font-medium">{k.label} <span className="text-muted-foreground font-mono text-xs">({k.key})</span></Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder={k.placeholder}
                      id={`new-${k.key}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = (e.target as HTMLInputElement).value;
                          if (val) saveConfig(k.key, val);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-1"
                      disabled={saving === k.key}
                      onClick={() => {
                        const el = document.getElementById(`new-${k.key}`) as HTMLInputElement;
                        if (el?.value) saveConfig(k.key, el.value);
                      }}
                    >
                      {saving === k.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base">Current Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            ) : configs.length === 0 ? (
              <p className="text-muted-foreground text-sm">No configuration values set yet.</p>
            ) : (
              configs.map((c) => {
                const known = KNOWN_KEYS.find((k) => k.key === c.key);
                return (
                  <div key={c.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        {known?.label ?? c.key} <span className="text-muted-foreground font-mono text-xs">({c.key})</span>
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        Updated {new Date(c.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={c.value}
                        onChange={(e) => updateValue(c.key, e.target.value)}
                        placeholder={known?.placeholder}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1"
                        disabled={saving === c.key}
                        onClick={() => saveConfig(c.key, c.value)}
                      >
                        {saving === c.key ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteConfig(c.key)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Custom Setting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="key_name" value={newKey} onChange={(e) => setNewKey(e.target.value)} className="max-w-[200px]" />
              <Input placeholder="value" value={newValue} onChange={(e) => setNewValue(e.target.value)} className="flex-1" />
              <Button size="sm" onClick={addNew} disabled={!newKey.trim()} className="gap-1">
                <Plus className="w-3 h-3" /> Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
