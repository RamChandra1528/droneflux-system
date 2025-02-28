
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Battery, BatteryMedium, BatteryLow, BatteryWarning, CheckCircle, AlertCircle, Clock, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drone } from "@/lib/data";

interface DroneSummaryProps {
  drone: Drone;
  className?: string;
  onClick?: () => void;
}

export function DroneSummary({ drone, className, onClick }: DroneSummaryProps) {
  // Determine battery icon based on level
  const BatteryIcon = 
    drone.batteryLevel > 70 ? Battery :
    drone.batteryLevel > 30 ? BatteryMedium :
    drone.batteryLevel > 15 ? BatteryLow : BatteryWarning;
  
  // Status display config
  const statusConfig = {
    available: {
      color: "bg-green-500/15 text-green-600 border-green-200",
      icon: CheckCircle,
    },
    "in-transit": {
      color: "bg-blue-500/15 text-blue-600 border-blue-200",
      icon: Clock,
    },
    charging: {
      color: "bg-yellow-500/15 text-yellow-600 border-yellow-200",
      icon: BatteryMedium,
    },
    maintenance: {
      color: "bg-red-500/15 text-red-600 border-red-200",
      icon: Wrench,
    },
  };
  
  const StatusIcon = statusConfig[drone.status]?.icon || AlertCircle;
  
  return (
    <Card className={cn("overflow-hidden hover-effect", className)} onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">{drone.name}</CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "capitalize font-medium",
              statusConfig[drone.status]?.color
            )}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {drone.status}
          </Badge>
        </div>
        <CardDescription>{drone.model}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Battery Status</span>
              <span className="font-medium flex items-center">
                <BatteryIcon 
                  className={cn(
                    "h-4 w-4 mr-1.5",
                    drone.batteryLevel > 30 ? "text-green-500" :
                    drone.batteryLevel > 15 ? "text-yellow-500" : "text-red-500"
                  )} 
                />
                {drone.batteryLevel}%
              </span>
            </div>
            <Progress value={drone.batteryLevel} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Max Payload</div>
              <div className="font-medium">{drone.maxPayload} kg</div>
            </div>
            <div>
              <div className="text-muted-foreground">Range</div>
              <div className="font-medium">{drone.range} km</div>
            </div>
            <div>
              <div className="text-muted-foreground">Speed</div>
              <div className="font-medium">{drone.speed} km/h</div>
            </div>
            <div>
              <div className="text-muted-foreground">Location</div>
              <div className="font-medium text-xs truncate">
                {drone.location.lat.toFixed(5)}, {drone.location.lng.toFixed(5)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
