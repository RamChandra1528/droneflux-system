
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bell, Palette, Globe, Monitor, Moon, Sun, Languages, Mail, 
  Shield, Smartphone, MapPin, UserCog, AlertTriangle 
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences.
          </p>
        </div>
        
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure your basic account preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" placeholder="username" defaultValue="admin" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input type="email" id="email" placeholder="example@email.com" defaultValue="admin@droneflux.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en-US">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (United States)</SelectItem>
                        <SelectItem value="en-GB">English (United Kingdom)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="est">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="est">(UTC-05:00) Eastern Time (US & Canada)</SelectItem>
                        <SelectItem value="cst">(UTC-06:00) Central Time (US & Canada)</SelectItem>
                        <SelectItem value="mst">(UTC-07:00) Mountain Time (US & Canada)</SelectItem>
                        <SelectItem value="pst">(UTC-08:00) Pacific Time (US & Canada)</SelectItem>
                        <SelectItem value="utc">(UTC+00:00) Universal Coordinated Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>
                  Configure region-specific settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Date Format</Label>
                      <Select defaultValue="mdy">
                        <SelectTrigger>
                          <SelectValue placeholder="Select date format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Time Format</Label>
                      <Select defaultValue="12h">
                        <SelectTrigger>
                          <SelectValue placeholder="Select time format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                          <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Measurement System</Label>
                    <Select defaultValue="imperial">
                      <SelectTrigger>
                        <SelectValue placeholder="Select measurement system" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="imperial">Imperial (miles, pounds)</SelectItem>
                        <SelectItem value="metric">Metric (kilometers, kilograms)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>
                  Customize the appearance of your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme Mode</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div
                        className={`flex flex-col items-center justify-center border p-4 rounded-lg cursor-pointer hover:border-primary ${
                          theme === "light" ? "border-primary bg-primary/10" : ""
                        }`}
                        onClick={() => setTheme("light")}
                      >
                        <Sun className="h-10 w-10 mb-2" />
                        <span className="text-sm font-medium">Light</span>
                      </div>
                      <div
                        className={`flex flex-col items-center justify-center border p-4 rounded-lg cursor-pointer hover:border-primary ${
                          theme === "dark" ? "border-primary bg-primary/10" : ""
                        }`}
                        onClick={() => setTheme("dark")}
                      >
                        <Moon className="h-10 w-10 mb-2" />
                        <span className="text-sm font-medium">Dark</span>
                      </div>
                      <div
                        className={`flex flex-col items-center justify-center border p-4 rounded-lg cursor-pointer hover:border-primary ${
                          theme === "system" ? "border-primary bg-primary/10" : ""
                        }`}
                        onClick={() => setTheme("system")}
                      >
                        <Monitor className="h-10 w-10 mb-2" />
                        <span className="text-sm font-medium">System</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="grid grid-cols-6 gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-500 cursor-pointer border-4 border-white dark:border-gray-900 hover:opacity-80"></div>
                      <div className="w-10 h-10 rounded-full bg-green-500 cursor-pointer border border-transparent hover:opacity-80"></div>
                      <div className="w-10 h-10 rounded-full bg-purple-500 cursor-pointer border border-transparent hover:opacity-80"></div>
                      <div className="w-10 h-10 rounded-full bg-orange-500 cursor-pointer border border-transparent hover:opacity-80"></div>
                      <div className="w-10 h-10 rounded-full bg-red-500 cursor-pointer border border-transparent hover:opacity-80"></div>
                      <div className="w-10 h-10 rounded-full bg-gray-500 cursor-pointer border border-transparent hover:opacity-80"></div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Adjust how information is displayed in your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Compact Mode</p>
                        <p className="text-sm text-muted-foreground">Display more content with less spacing</p>
                      </div>
                    </div>
                    <Switch id="compact-mode" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Smart Navigation</p>
                        <p className="text-sm text-muted-foreground">Remember previously visited pages</p>
                      </div>
                    </div>
                    <Switch id="smart-navigation" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Show Translation Options</p>
                        <p className="text-sm text-muted-foreground">Display translation options for content</p>
                      </div>
                    </div>
                    <Switch id="translation-options" />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
                      </div>
                    </div>
                    <Switch 
                      id="push-notifications" 
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive text message alerts</p>
                      </div>
                    </div>
                    <Switch 
                      id="sms-notifications" 
                      checked={smsNotifications}
                      onCheckedChange={setSmsNotifications}
                    />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Notification Types</h3>
                  
                  {emailNotifications && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Email Notifications</h4>
                      <div className="ml-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="email-orders" defaultChecked />
                          <Label htmlFor="email-orders" className="text-sm font-normal">Order updates</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="email-deliveries" defaultChecked />
                          <Label htmlFor="email-deliveries" className="text-sm font-normal">Delivery status changes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="email-security" defaultChecked />
                          <Label htmlFor="email-security" className="text-sm font-normal">Security alerts</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="email-marketing" />
                          <Label htmlFor="email-marketing" className="text-sm font-normal">Marketing and promotions</Label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {pushNotifications && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Push Notifications</h4>
                      <div className="ml-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="push-orders" defaultChecked />
                          <Label htmlFor="push-orders" className="text-sm font-normal">Order updates</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="push-deliveries" defaultChecked />
                          <Label htmlFor="push-deliveries" className="text-sm font-normal">Delivery status changes</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="push-security" defaultChecked />
                          <Label htmlFor="push-security" className="text-sm font-normal">Security alerts</Label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and login preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Setup 2FA
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Login Sessions</p>
                        <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Login Locations</p>
                        <p className="text-sm text-muted-foreground">Restrict access to specific locations</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Account Recovery</p>
                        <p className="text-sm text-muted-foreground">Setup recovery options for your account</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Setup
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings}>Update Password</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced system settings and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data Sync Frequency</Label>
                    <Select defaultValue="realtime">
                      <SelectTrigger>
                        <SelectValue placeholder="Select sync frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="minute">Every minute</SelectItem>
                        <SelectItem value="hour">Hourly</SelectItem>
                        <SelectItem value="day">Daily</SelectItem>
                        <SelectItem value="manual">Manual only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Automatic Updates</p>
                      <p className="text-sm text-muted-foreground">Keep application up to date automatically</p>
                    </div>
                    <Switch id="auto-updates" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Analytics Collection</p>
                      <p className="text-sm text-muted-foreground">Help improve the application by sharing usage data</p>
                    </div>
                    <Switch id="analytics" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Developer Mode</p>
                      <p className="text-sm text-muted-foreground">Enable advanced features and debugging tools</p>
                    </div>
                    <Switch id="developer-mode" />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Data Management</h3>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Manage your application data and preferences</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">Export Data</Button>
                      <Button variant="outline" size="sm">Import Data</Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        Reset Preferences
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        Clear Cache
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground">Permanent actions that can't be undone</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
