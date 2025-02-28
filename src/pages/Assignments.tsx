
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Assignments() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Drone Assignments</h2>
          <p className="text-muted-foreground mt-1">
            Manage and track drone delivery assignments.
          </p>
        </div>
        
        <div className="grid gap-4">
          {/* Assignments content will go here */}
          <div className="p-8 rounded-lg border flex items-center justify-center">
            <p className="text-muted-foreground">Assignments dashboard coming soon...</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
