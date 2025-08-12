
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, HelpCircle, BookOpen, MessageCircle, Phone, Mail, 
  ChevronRight, ChevronDown, FileQuestion, FileText, Video, ExternalLink, Plus, Minus 
} from "lucide-react";

export default function HelpCenter() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Searching",
      description: `Searching for "${searchQuery}"...`,
    });
  };
  
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description: "Your support request has been submitted. We'll get back to you shortly.",
    });
  };
  
  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };
  
  // FAQs data
  const faqs = [
    {
      id: "faq-1",
      question: "How do I track my drone delivery?",
      answer: "You can track your drone delivery in real-time through the Tracking page. Simply enter your order ID in the tracking field, and you'll see the current location and status of your delivery. You can also access detailed information about your delivery including estimated arrival time."
    },
    {
      id: "faq-2",
      question: "What happens if my drone delivery can't be completed?",
      answer: "If a delivery cannot be completed due to weather conditions, technical issues, or other factors, our system will automatically notify you via your preferred contact method. The drone will either return to the nearest depot or, if possible, attempt delivery at a later time. You can always check the status of your delivery in the tracking section."
    },
    {
      id: "faq-3",
      question: "How do I update my delivery address?",
      answer: "To update your delivery address, go to your Order Management page, select the order you wish to modify, and click on 'Edit Details'. Please note that address changes can only be made if the order hasn't entered the 'In Transit' status yet. For urgent address changes on active deliveries, please contact customer support."
    },
    {
      id: "faq-4",
      question: "What is the maximum weight for drone deliveries?",
      answer: "The maximum weight for drone deliveries depends on the drone model assigned to your order. Our standard drones can carry up to 2.5kg, while our heavy-lift models can handle up to 5kg. The system automatically assigns the appropriate drone based on your package weight and dimensions."
    },
    {
      id: "faq-5",
      question: "How do I report a problem with my delivery?",
      answer: "To report a delivery problem, go to your Order History, find the relevant order, and click on 'Report Issue'. You can also reach out through the Contact Support form in this Help Center. Please include your order number and detailed information about the issue for faster resolution."
    },
    {
      id: "faq-6",
      question: "What weather conditions prevent drone deliveries?",
      answer: "Drone deliveries may be delayed or rescheduled during severe weather conditions including heavy rain, snow, strong winds (typically above 25 mph), thunderstorms, or extremely low visibility. Our system constantly monitors weather conditions and will notify you if your delivery might be affected."
    },
  ];
  
  // Quick links data
  const quickLinks = [
    { title: "Tracking a Package", icon: Search, description: "Learn how to track your deliveries in real-time" },
    { title: "Scheduling Deliveries", icon: FileText, description: "Tips for scheduling and managing deliveries" },
    { title: "Account Management", icon: HelpCircle, description: "Managing your profile and preferences" },
    { title: "Drone Specifications", icon: FileQuestion, description: "Details about our drone fleet capabilities" },
  ];
  
  // Filtered FAQs based on search
  const filteredFaqs = searchQuery 
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Help Center</h2>
          <p className="text-muted-foreground mt-1">
            Find answers to common questions and get support when you need it.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>How can we help you today?</CardTitle>
                <CardDescription>
                  Search for answers or browse our help topics below.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Search for help articles, FAQs, and more..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" className="absolute right-1 top-1">
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="faq" className="space-y-6">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="faq">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  FAQs
                </TabsTrigger>
                <TabsTrigger value="guides">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guides
                </TabsTrigger>
                <TabsTrigger value="contact">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Us
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="faq" className="space-y-4">
                <div className="space-y-4">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map(faq => (
                      <Card key={faq.id} className="overflow-hidden">
                        <button
                          className="w-full text-left"
                          onClick={() => toggleFaq(faq.id)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg font-medium">{faq.question}</CardTitle>
                              {expandedFaq === faq.id ? (
                                <Minus className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Plus className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </CardHeader>
                        </button>
                        {expandedFaq === faq.id && (
                          <CardContent className="pt-0">
                            <p className="text-muted-foreground">{faq.answer}</p>
                          </CardContent>
                        )}
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="font-medium mb-1">No matches found</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          We couldn't find any FAQs matching your search. Try different keywords or browse all FAQs.
                        </p>
                        <Button variant="outline" onClick={() => setSearchQuery("")}>
                          Clear Search
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <div className="flex justify-center pt-4">
                  <Button variant="outline">
                    View All FAQs
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="guides" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        Getting Started Guide
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Learn the basics of using the DroneFlux delivery platform and setting up your account.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full">
                        Read Guide
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Video className="h-5 w-5 mr-2 text-primary" />
                        Video Tutorials
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Watch step-by-step video guides on how to use the drone delivery platform.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full">
                        Watch Videos
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileQuestion className="h-5 w-5 mr-2 text-primary" />
                        Order Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Learn how to create, modify, and track orders in the delivery system.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full">
                        Read Guide
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        Delivery Troubleshooting
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Solutions for common delivery issues and how to resolve them quickly.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="w-full">
                        Read Guide
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div className="text-center pt-4">
                  <Button>
                    Browse All Guides
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-medium">Name</label>
                          <Input id="name" required />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">Email</label>
                          <Input id="email" type="email" required />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                        <Input id="subject" required />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium">Message</label>
                        <textarea 
                          id="message" 
                          className="w-full min-h-[120px] px-3 py-2 border border-input rounded-md"
                          required
                        ></textarea>
                      </div>
                      
                      <div>
                        <Button type="submit" className="w-full">
                          Send Message
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Phone className="h-5 w-5 mr-2 text-primary" />
                        Phone Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">
                        Call our customer support team directly:
                      </p>
                      <p className="font-medium">+1 (800) 123-4567</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Available Monday-Friday, 9am-5pm EST
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Mail className="h-5 w-5 mr-2 text-primary" />
                        Email Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">
                        Send us an email for non-urgent issues:
                      </p>
                      <p className="font-medium">support@droneflux.com</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        We typically respond within 24 hours
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>
                  Popular help topics and guides
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickLinks.map((link, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="bg-primary/10 p-2 rounded-full">
                      <link.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{link.title}</h4>
                      <p className="text-xs text-muted-foreground">{link.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full">
                  View All Help Articles
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md overflow-hidden border aspect-video relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <div className="text-center">
                      <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Platform Overview
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium">Getting Started with DroneFlux</div>
                <p className="text-xs text-muted-foreground">
                  A complete walkthrough of the DroneFlux platform and its key features.
                </p>
                <Button variant="ghost" className="w-full">
                  Watch Video
                  <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Documentation</p>
                    <p className="text-xs text-muted-foreground">Full platform documentation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <Video className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Video Library</p>
                    <p className="text-xs text-muted-foreground">Browse all tutorial videos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">API Reference</p>
                    <p className="text-xs text-muted-foreground">Developer API documentation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
