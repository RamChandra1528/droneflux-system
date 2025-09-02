import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import DroneManagement from "./pages/DroneManagement";
import OrderManagement from "./pages/OrderManagement";
import Tracking from "./pages/Tracking";
import UserManagement from "./pages/UserManagement";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Assignments from "./pages/Assignments";
import Deliveries from "./pages/Deliveries";
import HelpCenter from "./pages/HelpCenter";
import Documentation from "./pages/Documentation";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { GoogleAuthHandler } from "@/components/auth/GoogleAuthHandler";
import DeviceTracking from "./pages/DeviceTracking";
import SimpleDeviceTracking from "./pages/SimpleDeviceTracking";
import DeviceManagement from "./pages/DeviceManagement";
import LiveDeviceMap from "./pages/LiveDeviceMap";

// Create the QueryClient
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/success" element={<GoogleAuthHandler />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/drones" element={<ProtectedRoute roles={["admin", "operator","staff"]}><DroneManagement /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrderManagement /></ProtectedRoute>} />
          <Route path="/tracking" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />
          <Route path="/device-tracking" element={<DeviceTracking />} />
          <Route path="/simple-device-tracking" element={<ProtectedRoute><SimpleDeviceTracking /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute roles={["admin"]}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/devices" element={<ProtectedRoute roles={["admin"]}><DeviceManagement /></ProtectedRoute>} />
          <Route path="/admin/live-map" element={<ProtectedRoute roles={["admin"]}><LiveDeviceMap /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute roles={["admin"]}><Analytics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute roles={["operator"]}><Assignments /></ProtectedRoute>} />
          <Route path="/deliveries" element={<ProtectedRoute roles={["staff"]}><Deliveries /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
          <Route path="/documentation" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;