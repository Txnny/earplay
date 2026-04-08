import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import ArtistOverview from "@/components/dashboards/ArtistOverview";
import DJOverview from "@/components/dashboards/DJOverview";
import AdminOverview from "@/components/dashboards/AdminOverview";

export default function Dashboard() {
  const { roles } = useAuth();
  const activeRole = roles[0];

  return (
    <DashboardLayout>
      {activeRole === "artist" && <ArtistOverview />}
      {activeRole === "dj" && <DJOverview />}
      {activeRole === "admin" && <AdminOverview />}
      {!activeRole && (
        <div className="text-center py-20 text-muted-foreground">
          <p>No role assigned yet. Contact an admin.</p>
        </div>
      )}
    </DashboardLayout>
  );
}
