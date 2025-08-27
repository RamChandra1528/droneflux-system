
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { MainNav } from "./MainNav";
import { Sidebar } from "./Sidebar";
import { UserNav } from "./UserNav";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, Plane } from "lucide-react";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
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
              <Plane className="h-6 w-6 text-primary" />
              <div className="hidden sm:block text-lg font-semibold tracking-tight">
                DroneFlux
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationBell />
            <UserNav user={user || undefined} />
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          userRole={user?.role || "admin"} 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      )}
      
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
                <Plane className="h-6 w-6 text-primary" />
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
            <MainNav userRole={user?.role || "admin"} />
          </div>
        </div>
      )}
      
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        !isMobile && (sidebarCollapsed ? "ml-16" : "ml-64")
      )}>
        <div className="container py-6">
          {children}
        </div>
      </main>
      
      <Toaster />
    </div>
  );
}
