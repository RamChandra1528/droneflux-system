
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground mt-1">
            View performance metrics and analytics for your drone delivery operations.
          </p>
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Analytics content will go here */}
          <div className="p-8 rounded-lg border flex items-center justify-center">
            <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
