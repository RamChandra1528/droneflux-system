
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockLogin } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, you would use your authentication provider here
      const user = await mockLogin(email, password);

      if (user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Preset user credentials for demo
  const setDemoCredentials = (role: string) => {
    switch (role) {
      case "admin":
        setEmail("admin@droneflux.com");
        setPassword("password123");
        break;
      case "customer":
        setEmail("john@example.com");
        setPassword("password123");
        break;
      case "operator":
        setEmail("mike@droneflux.com");
        setPassword("password123");
        break;
      case "staff":
        setEmail("sarah@droneflux.com");
        setPassword("password123");
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <div className="w-full max-w-md px-4 py-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Plane className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            DroneFlux System
          </h1>
          <p className="text-muted-foreground mt-1">
            Drone Delivery Management Platform
          </p>
        </div>
        
        <Card className="glass-card animate-fade-in">
          <CardHeader>
            <CardTitle>Log in</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">
                  Demo accounts
                </span>
              </div>
            </div>
            
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="customer">Customer</TabsTrigger>
                <TabsTrigger value="operator">Operator</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
              </TabsList>
              <TabsContent value="admin">
                <div className="text-xs p-3 bg-muted/50 rounded-md mt-2">
                  <p className="font-medium mb-1">Admin Account</p>
                  <p className="text-muted-foreground mb-1">Email: admin@droneflux.com</p>
                  <p className="text-muted-foreground">Password: password123</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="px-0 h-auto text-xs mt-1"
                    onClick={() => setDemoCredentials("admin")}
                  >
                    Use these credentials
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="customer">
                <div className="text-xs p-3 bg-muted/50 rounded-md mt-2">
                  <p className="font-medium mb-1">Customer Account</p>
                  <p className="text-muted-foreground mb-1">Email: john@example.com</p>
                  <p className="text-muted-foreground">Password: password123</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="px-0 h-auto text-xs mt-1"
                    onClick={() => setDemoCredentials("customer")}
                  >
                    Use these credentials
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="operator">
                <div className="text-xs p-3 bg-muted/50 rounded-md mt-2">
                  <p className="font-medium mb-1">Operator Account</p>
                  <p className="text-muted-foreground mb-1">Email: mike@droneflux.com</p>
                  <p className="text-muted-foreground">Password: password123</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="px-0 h-auto text-xs mt-1"
                    onClick={() => setDemoCredentials("operator")}
                  >
                    Use these credentials
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="staff">
                <div className="text-xs p-3 bg-muted/50 rounded-md mt-2">
                  <p className="font-medium mb-1">Staff Account</p>
                  <p className="text-muted-foreground mb-1">Email: sarah@droneflux.com</p>
                  <p className="text-muted-foreground">Password: password123</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="px-0 h-auto text-xs mt-1"
                    onClick={() => setDemoCredentials("staff")}
                  >
                    Use these credentials
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              <span>Don&apos;t have an account? </span>
              <a
                href="#"
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign up
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
