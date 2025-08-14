
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock, Package, MapPin, CheckCircle, Clock, AlertTriangle, LocateFixed, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Order } from "@/lib/data";
import { Button } from "@/components/ui/button";

interface DeliverySummaryProps {
  order: Order;
  className?: string;
}

export function DeliverySummary({ order, className }: DeliverySummaryProps) {
  // Status display config
  const statusConfig = {
    pending: {
      color: "bg-orange-500/15 text-orange-600 border-orange-200",
      icon: Clock,
    },
    processing: {
      color: "bg-blue-500/15 text-blue-600 border-blue-200",
      icon: Package,
    },
    "in-transit": {
      color: "bg-indigo-500/15 text-indigo-600 border-indigo-200",
      icon: LocateFixed,
    },
    delivered: {
      color: "bg-green-500/15 text-green-600 border-green-200",
      icon: CheckCircle,
    },
    cancelled: {
      color: "bg-red-500/15 text-red-600 border-red-200",
      icon: AlertTriangle,
    },
  };
  
  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true
    });
  };
  
  return (
    <Card className={cn("overflow-hidden hover-effect", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Order #{order.id}</CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "capitalize font-medium",
              statusConfig[order.status]?.color
            )}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {order.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <CalendarClock className="h-3 w-3" />
          <span>Created: {formatDate(order.createdAt)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Customer info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>
                {order.customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{order.customerName}</div>
              <div className="text-xs text-muted-foreground">Customer</div>
            </div>
          </div>
          
          {/* Order details */}
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="text-muted-foreground">Payment</div>
              <div className="font-medium capitalize">
                {order.paymentStatus}
                {order.paymentMethod && ` (${order.paymentMethod})`}
              </div>
              
              <div className="text-muted-foreground">Amount</div>
              <div className="font-medium">${order.price.toFixed(2)}</div>
              
              <div className="text-muted-foreground">Items</div>
              <div className="font-medium">
                {order.items.reduce((acc, item) => acc + item.quantity, 0)} 
                {order.items.length > 1 ? ' items' : ' item'}
              </div>
              
              <div className="text-muted-foreground">Weight</div>
              <div className="font-medium">{order.totalWeight} kg</div>
            </div>
            
            {/* Location info */}
            <div className="pt-2 space-y-2 text-sm">
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-muted-foreground">From</div>
                  <div className="font-medium">{order.pickupLocation.address}</div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-muted-foreground">To</div>
                  <div className="font-medium">{order.deliveryLocation.address}</div>
                </div>
              </div>
              
              {order.droneId && (
                <div className="flex gap-2 pt-1">
                  <Package className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-muted-foreground">Drone</div>
                    <div className="font-medium">{order.droneName}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Button size="sm" variant="outline" className="w-full">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
