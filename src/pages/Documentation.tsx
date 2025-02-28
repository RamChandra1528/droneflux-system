
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { 
  BookOpen, Search, FileText, Layout, Package, Plane, 
  Map, Settings, Clock, User, FileCode, ChevronRight, ExternalLink, Download,
  Coffee, Code, ListChecks, Bookmark
} from "lucide-react";

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Documentation sections
  const gettingStartedDocs = [
    { 
      title: "Platform Overview", 
      description: "Introduction to the DroneFlux platform and its capabilities",
      icon: Layout,
      updated: "2 weeks ago" 
    },
    { 
      title: "Account Setup", 
      description: "How to set up and configure your DroneFlux account", 
      icon: User,
      updated: "1 month ago" 
    },
    { 
      title: "First Order Guide", 
      description: "Step-by-step guide to placing your first drone delivery order", 
      icon: Package,
      updated: "3 weeks ago" 
    },
    { 
      title: "Dashboard Navigation", 
      description: "Overview of the dashboard interface and navigation", 
      icon: Layout,
      updated: "2 months ago" 
    },
  ];
  
  const userGuideDocs = [
    { 
      title: "Order Management", 
      description: "Complete guide to creating and managing delivery orders", 
      icon: Package,
      updated: "1 week ago" 
    },
    { 
      title: "Drone Fleet Guide", 
      description: "Understanding drone capabilities and management", 
      icon: Plane,
      updated: "3 weeks ago" 
    },
    { 
      title: "Tracking System", 
      description: "How to use the real-time tracking system", 
      icon: Map,
      updated: "1 month ago" 
    },
    { 
      title: "Delivery Scheduling", 
      description: "Guide to scheduling and optimizing deliveries", 
      icon: Clock,
      updated: "2 weeks ago" 
    },
    { 
      title: "User Management", 
      description: "Managing user accounts and permissions", 
      icon: User,
      updated: "1 month ago" 
    },
    { 
      title: "System Settings", 
      description: "Configuring platform settings and preferences", 
      icon: Settings,
      updated: "2 months ago" 
    },
  ];
  
  const apiDocuments = [
    { 
      title: "API Overview", 
      description: "Introduction to the DroneFlux API and authentication", 
      icon: FileCode,
      updated: "2 weeks ago" 
    },
    { 
      title: "Order API", 
      description: "API endpoints for managing delivery orders", 
      icon: Package,
      updated: "1 week ago" 
    },
    { 
      title: "Drone API", 
      description: "API endpoints for drone fleet management", 
      icon: Plane,
      updated: "3 weeks ago" 
    },
    { 
      title: "Tracking API", 
      description: "Real-time tracking and location data endpoints", 
      icon: Map,
      updated: "1 month ago" 
    },
  ];
  
  // Filter documents based on search
  const filterDocs = (docs: any[]) => {
    if (!searchQuery) return docs;
    return docs.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  // Technical specifications
  const droneSpecs = [
    { model: "Falcon-X1", payload: "2.5 kg", range: "30 km", speed: "65 km/h", battery: "45 min" },
    { model: "Swift-D2", payload: "1.8 kg", range: "25 km", speed: "58 km/h", battery: "40 min" },
    { model: "HeavyLift-H1", payload: "5.0 kg", range: "20 km", speed: "45 km/h", battery: "35 min" },
    { model: "NimbleBot-N1", payload: "2.0 kg", range: "28 km", speed: "72 km/h", battery: "38 min" },
    { model: "DeliveryPro-P3", payload: "4.5 kg", range: "35 km", speed: "55 km/h", battery: "50 min" },
  ];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documentation</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive guides, technical specifications, and API documentation.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-3/4">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="user-guide" className="space-y-6">
              <TabsList className="w-full grid grid-cols-1 md:grid-cols-3">
                <TabsTrigger value="getting-started">
                  <Coffee className="h-4 w-4 mr-2" />
                  Getting Started
                </TabsTrigger>
                <TabsTrigger value="user-guide">
                  <BookOpen className="h-4 w-4 mr-2" />
                  User Guide
                </TabsTrigger>
                <TabsTrigger value="api-docs">
                  <Code className="h-4 w-4 mr-2" />
                  API Reference
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="getting-started" className="space-y-4">
                <h3 className="text-xl font-bold">Getting Started with DroneFlux</h3>
                <p className="text-muted-foreground mb-6">
                  Essential guides to help you get started with the DroneFlux platform.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filterDocs(gettingStartedDocs).map((doc, index) => (
                    <Card key={index} className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <doc.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-medium">{doc.title}</h4>
                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                            <p className="text-xs text-muted-foreground">Updated {doc.updated}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {filterDocs(gettingStartedDocs).length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="font-medium mb-1">No matches found</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        We couldn't find any documentation matching your search. Try different keywords.
                      </p>
                      <Button variant="outline" onClick={() => setSearchQuery("")}>
                        Clear Search
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                <div className="pt-4 flex justify-center">
                  <Button>
                    View All Getting Started Guides
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="user-guide" className="space-y-4">
                <h3 className="text-xl font-bold">User Guide</h3>
                <p className="text-muted-foreground mb-6">
                  Comprehensive documentation for using all features of the DroneFlux platform.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filterDocs(userGuideDocs).map((doc, index) => (
                    <Card key={index} className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <doc.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-medium">{doc.title}</h4>
                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                            <p className="text-xs text-muted-foreground">Updated {doc.updated}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {filterDocs(userGuideDocs).length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="font-medium mb-1">No matches found</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        We couldn't find any documentation matching your search. Try different keywords.
                      </p>
                      <Button variant="outline" onClick={() => setSearchQuery("")}>
                        Clear Search
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                <div className="pt-4 flex justify-center">
                  <Button>
                    View Complete User Guide
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="api-docs" className="space-y-4">
                <h3 className="text-xl font-bold">API Documentation</h3>
                <p className="text-muted-foreground mb-6">
                  Technical reference for the DroneFlux API and integration guides.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filterDocs(apiDocuments).map((doc, index) => (
                    <Card key={index} className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <doc.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-medium">{doc.title}</h4>
                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                            <p className="text-xs text-muted-foreground">Updated {doc.updated}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {filterDocs(apiDocuments).length === 0 && (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="font-medium mb-1">No matches found</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        We couldn't find any API documentation matching your search. Try different keywords.
                      </p>
                      <Button variant="outline" onClick={() => setSearchQuery("")}>
                        Clear Search
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>API Authentication</CardTitle>
                    <CardDescription>
                      Learn how to authenticate your requests to the DroneFlux API
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-md">
                        <p className="font-mono text-sm">
                          # Example API Request with Authentication<br />
                          curl -X GET https://api.droneflux.com/v1/orders \<br />
                          &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br />
                          &nbsp;&nbsp;-H "Content-Type: application/json"
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        All API requests must include your API key in the Authorization header. You can generate an API key in the Settings section.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="pt-4 flex justify-center">
                  <Button>
                    View Full API Documentation
                    <ExternalLink className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Technical Specifications</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1.5" />
                  Download PDF
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Drone Fleet Specifications</CardTitle>
                  <CardDescription>
                    Technical details about our drone models and their capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Model</TableHead>
                        <TableHead>Max Payload</TableHead>
                        <TableHead>Range</TableHead>
                        <TableHead>Max Speed</TableHead>
                        <TableHead>Battery Life</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {droneSpecs.map((spec, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{spec.model}</TableCell>
                          <TableCell>{spec.payload}</TableCell>
                          <TableCell>{spec.range}</TableCell>
                          <TableCell>{spec.speed}</TableCell>
                          <TableCell>{spec.battery}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="w-full md:w-1/4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">User Manual PDF</p>
                    <p className="text-xs text-muted-foreground">Complete user guide (25MB)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <Code className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">API Reference</p>
                    <p className="text-xs text-muted-foreground">Interactive API docs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <ListChecks className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Release Notes</p>
                    <p className="text-xs text-muted-foreground">Latest platform updates</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <Bookmark className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Best Practices</p>
                    <p className="text-xs text-muted-foreground">Optimization tips</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recently Viewed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Order Management Guide</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">API Authentication</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Delivery Scheduling Guide</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for in our documentation?
                </p>
                <Button className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
