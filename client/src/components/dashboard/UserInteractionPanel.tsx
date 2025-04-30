import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface UserInteractionPanelProps {
  selectedLocation: string;
}

export default function UserInteractionPanel({ selectedLocation }: UserInteractionPanelProps) {
  const { toast } = useToast();
  
  // Report form state
  const [incidentType, setIncidentType] = useState<string>("");
  const [location, setLocation] = useState<string>(selectedLocation);
  const [description, setDescription] = useState<string>("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  
  // Subscription form state
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [alertTypes, setAlertTypes] = useState<{ [key: string]: boolean }>({
    highPollution: false,
    dailyForecast: false,
    anomalyDetection: false
  });
  const [isSubmittingSubscription, setIsSubmittingSubscription] = useState(false);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Report Submitted",
        description: "Your pollution incident has been reported successfully.",
        variant: "default",
      });
      
      // Reset form
      setIncidentType("");
      setLocation(selectedLocation);
      setDescription("");
      setIsSubmittingReport(false);
    }, 1000);
  };

  const handleSubscriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSubscription(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Subscription Successful",
        description: "You have been subscribed to air quality alerts.",
        variant: "default",
      });
      
      // Reset form
      setEmail("");
      setPhone("");
      setAlertTypes({
        highPollution: false,
        dailyForecast: false,
        anomalyDetection: false
      });
      setIsSubmittingSubscription(false);
    }, 1000);
  };

  const handleCheckboxChange = (id: string) => {
    setAlertTypes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Card className="overflow-hidden mb-6">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Report & Feedback</h2>
      </div>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Pollution Incident */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Report Pollution Incident</h3>
            <form onSubmit={handleReportSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="incident-type">Incident Type</Label>
                  <Select
                    value={incidentType}
                    onValueChange={setIncidentType}
                  >
                    <SelectTrigger id="incident-type">
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="smoke">Smoke or Fire</SelectItem>
                        <SelectItem value="odor">Strong Odor</SelectItem>
                        <SelectItem value="dust">Dust</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter address or coordinates"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you observed"
                    rows={3}
                  />
                </div>
                
                <Button type="submit" disabled={isSubmittingReport}>
                  {isSubmittingReport ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </Button>
              </div>
            </form>
          </div>
          
          {/* Subscribe to Alerts */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Subscribe to Alerts</h3>
            <form onSubmit={handleSubscriptionSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 123 456 7890"
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">Alert Types</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="alert-high" 
                        checked={alertTypes.highPollution}
                        onCheckedChange={() => handleCheckboxChange('highPollution')}
                      />
                      <label
                        htmlFor="alert-high"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        High Pollution Alerts
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="alert-forecast" 
                        checked={alertTypes.dailyForecast}
                        onCheckedChange={() => handleCheckboxChange('dailyForecast')}
                      />
                      <label
                        htmlFor="alert-forecast"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Daily Forecasts
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="alert-anomaly" 
                        checked={alertTypes.anomalyDetection}
                        onCheckedChange={() => handleCheckboxChange('anomalyDetection')}
                      />
                      <label
                        htmlFor="alert-anomaly"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Anomaly Detections
                      </label>
                    </div>
                  </div>
                </div>
                
                <Button type="submit" disabled={isSubmittingSubscription}>
                  {isSubmittingSubscription ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
                      Subscribing...
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
