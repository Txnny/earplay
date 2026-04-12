import { useActiveRole } from "@/hooks/useActiveRole";
import DashboardLayout from "@/components/DashboardLayout";
import ArtistOverview from "@/components/dashboards/ArtistOverview";
import DJOverview from "@/components/dashboards/DJOverview";
import AdminOverview from "@/components/dashboards/AdminOverview";

export default function Dashboard() {
  const { activeRole } = useActiveRole();

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
