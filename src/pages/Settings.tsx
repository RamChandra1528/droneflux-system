
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Settings() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your account and application settings.
          </p>
        </div>
        
        <div className="grid gap-4">
          {/* Settings content will go here */}
          <div className="p-8 rounded-lg border flex items-center justify-center">
            <p className="text-muted-foreground">Settings page coming soon...</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
