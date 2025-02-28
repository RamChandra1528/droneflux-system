
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  Check, Plane, Package, Map, RefreshCw, 
  BarChart3, Shield, ArrowRight, ChevronRight, 
  Users, Clock, CheckCircle
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export default function Index() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

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

  const testimonials = [
    {
      quote: "DroneFlux has transformed our delivery logistics, cutting delivery times by 50% and significantly improving customer satisfaction.",
      author: "Sarah Johnson",
      position: "Operations Director, EcoDeliveries"
    },
    {
      quote: "The real-time tracking and analytics have given us unprecedented visibility into our delivery operations.",
      author: "Michael Chen",
      position: "CEO, FastTrack Logistics"
    },
    {
      quote: "The geofencing feature ensures our drones operate safely in complex urban environments. It's a game-changer for compliance.",
      author: "David Rodriguez",
      position: "Safety Officer, UrbanAir"
    }
  ];

  const stats = [
    { value: "5,000+", label: "Deliveries Daily" },
    { value: "99.8%", label: "On-time Delivery" },
    { value: "500+", label: "Enterprise Clients" },
    { value: "30min", label: "Average Delivery Time" }
  ];

  return (
    <div className="min-h-screen flex flex-col dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <Plane className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">DroneFlux</span>
          </motion.div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-6">
              <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</a>
              <a href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimonials</a>
              <a href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</a>
            </nav>
            
            <ThemeToggle />
            
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Log in
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
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-600/20 dark:from-gray-900/90 dark:to-gray-900/70 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=2070"
            alt="Drone delivery background" 
            className="w-full h-full object-cover z-0"
          />
        </div>
        
        <div className="container relative z-20 py-24 md:py-32 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary">
                <span className="bg-primary h-2 w-2 rounded-full mr-2"></span>
                <span>Welcome to the future of delivery</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white">
                Revolutionize <span className="text-gradient">Drone Delivery</span> Management
              </h1>
              <p className="max-w-prose text-lg text-gray-200 dark:text-gray-300">
                DroneFlux delivers a comprehensive solution for managing your drone fleet, optimizing delivery routes, and providing real-time tracking for your customers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/login")}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 rounded-full"
                >
                  Watch Demo
                </Button>
              </div>
              
              <div className="pt-4">
                <div className="flex items-center gap-2 text-gray-200">
                  <Check className="h-5 w-5 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <Check className="h-5 w-5 text-primary" />
                  <span>14-day free trial</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <div className="relative mx-auto w-full max-w-lg aspect-video rounded-xl glass-panel overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=2070" 
                  alt="Dashboard preview" 
                  className="w-full h-full object-cover rounded-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                  <div className="p-6 text-white">
                    <h3 className="font-medium text-lg">Intelligent Dashboard</h3>
                    <p className="text-sm text-gray-200">Real-time monitoring and analytics</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 animate-pulse-subtle"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-blue-500/10 backdrop-blur-xl border border-blue-500/20 animate-pulse-subtle"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center space-y-2"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-950 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <p className="text-primary font-medium">Features</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Comprehensive Drone Management
              </h2>
              <p className="text-xl text-muted-foreground mt-4">
                Everything you need to manage your drone delivery operations efficiently in one platform
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="group"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <Card className={cn(
                  "h-full transition-all duration-300 hover:shadow-xl",
                  hoveredFeature === index ? "border-primary/50 bg-primary/[0.03]" : "hover:border-primary/20"
                )}>
                  <CardContent className="p-6 space-y-4">
                    <div className={cn(
                      "w-14 h-14 rounded-lg flex items-center justify-center transition-colors",
                      hoveredFeature === index ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    )}>
                      <feature.icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                    <div className={cn(
                      "flex items-center text-sm font-medium text-primary gap-1 transition-opacity",
                      hoveredFeature === index ? "opacity-100" : "opacity-0"
                    )}>
                      <span>Learn more</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent z-0"></div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <p className="text-primary font-medium">How It Works</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Streamlined Drone Delivery Process
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                From order placement to successful delivery, our platform handles every step efficiently
              </p>
            </motion.div>
          </div>
          
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-24 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-800 z-0 hidden md:block"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {[
                {
                  step: "1",
                  title: "Order Processing",
                  description: "Customers place orders that are automatically processed and validated by our system",
                  icon: Package,
                },
                {
                  step: "2",
                  title: "Drone Assignment",
                  description: "AI algorithms assign the optimal drone based on package size, destination, and weather conditions",
                  icon: Plane,
                },
                {
                  step: "3",
                  title: "Delivery Execution",
                  description: "Drones execute delivery with real-time tracking and status updates for both operators and customers",
                  icon: CheckCircle,
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 * index, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold mb-6 relative">
                    {item.step}
                    <div className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/login")} 
              className="rounded-full"
            >
              Start Using DroneFlux
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <p className="text-primary font-medium">Testimonials</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Trusted by Leading Companies
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                See what our customers have to say about the DroneFlux platform
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="h-5 w-5 fill-current text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>
                    <p className="italic">"{testimonial.quote}"</p>
                    <div className="pt-4">
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 flex justify-center items-center gap-8 flex-wrap">
            {["EcoDeliveries", "FastTrack Logistics", "UrbanAir", "SkyDrop", "DeliverEase"].map((company, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                viewport={{ once: true }}
                className="text-xl font-bold text-gray-400 dark:text-gray-600"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <p className="text-primary font-medium">Pricing</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Plans for Businesses of All Sizes
              </h2>
              <p className="text-lg text-muted-foreground mt-4">
                Choose the plan that best fits your drone delivery operation needs
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$99",
                description: "Perfect for small businesses starting with drone deliveries",
                features: [
                  "Up to 5 drones",
                  "Real-time tracking",
                  "Basic analytics",
                  "Email support"
                ]
              },
              {
                name: "Professional",
                price: "$299",
                description: "Ideal for growing businesses with expanding delivery operations",
                features: [
                  "Up to 20 drones",
                  "Advanced routing optimization",
                  "Comprehensive analytics",
                  "Priority support",
                  "API access"
                ],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "Tailored solutions for large-scale drone delivery operations",
                features: [
                  "Unlimited drones",
                  "Advanced AI optimization",
                  "Custom integrations",
                  "Dedicated account manager",
                  "24/7 premium support",
                  "White-label options"
                ]
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full z-10">
                    Most Popular
                  </div>
                )}
                
                <Card className={cn(
                  "h-full",
                  plan.popular ? "border-primary shadow-lg" : ""
                )}>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        {plan.price !== "Custom" && <span className="text-muted-foreground ml-1">/month</span>}
                      </div>
                      <p className="text-muted-foreground mt-2">{plan.description}</p>
                    </div>
                    
                    <div className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className={cn(
                        "w-full mt-6", 
                        plan.popular ? "" : "bg-primary/90 hover:bg-primary"
                      )}
                      onClick={() => navigate("/login")}
                    >
                      {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/90 to-blue-600/90 text-white">
        <div className="container">
          <div className="rounded-xl glassmorphism backdrop-blur-md p-8 md:p-12 relative overflow-hidden">
            <div className="max-w-3xl relative z-10">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to transform your delivery operations?</h2>
                <p className="text-lg md:text-xl opacity-90 mb-8">
                  Join thousands of businesses that use DroneFlux to manage their drone delivery fleet more efficiently.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/login")}
                    className="bg-white text-primary hover:bg-white/90 rounded-full"
                  >
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 rounded-full"
                  >
                    Schedule a Demo
                  </Button>
                </div>
              </motion.div>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none hidden lg:block">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="absolute right-[-100px] top-[-100px]"
              >
                <svg width="450" height="450" viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M175 350C271.65 350 350 271.65 350 175C350 78.35 271.65 0 175 0C78.35 0 0 78.35 0 175C0 271.65 78.35 350 175 350Z" fill="url(#paint0_linear)" fillOpacity="0.1"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="350" y2="350" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white" stopOpacity="0.4"/>
                      <stop offset="1" stopColor="white" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <Plane className="h-4 w-4" />
                </div>
                <span className="font-bold text-lg">DroneFlux</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                DroneFlux provides a comprehensive platform for managing drone delivery operations,
                helping businesses streamline their logistics and improve customer satisfaction.
              </p>
              <div className="flex gap-4 mt-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5"></div>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Security', 'Integrations', 'Enterprise'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-3">
                {['Documentation', 'API Reference', 'Blog', 'Community', 'Help Center'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} DroneFlux. All rights reserved.
            </div>
            <div className="flex gap-6">
              {['Terms', 'Privacy', 'Cookies'].map((item) => (
                <a key={item} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
