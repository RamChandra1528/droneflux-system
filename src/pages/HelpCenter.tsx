
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function HelpCenter() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Help Center</h2>
          <p className="text-muted-foreground mt-1">
            Get assistance and support for using the platform.
          </p>
        </div>
        
        <div className="grid gap-4">
          {/* Help Center content will go here */}
          <div className="p-8 rounded-lg border flex items-center justify-center">
            <p className="text-muted-foreground">Help Center coming soon...</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
