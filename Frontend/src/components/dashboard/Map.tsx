
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Order, Drone, mockDrones, mockOrders } from "@/lib/data";
import { LocateFixed, Package, MapPin } from "lucide-react";

interface MapProps {
  className?: string;
}

export function Map({ className }: MapProps) {
  // This is a placeholder component for a map
  // In a real application, you would integrate with a mapping library like Mapbox, Google Maps, or Leaflet
  
  const activeOrders = mockOrders.filter(order => 
    order.status === "in-transit" || order.status === "processing"
  );
  
  const activeDrones = mockDrones.filter(drone =>
    drone.status === "in-transit" || drone.status === "available"
  );
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Delivery Map</CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <LocateFixed className="h-3.5 w-3.5 mr-1" />
            Live
          </Badge>
        </div>
        <CardDescription>
          Track drone deliveries in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 aspect-video relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900">
          {/* Map placeholder */}
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="text-muted-foreground text-sm">Map view would be rendered here</div>
            <div className="text-xs text-muted-foreground/70 mt-1">
              Integration with mapping service required
            </div>
            
            {/* Placeholder markers for drones and orders */}
            <div className="absolute inset-0 p-6">
              {/* Active drones */}
              {activeDrones.map((drone, index) => (
                <DroneMarker 
                  key={drone.id} 
                  drone={drone} 
                  style={{
                    top: `${20 + (index * 15)}%`,
                    left: `${30 + (index * 10)}%`,
                  }}
                />
              ))}
              
              {/* Active orders */}
              {activeOrders.map((order, index) => (
                <OrderMarker
                  key={order.id}
                  order={order}
                  style={{
                    bottom: `${15 + (index * 15)}%`,
                    right: `${20 + (index * 10)}%`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DroneMarkerProps {
  drone: Drone;
  style?: React.CSSProperties;
}

function DroneMarker({ drone, style }: DroneMarkerProps) {
  return (
    <div 
      className="absolute flex flex-col items-center group z-10"
      style={style}
    >
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-primary/80 text-white flex items-center justify-center shadow-lg relative">
          <Package className="h-4 w-4" />
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping-slow" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 bg-popover rounded px-2 py-1 text-xs font-medium shadow-sm border">
          {drone.name}
        </div>
      </div>
    </div>
  );
}

interface OrderMarkerProps {
  order: Order;
  style?: React.CSSProperties;
}

function OrderMarker({ order, style }: OrderMarkerProps) {
  return (
    <div 
      className="absolute flex flex-col items-center group z-10"
      style={style}
    >
      <div className="relative">
        <div className="h-8 w-8 rounded-full bg-foreground/90 text-primary-foreground flex items-center justify-center shadow-lg">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 bg-popover rounded px-2 py-1 text-xs font-medium shadow-sm border max-w-[150px] truncate">
          Order #{order.id}: {order.deliveryLocation.address}
        </div>
      </div>
    </div>
  );
}
