
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { MainNav } from "./MainNav";
import { UserNav } from "./UserNav";
import { Toaster } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: "admin" | "customer" | "operator" | "staff";
}

export function DashboardLayout({ 
  children, 
  userRole = "admin" 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Drone className="h-6 w-6 text-primary" />
              <div className="hidden sm:block text-lg font-semibold tracking-tight">
                DroneFlux
              </div>
            </div>
          </div>
          
          {!isMobile && <MainNav userRole={userRole} />}
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                  <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">New Order Placed</span>
                    <span className="text-xs text-muted-foreground">2 minutes ago</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">Drone Maintenance Required</span>
                    <span className="text-xs text-muted-foreground">1 hour ago</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">Delivery Completed</span>
                    <span className="text-xs text-muted-foreground">3 hours ago</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <UserNav />
          </div>
        </div>
      </header>
      
      {/* Mobile sidebar */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all duration-200",
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Drone className="h-6 w-6 text-primary" />
                <div className="text-lg font-semibold tracking-tight">
                  DroneFlux
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <MainNav userRole={userRole} />
          </div>
        </div>
      )}
      
      <main className="flex-1">
        <div className="container py-6">
          {children}
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}

// Import Drone icon to fix error
import { Drone } from "lucide-react";
