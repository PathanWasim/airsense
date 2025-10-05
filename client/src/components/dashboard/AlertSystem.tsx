import { useEffect, useState, useCallback } from "react"; // Import useCallback
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateData , subscribeToData, addAnomaly } from "@/lib/firebase"; // Assuming addAnomaly is exported from firebase lib now
import { getDatabase, ref, get } from 'firebase/database'; // Removed 'set' as addAnomaly handles updates
import { firebaseConfig } from '@/lib/firebase';
import { initializeApp } from "firebase/app";

import { AdminHaiKya } from "@/contexts/AuthContext"; // Updated to use absolute path alias


const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

import { useToast } from "@/hooks/use-toast";
// Removed redundant firebaseInitializeApp import

interface AlertSystemProps {
  selectedLocation: string;
}

// Define types for better clarity
type ParameterKey = "pm25" | "pm10" | "co2" | "co" | "temperature" | "humidity"; // Added 'co' and 'pm10' based on checkForAnomalies usage
type ThresholdMap = { [key in ParameterKey]?: number };
type ActiveAlertsState = { [key in ParameterKey]?: boolean };
type LiveData = { [key in ParameterKey]: { value: number; unit: string } }; // Assuming this structure for liveData

// --- Move utility functions outside the component ---

// Function to check for anomalies in live data
// Now takes activeAlerts state and setter, and selectedLocation
const checkForAnomaliesAndUpdateState = async (
    liveData: LiveData,
    thresholds: ThresholdMap | null,
    activeAlerts: ActiveAlertsState,
    setActiveAlerts: React.Dispatch<React.SetStateAction<ActiveAlertsState>>,
    selectedLocation: string,
    toast: ReturnType<typeof useToast>['toast'] // Pass toast for direct use
): Promise<void> => { // Return void as anomalies are handled internally
  if (!liveData || !thresholds) {
    console.log("Skipping anomaly check: No live data or thresholds.");
    return;
  }

  console.log("Checking for anomalies with thresholds:", thresholds);
  console.log("Current values:", liveData);
  console.log("Current active alert states:", activeAlerts);

  const anomaliesToCreate: any[] = [];
  const newActiveAlerts = { ...activeAlerts }; // Create a mutable copy

  // Helper function to check a single parameter
  const checkParameter = (param: ParameterKey, name: string, unit: string) => {
    const currentValue = liveData[param]?.value;
    const threshold = thresholds[param];
    const isActive = activeAlerts[param];

    // Ensure both currentValue and threshold are valid numbers
    if (typeof currentValue !== 'number' || typeof threshold !== 'number') {
       console.log(`Skipping ${param}: Invalid value or threshold.`);
       // Keep existing state if value/threshold invalid
       newActiveAlerts[param] = isActive;
       return;
    }

    if (currentValue > threshold) {
      if (!isActive) {
        console.log(`${name} anomaly detected: ${currentValue} > ${threshold}. State was inactive.`);
        anomaliesToCreate.push({
          title: `High ${name} Level`,
          priority: 'high', // Or derive from config if needed
          zone: selectedLocation, // Use selectedLocation
          timestamp: Date.now(), // Use timestamp number for easier sorting if needed later
          description: `${name} level (${currentValue} ${unit}) has exceeded the threshold of ${threshold} ${unit} in ${selectedLocation}.`,
          parameter: param, // Add parameter to anomaly data for potential filtering
        });
        newActiveAlerts[param] = true; // Set alert state to active
      } else {
         console.log(`${name} is still above threshold (${currentValue} > ${threshold}), but alert is already active. No new anomaly.`);
         newActiveAlerts[param] = true; // Keep state active
      }
    } else {
      if (isActive) {
        console.log(`${name} value (${currentValue}) is now below threshold (${threshold}). Deactivating alert state.`);
        newActiveAlerts[param] = false; // Deactivate alert state
      } else {
         // Value is below threshold and state was already inactive, do nothing.
         newActiveAlerts[param] = false; // Ensure state is inactive
      }
    }
  };

  // Check all parameters
  checkParameter("pm25", "PM2.5", "μg/m³");
  checkParameter("pm10", "PM10", "μg/m³"); // Added PM10 check if threshold exists
  checkParameter("co2", "CO₂", "ppm");
  checkParameter("co", "CO", "ppm"); // Assuming CO threshold exists
  checkParameter("temperature", "Temperature", "°C");
  checkParameter("humidity", "Humidity", "%");

  // Update the active alerts state in the component
  setActiveAlerts(newActiveAlerts);

  // If new anomalies were detected, add them to Firebase and show toast
  if (anomaliesToCreate.length > 0) {
    console.log(`Creating ${anomaliesToCreate.length} new anomalies.`);
    try {
      // Assuming addAnomaly can handle adding multiple or single anomalies
      // If addAnomaly is only for one, loop here. Modify addAnomaly if possible.
       for (const anomaly of anomaliesToCreate) {
          // Assuming addAnomaly handles unique ID generation and trimming
          await addAnomaly(anomaly);
       }

      toast({
        title: "Anomaly Detected",
        description: `${anomaliesToCreate.length} new anomaly alert(s) have been triggered for ${selectedLocation}.`,
        variant: "destructive",
      });
    } catch (error) {
       console.error("Error adding anomalies to Firebase:", error);
       toast({
           title: "Error",
           description: "Failed to save detected anomalies.",
           variant: "destructive",
       });
    }
  }
};


export default function AlertSystem({ selectedLocation }: AlertSystemProps) {
  const [selectedTab, setSelectedTab] = useState("manual");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [alertPriority, setAlertPriority] = useState("medium");
  const [includeNotification, setIncludeNotification] = useState(true);
  const [threshold, setThreshold] = useState<number | string>(100); // Allow string for input, parse later
  const [parameter, setParameter] = useState<ParameterKey>("pm25");
  const { toast } = useToast();


  const [thresholds, setThresholds] = useState<ThresholdMap | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlertsState>({}); // State to track active alerts

  // Fetch thresholds from Firebase config
  const fetchThresholds = useCallback(async () => {
    console.log("Fetching thresholds...");
    try {
      const alertRef = ref(database, "alertConfigs");
      const snapshot = await get(alertRef);
      const configs = snapshot.val();
      const thresholdMap: ThresholdMap = {};

      if (configs) {
          for (const configKey in configs) {
            const config = configs[configKey];
            // Ensure config has necessary properties and matches the selected location
            if (config.enabled && config.parameter && typeof config.threshold === 'number' && config.location === selectedLocation) {
              thresholdMap[config.parameter as ParameterKey] = config.threshold;
            }
          }
      }

      console.log(`Workspaceed thresholds for ${selectedLocation}:`, thresholdMap);
      setThresholds(thresholdMap);
      // Initialize activeAlerts based on fetched thresholds (all initially inactive)
      const initialActiveState: ActiveAlertsState = {};
      Object.keys(thresholdMap).forEach(key => {
          initialActiveState[key as ParameterKey] = false;
      });
      setActiveAlerts(initialActiveState);
      console.log("Initialized activeAlerts state:", initialActiveState);

    } catch (err) {
      console.error("Error fetching thresholds:", err);
      toast({
          title: "Error",
          description: "Could not fetch alert configurations.",
          variant: "destructive",
      });
    }
  }, [selectedLocation, toast]); // Dependency on selectedLocation and toast

  // Effect to fetch thresholds when location changes
  useEffect(() => {
      fetchThresholds();
  }, [fetchThresholds]); // fetchThresholds is stable due to useCallback


  // Effect to subscribe to parameter data and check for anomalies
  useEffect(() => {
    // Only subscribe if thresholds have been loaded
    if (!thresholds) {
        console.log("Thresholds not yet loaded, skipping data subscription.");
        return;
    }

    console.log(`Subscribing to parameters data for location: ${selectedLocation} with thresholds:`, thresholds);

    // Path should likely be location-specific if data is structured that way
    // Example: `/locations/${selectedLocation}/parameters`
    // Using a generic '/parameters' path as per original code for now. Adapt if needed.
    const dataPath = `parameters`; // Modify this if your data is nested by location

    const unsubscribe = subscribeToData(dataPath, (data: any) => { // Use 'any' if structure varies, or define a stricter type
      console.log("Live data received:", data);
      if (data && typeof data === 'object') {
          // Ensure liveData format matches expectations before checking
          // This assumes data has format like { pm25: { value: X }, co2: { value: Y } ...}
          const liveDataForCheck: Partial<LiveData> = {};
          let dataIsValid = false;
          for (const key in thresholds) { // Iterate over keys we have thresholds for
              if (data[key] && typeof data[key].value === 'number') {
                   liveDataForCheck[key as ParameterKey] = data[key];
                   dataIsValid = true; // Mark data as valid if at least one parameter exists
              }
          }

          if (dataIsValid) {
              checkForAnomaliesAndUpdateState(
                  liveDataForCheck as LiveData, // Cast as LiveData, assuming all needed keys are present or handled inside
                  thresholds,
                  activeAlerts, // Pass current state
                  setActiveAlerts, // Pass setter
                  selectedLocation, // Pass current location
                  toast // Pass toast function
              );
          } else {
              console.log("Received data does not contain expected parameter structures.");
          }
      } else {
          console.log("Received invalid or empty data from subscription.");
      }
    });

    // Cleanup function
    return () => {
      console.log("Unsubscribing from parameters data.");
      unsubscribe();
    };
    // Dependencies: Run when thresholds, activeAlerts, selectedLocation or toast change.
    // activeAlerts is included because checkForAnomaliesAndUpdateState reads it.
  }, [thresholds, activeAlerts, selectedLocation, toast]);


  const handleManualAlert = async () => {
    if (!alertTitle) {
      toast({
        title: "Error", description: "Alert title is required", variant: "destructive",
      });
      return;
    }

    try {
      const anomalyData = {
        title: alertTitle,
        description: alertDescription || `Manual alert triggered for ${selectedLocation}`,
        timestamp: Date.now(),
        priority: alertPriority,
        zone: selectedLocation, // Use selectedLocation
        type: 'manual', // Add type for clarity
      };

      // Using the imported addAnomaly function which should handle ID generation and list management
      await addAnomaly(anomalyData);

      toast({
        title: "Manual Alert Created", description: `Alert "${alertTitle}" for ${selectedLocation} has been successfully created`,
      });

      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating manual alert:", error);
      toast({
        title: "Error", description: "Failed to create manual alert. Please try again.", variant: "destructive",
      });
    }
  };


  const handleAutomaticAlert = async () => {
    if (!parameter) {
       toast({ title: "Error", description: "Please select a parameter", variant: "destructive" });
       return;
    }
    const numericThreshold = parseFloat(threshold.toString());
     if (isNaN(numericThreshold)) {
         toast({ title: "Error", description: "Invalid threshold value", variant: "destructive" });
         return;
     }


    try {
      const configId = `${parameter}_${selectedLocation.replace(/\s+/g, '_')}`;
      const alertConfig = {
        parameter,
        threshold: numericThreshold, // Store as number
        location: selectedLocation,
        createdAt: Date.now(),
        enabled: true, // Default to enabled when creating
        includeNotification, // Store notification preference
      };

      await updateData(`/alertConfigs/${configId}`, alertConfig);

      toast({
        title: "Automatic Alert Configured", description: `Alert for ${selectedLocation} will trigger when ${parameter.toUpperCase()} exceeds ${numericThreshold}`,
      });

      // Re-fetch thresholds to update the UI/local state immediately
      fetchThresholds();

      resetForm();
      setDialogOpen(false);
    } catch (error) {
      console.error("Error creating automatic alert config:", error);
      toast({
        title: "Error", description: "Failed to save automatic alert configuration.", variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setAlertTitle("");
    setAlertDescription("");
    setAlertPriority("medium");
    setIncludeNotification(true);
    setThreshold(100); // Reset to default
    setParameter("pm25"); // Reset to default
    setSelectedTab("manual"); // Reset tab selection if needed
  };

  // For testing/demo purposes, trigger a test alert by simulating data update
   const triggerTestAlert = async () => {
       if (!thresholds || thresholds[parameter] === undefined) {
           toast({ title: "Info", description: `No threshold configured for ${parameter.toUpperCase()} in ${selectedLocation}. Cannot trigger test.`});
           return;
       }

       const currentThreshold = thresholds[parameter]!;
       // Set value slightly above the threshold
       const testValue = currentThreshold + (parameter === "co2" ? 50 : parameter === "pm25" || parameter === "pm10" ? 10 : parameter === "co" ? 2 : parameter === "temperature" ? 2 : 5);

       // Simulate updating the parameter value in Firebase
       // Use the correct path based on your structure (assuming generic '/parameters')
       const dataPath = `/parameters/${parameter}`;
       const unit = parameter === "pm25" || parameter === "pm10" ? "μg/m³" :
                    parameter === "co2" || parameter === "co" ? "ppm" :
                    parameter === "temperature" ? "°C" : "%";

       console.log(`Triggering test for ${parameter} at ${selectedLocation}. Setting value to ${testValue} (threshold: ${currentThreshold})`);

       try {
           // Update the value in Firebase - this will trigger the subscription
           await updateData(dataPath, { value: testValue, unit: unit });

           toast({
               title: "Test Data Sent",
               description: `Sent test value ${testValue} for ${parameter.toUpperCase()}. Anomaly detection will run on update.`,
           });

           // Note: The actual anomaly creation happens in the subscription callback, not here.
           // This button just simulates the data change that *causes* the anomaly detection.

       } catch (error) {
           console.error("Error sending test data:", error);
           toast({
               title: "Error", description: "Failed to send test data update.", variant: "destructive",
           });
       }
   };


  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Alert System ({selectedLocation})</CardTitle> {/* Show selected location */}
        <CardDescription>Configure and manage system alerts for the selected location.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-md font-medium">Configure Alerts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                System checks values against thresholds for {selectedLocation}.
              </p>
              {/* Optionally display fetched thresholds */}
               <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                 Current Thresholds: {thresholds ? JSON.stringify(thresholds) : "Loading..."}
               </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!AdminHaiKya} >
                  <span className="material-icons mr-1 text-sm">add</span>
                  New/Edit Alert Config
                    
                </Button> 
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configure Alert</DialogTitle>
                  <DialogDescription>
                    Set up manual or automatic alerts for {selectedLocation}.
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="manual" value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manual">Manual Alert</TabsTrigger>
                    <TabsTrigger value="automatic">Automatic Alert Config</TabsTrigger>
                  </TabsList>

                  <TabsContent value="manual" className="py-4 space-y-4">
                    {/* Manual Alert Form Fields */}
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
                         <Label htmlFor="description">Description (Optional)</Label>
                         <Textarea
                             id="description"
                             placeholder={`Defaults to 'Manual alert triggered for ${selectedLocation}'`}
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
                  </TabsContent>

                  <TabsContent value="automatic" className="py-4 space-y-4">
                    {/* Automatic Alert Config Form Fields */}
                     <div className="space-y-2">
                       <Label htmlFor="parameter">Parameter</Label>
                       <Select value={parameter} onValueChange={(value) => setParameter(value as ParameterKey)}>
                         <SelectTrigger>
                           <SelectValue placeholder="Select parameter" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="pm25">PM2.5</SelectItem>
                           <SelectItem value="pm10">PM10</SelectItem>
                           <SelectItem value="co2">CO₂</SelectItem>
                           <SelectItem value="co">CO</SelectItem>
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
                         onChange={(e) => setThreshold(e.target.value)} // Keep as string temporarily for input flexibility
                       />
                     </div>
                     <div className="flex items-center space-x-2">
                       <Switch
                         id="notifications"
                         checked={includeNotification}
                         onCheckedChange={setIncludeNotification}
                       />
                       <Label htmlFor="notifications">Trigger Notification</Label>
                     </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="gap-2 sm:space-x-0">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                  {selectedTab === "manual" ? (
                    <Button onClick={handleManualAlert}>Create Manual Alert</Button>
                  ) : (
                    <Button onClick={handleAutomaticAlert}>Save Auto Alert Config</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Display Configured Alerts - Needs dynamic rendering based on fetched configs */}
           <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Active Automatic Configurations for {selectedLocation}</h3>
              {thresholds && Object.keys(thresholds).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(thresholds).map(([param, thresh]) => (
                           <div key={param} className="border p-4 rounded-lg dark:border-gray-700">
                               <div className="flex justify-between items-start">
                                   <div>
                                       <h4 className="font-medium">{param.toUpperCase()} Alert</h4>
                                       <p className="text-sm text-gray-500 dark:text-gray-400">
                                           Triggers when {param.toUpperCase()} &gt; {thresh}
                                           {/* Add units here if available */}
                                       </p>
                                       <p className={`text-sm font-semibold ${activeAlerts[param as ParameterKey] ? 'text-red-500' : 'text-green-500'}`}>
                                          Status: {activeAlerts[param as ParameterKey] ? 'ALERT ACTIVE' : 'Normal'}
                                       </p>
                                   </div>
                                   {/* Add Edit/Disable functionality here if needed */}
                               </div>
                           </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No automatic alerts configured for this location.</p>
              )}
          </div>


          <div className="mt-4">
            <Button variant="outline" onClick={triggerTestAlert} disabled={!thresholds}>
              <span className="material-icons mr-1 text-sm">notifications</span>
              Trigger Test Alert (for selected parameter)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Assume addAnomaly is defined elsewhere, possibly in @/lib/firebase
// It should handle adding the anomaly and managing the list size.
/* Example addAnomaly structure (move to firebase.ts):
export const addAnomaly = async (anomaly: any) => {
  try {
    const anomaliesRef = ref(database, 'anomalies'); // Path to your anomalies list
    const snapshot = await get(anomaliesRef);
    let existingAnomalies = snapshot.val();

    // Ensure existingAnomalies is an array
    if (!Array.isArray(existingAnomalies)) {
        existingAnomalies = [];
    }

    // Add new anomaly at the beginning
    const newAnomalies = [anomaly, ...existingAnomalies];

    // Keep only the X most recent anomalies (e.g., 20)
    const MAX_ANOMALIES = 20;
    if (newAnomalies.length > MAX_ANOMALIES) {
      newAnomalies.length = MAX_ANOMALIES; // Trim the array
    }

    console.log("Updating anomalies list:", newAnomalies);

    // Update Firebase with the new array
    await set(anomaliesRef, newAnomalies); // Use set to overwrite with the new array
    return true;
  } catch (error) {
    console.error("Error adding anomaly:", error);
    // Consider throwing the error or returning false/error details
    throw error; // Re-throw to be caught by calling function
  }
};
*/

// Make sure your firebase.ts exports 'addAnomaly' and potentially 'updateData' and 'subscribeToData'