
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/dashboard/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { mockUsers, User } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusCircle, Search, Shield, User as UserIcon, 
  UserCog, Plane, Truck 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  
  // Filter users based on search and role
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  // Define columns for the data table
  const columns: ColumnDef<User>[] = [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        const initials = user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();
          
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        const roleConfig = {
          admin: { color: "bg-purple-500/15 text-purple-600 border-purple-200", icon: Shield },
          customer: { color: "bg-blue-500/15 text-blue-600 border-blue-200", icon: UserIcon },
          operator: { color: "bg-orange-500/15 text-orange-600 border-orange-200", icon: Plane },
          staff: { color: "bg-green-500/15 text-green-600 border-green-200", icon: Truck },
        };
        
        const config = roleConfig[role as keyof typeof roleConfig];
        const RoleIcon = config?.icon || UserIcon;
        
        return (
          <Badge variant="outline" className={config?.color}>
            <RoleIcon className="h-3 w-3 mr-1" />
            <span className="capitalize">{role}</span>
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Delete</Button>
        </div>
      ),
    },
  ];

  // Role stats
  const roleStats = {
    admin: mockUsers.filter(user => user.role === "admin").length,
    customer: mockUsers.filter(user => user.role === "customer").length,
    operator: mockUsers.filter(user => user.role === "operator").length,
    staff: mockUsers.filter(user => user.role === "staff").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground mt-1">
              Manage user accounts and permissions across the platform
            </p>
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New User
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`${roleFilter === null ? "bg-primary/10 border-primary" : ""} hover:bg-primary/5 cursor-pointer transition-colors`} onClick={() => setRoleFilter(null)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUsers.length}</div>
              <p className="text-xs text-muted-foreground">Total users in system</p>
            </CardContent>
          </Card>
          
          <Card className={`${roleFilter === "admin" ? "bg-primary/10 border-primary" : ""} hover:bg-primary/5 cursor-pointer transition-colors`} onClick={() => setRoleFilter(roleFilter === "admin" ? null : "admin")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats.admin}</div>
              <p className="text-xs text-muted-foreground">Users with admin access</p>
            </CardContent>
          </Card>
          
          <Card className={`${roleFilter === "customer" ? "bg-primary/10 border-primary" : ""} hover:bg-primary/5 cursor-pointer transition-colors`} onClick={() => setRoleFilter(roleFilter === "customer" ? null : "customer")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats.customer}</div>
              <p className="text-xs text-muted-foreground">Registered customers</p>
            </CardContent>
          </Card>
          
          <Card className={`${roleFilter === "operator" || roleFilter === "staff" ? "bg-primary/10 border-primary" : ""} hover:bg-primary/5 cursor-pointer transition-colors`} onClick={() => setRoleFilter(roleFilter === "operator" || roleFilter === "staff" ? null : "operator")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Staff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{roleStats.operator + roleStats.staff}</div>
              <p className="text-xs text-muted-foreground">Operators and delivery staff</p>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-md border">
          <div className="p-4 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setRoleFilter(null)}>
                Clear Filters
              </Button>
            </div>
          </div>
          <DataTable 
            columns={columns} 
            data={filteredUsers} 
            searchPlaceholder="Filter users..."
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
