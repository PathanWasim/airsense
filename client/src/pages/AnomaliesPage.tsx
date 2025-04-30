import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import AnomalyAlerts from "@/components/dashboard/AnomalyAlerts";
import { useToast } from "@/hooks/use-toast";

export default function AnomaliesPage() {
  const [selectedLocation, setSelectedLocation] = useState("Downtown");
  const { toast } = useToast();

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    toast({
      title: "Location Changed",
      description: `Displaying anomalies for ${location}`,
      variant: "default",
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Anomaly Data Refreshed",
      description: "Latest anomaly alerts loaded",
      variant: "default",
    });
  };

  return (
    <>
      <PageHeader 
        title="Anomaly Alerts" 
        description="Detected air quality anomalies and incidents"
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
        onRefresh={handleRefresh}
      />
      
      <AnomalyAlerts selectedLocation={selectedLocation} />
    </>
  );
}