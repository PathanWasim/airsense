import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateData } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface AlertSystemProps {
  selectedLocation: string;
}

export default function AlertSystem({ selectedLocation }: AlertSystemProps) {
  const [selectedTab, setSelectedTab] = useState("manual");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [alertPriority, setAlertPriority] = useState("medium");
  const [includeNotification, setIncludeNotification] = useState(true);
  const [threshold, setThreshold] = useState(100);
  const [parameter, setParameter] = useState("pm25");
  const { toast } = useToast();

  const handleManualAlert = async () => {
    if (!alertTitle) {
      toast({
        title: "Error",
        description: "Alert title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a new anomaly in Firebase
      const anomalyData = {
        title: alertTitle,
        description: alertDescription || `Manual alert triggered for ${selectedLocation}`,
        timestamp: Date.now(),
        priority: alertPriority,
        zone: selectedLocation,
      };

      // Generate a unique key for the new anomaly
      const anomalyId = `anom${Date.now()}`;
      
      // Update Firebase data
      await updateData(`/anomalies/${anomalyId}`, anomalyData);
      
      // Show success toast
      toast({
        title: "Alert Created",
        description: `Alert "${alertTitle}" has been successfully created`,
      });
      
      // Reset form and close dialog
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating alert:", error);
      toast({
        title: "Error",
        description: "Failed to create alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAutomaticAlert = async () => {
    if (!parameter) {
      toast({
        title: "Error",
        description: "Please select a parameter",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the alert configuration
      const alertConfig = {
        parameter,
        threshold: parseFloat(threshold.toString()),
        location: selectedLocation,
        createdAt: Date.now(),
        enabled: true,
        includeNotification,
      };

      // Save the alert configuration to Firebase
      await updateData(`/alertConfigs/${parameter}_${selectedLocation.replace(/\s+/g, '_')}`, alertConfig);
      
      // Show success toast
      toast({
        title: "Automatic Alert Created",
        description: `Alert will trigger when ${parameter.toUpperCase()} exceeds ${threshold}`,
      });
      
      // Reset form and close dialog
      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating automatic alert:", error);
      toast({
        title: "Error",
        description: "Failed to create automatic alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setAlertTitle("");
    setAlertDescription("");
    setAlertPriority("medium");
    setIncludeNotification(true);
    setThreshold(100);
    setParameter("pm25");
  };

  // For testing/demo purposes, trigger a test alert
  const triggerTestAlert = async () => {
    try {
      // First update a parameter value to trigger the alert
      const parameterValue = parameter === "pm25" ? 120 : 
                           parameter === "co2" ? 1200 : 
                           parameter === "temperature" ? 35 : 85;
      
      // Update the parameter value
      await updateData(`/parameters/${parameter}`, {
        value: parameterValue,
        unit: parameter === "pm25" || parameter === "pm10" ? "μg/m³" : 
              parameter === "co2" ? "ppm" : 
              parameter === "temperature" ? "°C" : "%"
      });
      
      // Create a test anomaly
      const anomalyData = {
        title: `High ${parameter.toUpperCase()} Alert`,
        description: `${parameter.toUpperCase()} levels have exceeded the threshold (${threshold}) in ${selectedLocation}. Current value: ${parameterValue}.`,
        timestamp: Date.now(),
        priority: "high",
        zone: selectedLocation,
      };
      
      // Generate a unique key for the new anomaly
      const anomalyId = `anom${Date.now()}`;
      
      // Update Firebase data
      await updateData(`/anomalies/${anomalyId}`, anomalyData);
      
      toast({
        title: "Test Alert Triggered",
        description: `A test alert for ${parameter.toUpperCase()} has been created`,
      });
    } catch (error) {
      console.error("Error triggering test alert:", error);
      toast({
        title: "Error",
        description: "Failed to trigger test alert",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Alert System</CardTitle>
        <CardDescription>Configure and manage system alerts</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-md font-medium">Configured Alerts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">System will alert you when parameters exceed thresholds</p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <span className="material-icons mr-1 text-sm">add</span>
                  New Alert
                </Button>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Alert</DialogTitle>
                  <DialogDescription>
                    Set up an alert for the air quality monitoring system
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="manual" value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Alert</TabsTrigger>
                    <TabsTrigger value="automatic">Automatic Alert</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="manual" className="py-4 space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Alert Title</Label>
                        <Input 
                          id="title" 
                          placeholder="Enter alert title" 
                          value={alertTitle}
                          onChange={(e) => setAlertTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Enter alert details" 
                          value={alertDescription}
                          onChange={(e) => setAlertDescription(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={alertPriority} onValueChange={setAlertPriority}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="automatic" className="py-4 space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="parameter">Parameter</Label>
                        <Select value={parameter} onValueChange={setParameter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parameter" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pm25">PM2.5</SelectItem>
                            <SelectItem value="pm10">PM10</SelectItem>
                            <SelectItem value="co2">CO₂</SelectItem>
                            <SelectItem value="temperature">Temperature</SelectItem>
                            <SelectItem value="humidity">Humidity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="threshold">Threshold Value</Label>
                        <Input 
                          id="threshold" 
                          type="number" 
                          placeholder="Enter threshold value" 
                          value={threshold}
                          onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="notifications" 
                          checked={includeNotification}
                          onCheckedChange={setIncludeNotification}
                        />
                        <Label htmlFor="notifications">Include notification</Label>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <DialogFooter className="gap-2 sm:space-x-0">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  
                  {selectedTab === "manual" ? (
                    <Button onClick={handleManualAlert}>Create Alert</Button>
                  ) : (
                    <Button onClick={handleAutomaticAlert}>Set Up Automatic Alert</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-4 rounded-lg dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">PM2.5 High Level Alert</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Triggers when PM2.5 &gt; 75 μg/m³</p>
                </div>
                <div className="flex items-center">
                  <Switch id="auto-alert-1" defaultChecked />
                </div>
              </div>
            </div>
            
            <div className="border p-4 rounded-lg dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">CO₂ Concentration Alert</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Triggers when CO₂ &gt; 1000 ppm</p>
                </div>
                <div className="flex items-center">
                  <Switch id="auto-alert-2" defaultChecked />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Button variant="outline" onClick={triggerTestAlert}>
              <span className="material-icons mr-1 text-sm">notifications</span>
              Trigger Test Alert
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}