
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Package, MapPin, ChevronDown, BarChart3, Settings, Users, Activity, Plane, ShoppingBag, AlertTriangle } from "lucide-react";

export function MainNav({ 
  className, 
  userRole = "admin" 
}: { 
  className?: string;
  userRole?: "admin" | "customer" | "operator" | "staff";
}) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const adminLinks = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/products", label: "Products", icon: ShoppingBag },
    { href: "/drones", label: "Drones", icon: Plane },
    { href: "/orders", label: "Orders", icon: Package },
    { href: "/tracking", label: "Tracking", icon: MapPin },
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
    <div className={cn("flex items-center space-x-4 lg:space-x-6", className)}>
      <div className="mr-4 hidden md:flex">
        <NavigationMenu>
          <NavigationMenuList>
            {links.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link to={item.href}>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent hover:bg-transparent",
                      location.pathname === item.href
                        ? "font-medium text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon className="mr-1.5 h-4 w-4" />
                    <span>{item.label}</span>
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      
      <div className="relative md:hidden">
        <Button
          variant="ghost"
          className="px-0 text-base hover:bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="mr-1.5">Menu</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
        
        {isOpen && (
          <div className="absolute top-full left-0 z-50 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-900 ring-1 ring-black ring-opacity-5 animate-scale-in">
            <div className="py-1 rounded-md bg-popover">
              {links.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "block px-4 py-2 text-sm",
                    location.pathname === item.href
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
