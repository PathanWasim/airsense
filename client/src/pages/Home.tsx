import { useState, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import LiveAQIOverview from "@/components/dashboard/LiveAQIOverview";
import RealTimeGraphs from "@/components/dashboard/RealTimeGraphs";
import MapView from "@/components/dashboard/MapView";
import Forecast from "@/components/dashboard/Forecast";
import AnomalyAlerts from "@/components/dashboard/AnomalyAlerts";
import AIAssistant from "@/components/dashboard/AIAssistant";
import ReportsDownloads from "@/components/dashboard/ReportsDownloads";
import UserInteractionPanel from "@/components/dashboard/UserInteractionPanel";
import DataInitializer from "@/components/DataInitializer";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState("Downtown");
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

  // Load scripts for Leaflet and Charts
  useEffect(() => {
    // Load Leaflet.js
    const leafletScript = document.createElement("script");
    leafletScript.src = "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.js";
    leafletScript.async = true;
    document.body.appendChild(leafletScript);

    // Load Leaflet CSS
    const leafletCSS = document.createElement("link");
    leafletCSS.href = "https://cdn.jsdelivr.net/npm/leaflet@1.7.1/dist/leaflet.css";
    leafletCSS.rel = "stylesheet";
    document.head.appendChild(leafletCSS);

    // Clean up
    return () => {
      document.body.removeChild(leafletScript);
      document.head.removeChild(leafletCSS);
    };
  }, []);

  return (
    <>
      <PageHeader 
        title="Air Quality Dashboard" 
        description="Real-time air quality monitoring and analysis"
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
        onRefresh={handleRefresh}
      />
      
      <DataInitializer />
      
      <LiveAQIOverview selectedLocation={selectedLocation} />
      
      <RealTimeGraphs selectedLocation={selectedLocation} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <MapView 
          selectedLocation={selectedLocation} 
          onLocationSelect={handleLocationChange}
        />
        <Forecast selectedLocation={selectedLocation} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AnomalyAlerts selectedLocation={selectedLocation} />
        <AIAssistant selectedLocation={selectedLocation} />
      </div>
      
      <ReportsDownloads selectedLocation={selectedLocation} />
      
      <UserInteractionPanel selectedLocation={selectedLocation} />
    </>
  );
}
