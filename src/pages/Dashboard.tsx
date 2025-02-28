
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { DroneSummary } from "@/components/dashboard/DroneSummary";
import { DeliverySummary } from "@/components/dashboard/DeliverySummary";
import { OrderStats } from "@/components/dashboard/OrderStats";
import { Map } from "@/components/dashboard/Map";
import { droneStats, orderStats, deliveryPerformance, mockDrones, mockOrders } from "@/lib/data";
import { Package, Drone, Clock, TrendingUp, Truck, BarChart, CheckCircle, AlertCircle } from "lucide-react";

export default function Dashboard() {
  // Get a subset of drones and orders for the dashboard
  const displayDrones = mockDrones.slice(0, 3);
  const displayOrders = mockOrders.filter(order => 
    order.status === "in-transit" || order.status === "processing"
  );
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome to your drone delivery management dashboard.
          </p>
        </div>
        
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
            icon={Drone}
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
      </div>
    </DashboardLayout>
  );
}
