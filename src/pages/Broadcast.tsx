import DashboardLayout from "@/components/DashboardLayout";
import DJGoLive from "@/components/DJGoLive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi, ExternalLink } from "lucide-react";

export default function Broadcast() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Wifi className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Live Broadcast</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <DJGoLive />

          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="text-base font-medium">How to Broadcast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. Open your streaming software (BUTT, Mixxx, OBS, etc.)</p>
              <p>2. Connect to the station's AzuraCast mount point</p>
              <p>3. Click <strong className="text-foreground">"Go Live"</strong> here to update your status</p>
              <p>4. Update the "Now Playing" field as you spin tracks</p>
              <p>5. Click <strong className="text-foreground">"Go Offline"</strong> when your set is done</p>
              <div className="pt-2 border-t border-border/40">
                <a
                  href="https://www.azuracast.com/docs/user-guide/streaming-software/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  AzuraCast Streaming Guide <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
