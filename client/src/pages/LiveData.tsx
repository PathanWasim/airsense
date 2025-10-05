import { useState , useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import LiveAQIOverview from "@/components/dashboard/LiveAQIOverview";
import RealTimeGraphs from "@/components/dashboard/RealTimeGraphs";
import { MapView } from "@/components/dashboard/MapView";
import { useToast } from "@/hooks/use-toast";
import { subscribeToData } from "@/lib/firebase";

export default function LiveData() {
  const [selectedLocation, setSelectedLocation] = useState("Downtown");
  const [sensorLocations, setSensorLocations] = useState<any>([]);
  const { toast } = useToast();

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    toast({
      title: "Location Changed",
      description: `Displaying data for ${location}`,
      variant: "default",
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Data Refreshed",
      description: "Latest air quality data loaded",
      variant: "default",
    });
  };

   useEffect(() => {
  
      const unsubscribeLocations = subscribeToData("sensorLocations", (data) => {
        console.log("Sensor locations received:", data);
        setSensorLocations(data || []);
      });
  
      // Clean up
      return () => {
       
        unsubscribeLocations();
      };
    }, []);

  return (
    <>
      <PageHeader 
        title="Live Data" 
        description="Real-time air quality parameters and visualizations"
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
        onRefresh={handleRefresh}
      />
      
      <LiveAQIOverview selectedLocation={selectedLocation} />
      
      <RealTimeGraphs selectedLocation={selectedLocation} />
      
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
      <MapView locations={sensorLocations} />
      </div>
    </>
  );
}