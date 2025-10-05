import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
  // Add a prop to conditionally show the admin panel (optional)
  isAdmin?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export default function UserInteractionPanel({
  selectedLocation,
  isAdmin = true // Default to false
}: UserInteractionPanelProps) {
  const { toast } = useToast();

  // --- Report form state ---
  const [incidentType, setIncidentType] = useState<string>("");
  const [location, setLocation] = useState<string>(selectedLocation);
  const [description, setDescription] = useState<string>("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // --- Subscription form state ---
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [alertTypes, setAlertTypes] = useState<{ [key: string]: boolean }>({
    highPollution: false,
    dailyForecast: false,
    anomalyDetection: false,
  });
  const [isSubmittingSubscription, setIsSubmittingSubscription] = useState(false);

  // --- NEW: Admin Alert Sending State ---
  const [alertToSendType, setAlertToSendType] = useState<string>("");
  const [alertToSendLocation, setAlertToSendLocation] = useState<string>(selectedLocation); // Default to current selected
  const [alertToSendSubject, setAlertToSendSubject] = useState<string>("");
  const [alertToSendMesssage, setAlertToSendMesssage] = useState<string>("");
  const [alertToSendDetails, setAlertToSendDetails] = useState<string>(""); // Using string for simplicity, could be JSON editor
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  // Update location states if the prop changes
  useEffect(() => {
    setLocation(selectedLocation);
    setAlertToSendLocation(selectedLocation); // Also update the admin location default
  }, [selectedLocation]);

  // --- Handlers (Report and Subscription - unchanged) ---
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentType || !location || !description) {
      toast({ title: "Missing Information", description: "Please fill in all report fields.", variant: "destructive" });
      return;
    }
    setIsSubmittingReport(true);
    const reportData = { incidentType, location, description, timestamp: new Date().toISOString() };
    try {
      const response = await fetch(`${API_BASE_URL}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit report.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      toast({ title: "Report Submitted", description: result.message || "Report submitted successfully.", variant: "default" });
      setIncidentType("");
      setLocation(selectedLocation);
      setDescription("");
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({ title: "Submission Failed", description: error.message || "Could not submit the report.", variant: "destructive" });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Missing Information", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setIsSubmittingSubscription(true);
    const subscriptionData = { email, phone, alertTypes, location: selectedLocation, timestamp: new Date().toISOString() };
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to subscribe.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      toast({ title: "Subscription Successful", description: result.message || "Subscription saved.", variant: "default" });
      setEmail("");
      setPhone("");
      setAlertTypes({ highPollution: false, dailyForecast: false, anomalyDetection: false });
    } catch (error: any) {
      console.error("Error subscribing:", error);
      toast({ title: "Subscription Failed", description: error.message || "Could not subscribe.", variant: "destructive" });
    } finally {
      setIsSubmittingSubscription(false);
    }
  };

  const handleCheckboxChange = (id: keyof typeof alertTypes) => {
    setAlertTypes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- NEW: Handler for Sending Alert ---
  const handleSendAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!alertToSendType || !alertToSendLocation || !alertToSendSubject || !alertToSendMesssage) {
      toast({
        title: "Missing Alert Information",
        description: "Please fill in Alert Type, Location, Subject, and Message.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingAlert(true);

    let detailsObject = null;
    if (alertToSendDetails) {
      try {
        detailsObject = JSON.parse(alertToSendDetails); // Try to parse details as JSON
      } catch (jsonError) {
        toast({
          title: "Invalid Details Format",
          description: "Alert Details must be valid JSON or empty.",
          variant: "destructive",
        });
        setIsSendingAlert(false);
        return;
      }
    }


    const alertData = {
      alertType: alertToSendType,
      location: alertToSendLocation,
      subject: alertToSendSubject,
      message: alertToSendMesssage,
      details: detailsObject, // Send parsed object or null
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/send-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // You might need Authorization headers here for a real admin panel
          // 'Authorization': `Bearer ${your_admin_token}`
        },
        body: JSON.stringify(alertData),
      });

      const result = await response.json(); // Try to parse JSON regardless of status

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      // Success
      toast({
        title: "Alert Sending Initiated",
        description: result.message || `Alert sent to ${result.successCount} recipients. Failures: ${result.failureCount}.`,
        variant: "default",
      });

      // Optionally reset admin form fields
      // setAlertToSendType("");
      // setAlertToSendSubject("");
      // setAlertToSendMesssage("");
      // setAlertToSendDetails("");

    } catch (error: any) {
      console.error("Error sending alert:", error);
      toast({
        title: "Alert Sending Failed",
        description: error.message || "Could not send the alert. Check server logs.",
        variant: "destructive",
      });
    } finally {
      setIsSendingAlert(false);
    }
  };


  // --- Render JSX ---
  return (
    <Card className="overflow-hidden mb-6">
      {/* --- Report & Subscribe Section --- */}
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Report & Feedback ({selectedLocation})</h2>
      </div>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Report Form (unchanged) */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Report Pollution Incident</h3>
            <form onSubmit={handleReportSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="incident-type">Incident Type</Label>
                  <Select value={incidentType} onValueChange={setIncidentType} required>
                    <SelectTrigger id="incident-type"><SelectValue placeholder="Select incident type" /></SelectTrigger>
                    <SelectContent><SelectGroup>
                      <SelectItem value="smoke">Smoke or Fire</SelectItem>
                      <SelectItem value="odor">Strong Odor</SelectItem>
                      <SelectItem value="dust">Dust</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectGroup></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter address or coordinates" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you observed" rows={3} required />
                </div>
                <Button type="submit" disabled={isSubmittingReport || !incidentType || !location || !description}>
                  {isSubmittingReport ? (<><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span> Submitting...</>) : ("Submit Report")}
                </Button>
              </div>
            </form>
          </div>

          {/* Subscribe Form (unchanged) */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Subscribe to Alerts</h3>
            <form onSubmit={handleSubscriptionSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your.email@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (optional)</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 123 456 7890" />
                </div>
                <div>
                  <Label className="mb-2 block">Alert Types</Label>
                  <div className="mt-2 space-y-2">
                    {/* Checkboxes */}
                    <div className="flex items-center space-x-2">
                      <Checkbox id="alert-high" checked={alertTypes.highPollution} onCheckedChange={() => handleCheckboxChange('highPollution')} />
                      <label htmlFor="alert-high" className="text-sm font-medium leading-none">High Pollution Alerts</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="alert-forecast" checked={alertTypes.dailyForecast} onCheckedChange={() => handleCheckboxChange('dailyForecast')} />
                      <label htmlFor="alert-forecast" className="text-sm font-medium leading-none">Daily Forecasts</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="alert-anomaly" checked={alertTypes.anomalyDetection} onCheckedChange={() => handleCheckboxChange('anomalyDetection')} />
                      <label htmlFor="alert-anomaly" className="text-sm font-medium leading-none">Anomaly Detections</label>
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={isSubmittingSubscription || !email}>
                  {isSubmittingSubscription ? (<><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span> Subscribing...</>) : ("Subscribe")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CardContent>

      {/* --- NEW: Admin Alert Sender Section (Conditionally Rendered) --- */}
      {/* You would control the 'isAdmin' prop based on user authentication/role */}
      {isAdmin && (
        <>
          <div className="p-4 border-t dark:border-gray-700 mt-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Admin: Send Alert</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Use this form to manually trigger alerts to subscribers.</p>
          </div>
          <CardContent className="p-4">
            <form onSubmit={handleSendAlertSubmit}>
              <div className="space-y-4">
                {/* Alert Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="alert-send-type">Alert Type to Send</Label>
                  <Select value={alertToSendType} onValueChange={setAlertToSendType} required>
                    <SelectTrigger id="alert-send-type">
                      <SelectValue placeholder="Select alert type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {/* These values MUST match the keys used in the backend filtering */}
                        <SelectItem value="highPollution">High Pollution</SelectItem>
                        <SelectItem value="dailyForecast">Daily Forecast</SelectItem>
                        <SelectItem value="anomalyDetection">Anomaly Detection</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Alert Location */}
                <div className="space-y-2">
                  <Label htmlFor="alert-send-location">Alert Location</Label>
                  <Input
                    id="alert-send-location"
                    value={alertToSendLocation}
                    onChange={(e) => setAlertToSendLocation(e.target.value)}
                    placeholder="e.g., Pune"
                    required
                  />
                </div>

                {/* Alert Subject */}
                <div className="space-y-2">
                  <Label htmlFor="alert-send-subject">Email Subject</Label>
                  <Input
                    id="alert-send-subject"
                    value={alertToSendSubject}
                    onChange={(e) => setAlertToSendSubject(e.target.value)}
                    placeholder="e.g., Air Quality Alert"
                    required
                  />
                </div>

                {/* Alert Message */}
                <div className="space-y-2">
                  <Label htmlFor="alert-send-message">Email Message Body (HTML allowed)</Label>
                  <Textarea
                    id="alert-send-message"
                    value={alertToSendMesssage}
                    onChange={(e) => setAlertToSendMesssage(e.target.value)}
                    placeholder="Describe the alert..."
                    rows={4}
                    required
                  />
                </div>

                {/* Alert Details (as JSON) */}
                <div className="space-y-2">
                  <Label htmlFor="alert-send-details">Extra Details (JSON format, optional)</Label>
                  <Textarea
                    id="alert-send-details"
                    value={alertToSendDetails}
                    onChange={(e) => setAlertToSendDetails(e.target.value)}
                    placeholder='e.g., {"aqi": 155, "pollutant": "PM2.5"}'
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <Button type="submit" disabled={isSendingAlert || !alertToSendType || !alertToSendLocation || !alertToSendSubject || !alertToSendMesssage}>
                  {isSendingAlert ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></span>
                      Sending Alert...
                    </>
                  ) : (
                    "Send Alert to Subscribers"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </>
      )} {/* End conditional rendering for admin section */}
    </Card>
  );
}