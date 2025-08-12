
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { DroneSummary } from "@/components/dashboard/DroneSummary";
import { DeliverySummary } from "@/components/dashboard/DeliverySummary";
import { OrderStats } from "@/components/dashboard/OrderStats";
import { Map } from "@/components/dashboard/Map";
import { droneStats, orderStats, deliveryPerformance, mockDrones, mockOrders } from "@/lib/data";
import { Package, Plane, Clock, TrendingUp, BarChart, CheckCircle, AlertCircle, ShoppingBag, Truck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Get a subset of drones and orders for the dashboard
  const displayDrones = mockDrones.slice(0, 3);
  const displayOrders = mockOrders.filter(order => 
    user?.role === "customer" 
      ? order.customerId === user.id 
      : order.status === "in-transit" || order.status === "processing"
  );

  // Different welcome messages based on user role
  const welcomeMessages = {
    admin: "Welcome to your admin dashboard. Monitor all operations and performance metrics.",
    customer: "Track your orders and manage your delivery preferences.",
    operator: "Monitor drone fleet and manage delivery assignments.",
    staff: "View assigned deliveries and update delivery statuses."
  };

  // Content blocks for different user roles
  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Total Orders Today"
          value={orderStats.today}
          icon={Package}
          trend={{ value: 12, isPositive: true }}
          iconColor="bg-primary"
          tooltipText="Number of orders placed today"
        />
        <StatusCard
          title="Active Drones"
          value={`${droneStats.available + droneStats.inTransit}/${droneStats.total}`}
          icon={Plane}
          iconColor="bg-green-500"
          tooltipText="Available and in-transit drones"
        />
        <StatusCard
          title="Avg. Delivery Time"
          value={`${deliveryPerformance.avgDeliveryTime} min`}
          icon={Clock}
          trend={{ value: 8, isPositive: false }}
          iconColor="bg-orange-500"
          tooltipText="Average time from order to delivery"
        />
        <StatusCard
          title="Today's Revenue"
          value={`$${orderStats.totalRevenue.toFixed(2)}`}
          icon={TrendingUp}
          trend={{ value: 24, isPositive: true }}
          iconColor="bg-blue-500"
          tooltipText="Total revenue from completed orders today"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Map className="h-[400px]" />
        </div>
        <div className="lg:col-span-1 order-1 lg:order-2">
          <OrderStats className="h-[400px]" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-2 order-2 lg:order-1">
          <h3 className="text-lg font-medium">Active Deliveries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayOrders.map(order => (
              <DeliverySummary key={order.id} order={order} />
            ))}
            {displayOrders.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-40 bg-muted/20 rounded-lg border-2 border-dashed">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2" />
                  <p>No active deliveries</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6 order-1 lg:order-2">
          <h3 className="text-lg font-medium">Active Drones</h3>
          <div className="space-y-4">
            {displayDrones.map(drone => (
              <DroneSummary key={drone.id} drone={drone} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusCard
          title="On-Time Delivery Rate"
          value={`${deliveryPerformance.onTimeDelivery}%`}
          icon={CheckCircle}
          trend={{ value: 3, isPositive: true }}
          iconColor="bg-green-500"
          tooltipText="Percentage of deliveries completed on time"
        />
        <StatusCard
          title="Customer Satisfaction"
          value={deliveryPerformance.customerSatisfaction.toFixed(1)}
          description="out of 5.0"
          icon={TrendingUp}
          trend={{ value: 0.2, isPositive: true }}
          iconColor="bg-blue-500"
          tooltipText="Average customer rating"
        />
        <StatusCard
          title="Failed Deliveries"
          value={`${deliveryPerformance.failedDeliveries}%`}
          icon={AlertCircle}
          trend={{ value: 1.5, isPositive: false }}
          iconColor="bg-destructive"
          tooltipText="Percentage of failed deliveries"
        />
        <StatusCard
          title="Performance Score"
          value="92.8"
          icon={BarChart}
          trend={{ value: 4.2, isPositive: true }}
          iconColor="bg-purple-500"
          tooltipText="Overall system performance score"
        />
      </div>
    </>
  );

  const renderCustomerDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Your Active Orders"
          value={displayOrders.length}
          icon={Package}
          iconColor="bg-primary"
          tooltipText="Number of your orders in progress"
        />
        <StatusCard
          title="Total Orders"
          value={mockOrders.filter(order => order.customerId === user?.id).length}
          icon={ShoppingBag}
          iconColor="bg-orange-500"
          tooltipText="Total number of orders you've placed"
        />
        <StatusCard
          title="Completed Deliveries"
          value={mockOrders.filter(order => order.customerId === user?.id && order.status === "delivered").length}
          icon={CheckCircle}
          iconColor="bg-green-500"
          tooltipText="Number of completed deliveries"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Track Your Orders</h3>
        <Map className="h-[300px] mb-6" />
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Your Orders</h3>
            <Button onClick={() => navigate("/orders")}>View All Orders</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayOrders.map(order => (
              <DeliverySummary key={order.id} order={order} />
            ))}
            {displayOrders.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-40 bg-muted/20 rounded-lg border-2 border-dashed">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2" />
                  <p>No active orders</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderOperatorDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Active Drones"
          value={`${droneStats.available + droneStats.inTransit}/${droneStats.total}`}
          icon={Plane}
          iconColor="bg-green-500"
          tooltipText="Available and in-transit drones"
        />
        <StatusCard
          title="Pending Assignments"
          value={orderStats.pending + orderStats.processing}
          icon={Package}
          iconColor="bg-orange-500"
          tooltipText="Orders waiting for drone assignment"
        />
        <StatusCard
          title="Drones in Maintenance"
          value={droneStats.maintenance}
          icon={Wrench}
          iconColor="bg-red-500"
          tooltipText="Drones currently in maintenance"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Fleet Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Map className="h-[300px]" />
          </div>
          <div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Drone Status</h3>
              {mockDrones.map(drone => (
                <DroneSummary key={drone.id} drone={drone} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Active Deliveries</h3>
            <Button onClick={() => navigate("/assignments")}>Manage Assignments</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayOrders.map(order => (
              <DeliverySummary key={order.id} order={order} />
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderStaffDashboard = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Today's Deliveries"
          value={orderStats.today}
          icon={Truck}
          iconColor="bg-primary"
          tooltipText="Number of deliveries scheduled for today"
        />
        <StatusCard
          title="Pending Pickups"
          value={orderStats.processing}
          icon={Package}
          iconColor="bg-orange-500"
          tooltipText="Deliveries waiting for pickup"
        />
        <StatusCard
          title="Completed Today"
          value={2}
          icon={CheckCircle}
          iconColor="bg-green-500"
          tooltipText="Deliveries completed today"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Delivery Map</h3>
        <Map className="h-[300px] mb-6" />
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Your Assigned Deliveries</h3>
            <Button onClick={() => navigate("/deliveries")}>View All Deliveries</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayOrders.map(order => (
              <DeliverySummary key={order.id} order={order} />
            ))}
            {displayOrders.length === 0 && (
              <div className="col-span-full flex items-center justify-center h-40 bg-muted/20 rounded-lg border-2 border-dashed">
                <div className="flex flex-col items-center text-muted-foreground">
                  <Package className="h-8 w-8 mb-2" />
                  <p>No assigned deliveries</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Render dashboard content based on user role
  const renderDashboardContent = () => {
    switch (user?.role) {
      case "admin":
        return renderAdminDashboard();
      case "customer":
        return renderCustomerDashboard();
      case "operator":
        return renderOperatorDashboard();
      case "staff":
        return renderStaffDashboard();
      default:
        return renderAdminDashboard();
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
             {welcomeMessages[user?.role || "admin"]} 
            
          </p>
        </div>
        
        {renderDashboardContent()}
      </div>
    </DashboardLayout>
  );
}

// Missing component import
import { Wrench } from "lucide-react";
