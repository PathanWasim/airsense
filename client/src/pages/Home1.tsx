import { useState, useEffect } from "react";
import { Link } from "wouter";
import PageHeader from "@/components/layout/PageHeader";
import LiveAQIOverview from "@/components/dashboard/LiveAQIOverview";
import RealTimeGraphs from "@/components/dashboard/RealTimeGraphs";
import { MapView } from "@/components/dashboard/MapView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { subscribeToData , checkForAnomalies } from "@/lib/firebase";



export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState("Downtown");
  const [sensorLocations, setSensorLocations] = useState<any>([]);
  const [liveData, setLiveData] = useState<any>({});
  const [loading, setLoading] = useState(true);
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

  // Load scripts for Leaflet
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

    const unsubscribeLocations = subscribeToData("sensorLocations", (data) => {
      console.log("Sensor locations received:", data);
      setSensorLocations(data || []);


    });

    const unsubscribeLive = subscribeToData("parameters", async (data) => {
      console.log("Live data received:", data);
      setLiveData(data || {});
      setLoading(false);
      
      // Check for anomalies whenever live data updates
      if (data) {
        try {
          console.log("Running anomaly check with data:", data);
          const detectedAnomalies = await checkForAnomalies(data);
          console.log("Detected anomalies:", detectedAnomalies);
          
          if (detectedAnomalies && detectedAnomalies.length > 0) {
            // Notify user of new anomalies
            toast({
              title: "Anomaly Detected",
              description: `${detectedAnomalies.length} new anomaly alert(s) have been detected.`,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error checking for anomalies:", error);
        }
      }
    });


    // Clean up
    return () => {
      document.body.removeChild(leafletScript);
      document.head.removeChild(leafletCSS);
      unsubscribeLocations();
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

      <LiveAQIOverview selectedLocation={selectedLocation} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">satellite_alt</span>
              Live Data
            </CardTitle>
            <CardDescription>Real-time air quality parameters</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/live-data">
              <Button className="w-full">
                <span className="material-icons mr-2">visibility</span>
                View Live Data
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">trending_up</span>
              Forecast
            </CardTitle>
            <CardDescription>Hourly and daily predictions</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/forecast">
              <Button className="w-full">
                <span className="material-icons mr-2">visibility</span>
                View Forecast
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">warning</span>
              Anomalies
            </CardTitle>
            <CardDescription>Detected air quality incidents</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/anomalies">
              <Button className="w-full">
                <span className="material-icons mr-2">visibility</span>
                View Anomalies
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">smart_toy</span>
              AI Assistant
            </CardTitle>
            <CardDescription>Get personalized air quality insights</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/ai-assistant">
              <Button className="w-full">
                <span className="material-icons mr-2">chat</span>
                Chat with AI
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="material-icons mr-2">bar_chart</span>
              Reports
            </CardTitle>
            <CardDescription>Download historical reports and analysis</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href="/reports">
              <Button className="w-full">
                <span className="material-icons mr-2">cloud_download</span>
                Access Reports
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <MapView locations={sensorLocations} />
      </div>
    </>
  );
}
