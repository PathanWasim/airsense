import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import Forecast from "@/components/dashboard/Forecast";
import { useToast } from "@/hooks/use-toast";

export default function ForecastPage() {
  const [selectedLocation, setSelectedLocation] = useState("Downtown");
  const { toast } = useToast();

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    toast({
      title: "Location Changed",
      description: `Displaying forecast for ${location}`,
      variant: "default",
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Forecast Refreshed",
      description: "Latest forecast data loaded",
      variant: "default",
    });
  };

  return (
    <>
      <PageHeader 
        title="Air Quality Forecast" 
        description="Hourly and daily air quality predictions"
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
        onRefresh={handleRefresh}
      />
      
      <Forecast selectedLocation={selectedLocation} />
    </>
  );
}