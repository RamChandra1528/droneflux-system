
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/dashboard/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { mockDrones, Drone } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { DroneSummary } from "@/components/dashboard/DroneSummary";
import { Map } from "@/components/dashboard/Map";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Battery, BatteryMedium, BatteryLow, CheckCircle, 
  Clock, Wrench, Plus, Filter, Search 
} from "lucide-react";

export default function DroneManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const navigate = useNavigate();

  // Filter drones based on search term and status filter
  const filteredDrones = mockDrones.filter(drone => {
    const matchesSearch = drone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          drone.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? drone.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  // Define columns for the data table
  const columns: ColumnDef<Drone>[] = [
    {
      accessorKey: "name",
      header: "Drone Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "model",
      header: "Model",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusConfig = {
          available: { color: "bg-green-500/15 text-green-600 border-green-200", icon: CheckCircle },
          "in-transit": { color: "bg-blue-500/15 text-blue-600 border-blue-200", icon: Clock },
          charging: { color: "bg-yellow-500/15 text-yellow-600 border-yellow-200", icon: BatteryMedium },
          maintenance: { color: "bg-red-500/15 text-red-600 border-red-200", icon: Wrench },
        };
        
        const config = statusConfig[status as keyof typeof statusConfig];
        const StatusIcon = config?.icon || CheckCircle;
        
        return (
          <Badge variant="outline" className={config?.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            <span className="capitalize">{status}</span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "batteryLevel",
      header: "Battery",
      cell: ({ row }) => {
        const batteryLevel = row.getValue("batteryLevel") as number;
        let BatteryIcon;
        let textColor;
        
        if (batteryLevel > 70) {
          BatteryIcon = Battery;
          textColor = "text-green-500";
        } else if (batteryLevel > 30) {
          BatteryIcon = BatteryMedium;
          textColor = "text-yellow-500";
        } else {
          BatteryIcon = BatteryLow;
          textColor = "text-red-500";
        }
        
        return (
          <div className="flex items-center">
            <BatteryIcon className={`h-4 w-4 mr-1.5 ${textColor}`} />
            <span>{batteryLevel}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "maxPayload",
      header: "Max Payload",
      cell: ({ row }) => `${row.getValue("maxPayload")} kg`,
    },
    {
      accessorKey: "range",
      header: "Range",
      cell: ({ row }) => `${row.getValue("range")} km`,
    },
    {
      accessorKey: "speed",
      header: "Speed",
      cell: ({ row }) => `${row.getValue("speed")} km/h`,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setSelectedDrone(row.original)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Drone Fleet Management</h2>
            <p className="text-muted-foreground mt-1">
              Manage your drone fleet, monitor status, and assign deliveries
            </p>
          </div>
          <Button onClick={() => navigate('/admin/devices')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Drone
          </Button>
        </div>

        <Tabs defaultValue="list">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search drones..."
                  className="pl-9 w-full sm:w-[200px] lg:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  className={!filterStatus ? "bg-primary/10" : undefined}
                  onClick={() => setFilterStatus(null)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={filterStatus === "available" ? "bg-primary/10" : undefined}
                  onClick={() => setFilterStatus(filterStatus === "available" ? null : "available")}
                >
                  <CheckCircle className="h-4 w-4 mr-1.5 text-green-500" />
                  Available
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={filterStatus === "in-transit" ? "bg-primary/10" : undefined}
                  onClick={() => setFilterStatus(filterStatus === "in-transit" ? null : "in-transit")}
                >
                  <Clock className="h-4 w-4 mr-1.5 text-blue-500" />
                  In-Transit
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="list" className="pt-4">
            <DataTable 
              columns={columns} 
              data={filteredDrones} 
              searchPlaceholder="Filter drones..."
            />
          </TabsContent>
          
          <TabsContent value="grid" className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDrones.map(drone => (
                <DroneSummary 
                  key={drone.id} 
                  drone={drone} 
                  className="cursor-pointer"
                  onClick={() => setSelectedDrone(drone)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="map" className="pt-4">
            <div className="rounded-lg border overflow-hidden">
              <Map className="h-[600px]" />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
