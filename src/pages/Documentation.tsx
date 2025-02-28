
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function Documentation() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documentation</h2>
          <p className="text-muted-foreground mt-1">
            Technical documentation and user guides.
          </p>
        </div>
        
        <div className="grid gap-4">
          {/* Documentation content will go here */}
          <div className="p-8 rounded-lg border flex items-center justify-center">
            <p className="text-muted-foreground">Documentation page coming soon...</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
