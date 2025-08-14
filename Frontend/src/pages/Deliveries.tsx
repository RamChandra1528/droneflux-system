
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Deliveries() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Deliveries</h2>
          <p className="text-muted-foreground mt-1">
            Track and manage scheduled and active deliveries.
          </p>
        </div>
        
        <div className="grid gap-4">
          {/* Deliveries content will go here */}
          <div className="p-8 rounded-lg border flex items-center justify-center">
            <p className="text-muted-foreground">Deliveries dashboard coming soon...</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
