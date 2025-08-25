import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  ShoppingBag, 
  Plane, 
  MapPin, 
  Activity, 
  AlertTriangle, 
  Navigation,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  userRole?: "admin" | "customer" | "operator" | "staff";
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ userRole = "admin", isCollapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  
  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/products", label: "Products", icon: ShoppingBag },
    { href: "/drones", label: "Drones", icon: Plane },
    { href: "/orders", label: "Orders", icon: Package },
    { href: "/tracking", label: "Tracking", icon: MapPin },
    { href: "/simulation", label: "Drone Simulation", icon: Navigation },
    { href: "/emergency", label: "Emergency", icon: AlertTriangle },
    { href: "/users", label: "Users", icon: Users },
    { href: "/analytics", label: "Analytics", icon: Activity },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  
  const customerLinks = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/orders", label: "My Orders", icon: Package },
    { href: "/tracking", label: "Track Order", icon: MapPin },
    { href: "/emergency", label: "Emergency Orders", icon: AlertTriangle },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  
  const operatorLinks = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/drones", label: "Drones", icon: Plane },
    { href: "/assignments", label: "Assignments", icon: Package },
    { href: "/tracking", label: "Tracking", icon: MapPin },
    { href: "/simulation", label: "Drone Simulation", icon: Navigation },
    { href: "/emergency", label: "Emergency", icon: AlertTriangle },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  
  const staffLinks = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/deliveries", label: "Deliveries", icon: Package },
    { href: "/tracking", label: "Tracking", icon: MapPin },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  
  const links = {
    admin: adminLinks,
    customer: customerLinks,
    operator: operatorLinks,
    staff: staffLinks,
  }[userRole] || adminLinks;

  return (
    <div className={cn(
      "fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] bg-background border-r transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Toggle Button */}
      <div className="flex justify-end p-2 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="p-2 space-y-1">
        {links.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  isCollapsed && "justify-center px-2",
                  isActive && "bg-secondary text-secondary-foreground"
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
