
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Plane, Package, Map, RefreshCw, BarChart3, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Plane,
      title: "Drone Management",
      description: "Monitor and control your entire drone fleet in real-time"
    },
    {
      icon: Package,
      title: "Order Processing",
      description: "Efficient order handling from receipt to delivery"
    },
    {
      icon: Map,
      title: "Real-time Tracking",
      description: "Track all deliveries with live location updates"
    },
    {
      icon: RefreshCw,
      title: "Automated Scheduling",
      description: "AI-powered route optimization and drone assignment"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive reports and performance metrics"
    },
    {
      icon: Shield,
      title: "Geofencing",
      description: "Define safe flight zones and receive alerts for violations"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <Plane className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold tracking-tight">DroneFlux</span>
            </motion.div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Sign In
              </Button>
            </motion.div>
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button onClick={() => navigate("/login")}>Get Started</Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 flex-1 bg-gradient-to-b from-background to-muted/30">
        <div className="container flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium">
                <span className="bg-primary h-2 w-2 rounded-full mr-2"></span>
                <span>Introducing DroneFlux System</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="text-gradient">Drone Delivery</span> 
                <br />
                Management Platform
              </h1>
              <p className="max-w-prose text-muted-foreground text-lg">
                Efficiently manage your drone fleet, optimize delivery routes, and ensure timely deliveries with our comprehensive drone management system.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" onClick={() => navigate("/login")}>
                Get Started
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex-1"
          >
            <div className="relative mx-auto w-full max-w-md aspect-video rounded-xl glass-panel overflow-hidden shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Plane className="h-16 w-16 mx-auto text-primary/60 animate-float" />
                  <p className="mt-4 font-medium">Drone Management Dashboard</p>
                  <p className="text-sm text-muted-foreground">Sign in to access your dashboard</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Comprehensive Drone Management</h2>
            <p className="text-muted-foreground">
              Everything you need to manage your drone delivery operations efficiently in one platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                className="group rounded-lg border bg-card hover-effect"
              >
                <div className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="container">
          <div className="rounded-xl glass-panel p-8 md:p-12 relative overflow-hidden">
            <div className="max-w-2xl relative z-10">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to optimize your drone operations?</h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of businesses that use DroneFlux to manage their drone delivery fleet more efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={() => navigate("/login")}>
                  Get Started Now
                </Button>
                <Button size="lg" variant="outline">
                  Schedule a Demo
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full hidden lg:block">
              <div className="absolute right-[-100px] top-1/2 transform -translate-y-1/2">
                <svg width="350" height="350" viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M175 350C271.65 350 350 271.65 350 175C350 78.35 271.65 0 175 0C78.35 0 0 78.35 0 175C0 271.65 78.35 350 175 350Z" fill="url(#paint0_linear)" fillOpacity="0.1"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="350" y2="350" gradientUnits="userSpaceOnUse">
                      <stop stopColor="hsl(var(--primary))" stopOpacity="0.7"/>
                      <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Plane className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold">DroneFlux</span>
            </div>
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} DroneFlux. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
