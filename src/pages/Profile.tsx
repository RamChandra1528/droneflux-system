
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Profile() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground mt-1">
            Manage your personal profile and preferences.
          </p>
        </div>
        
        <div className="grid gap-4">
          {/* Profile content will go here */}
          <div className="p-8 rounded-lg border flex items-center justify-center">
            <p className="text-muted-foreground">Profile page coming soon...</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
