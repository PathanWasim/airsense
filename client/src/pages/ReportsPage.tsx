import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import ReportsDownloads from "@/components/dashboard/ReportsDownloads";
import { useToast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const [selectedLocation, setSelectedLocation] = useState("Downtown");
  const { toast } = useToast();

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    toast({
      title: "Location Changed",
      description: `Displaying reports for ${location}`,
      variant: "default",
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Reports Refreshed",
      description: "Latest reports loaded",
      variant: "default",
    });
  };

  return (
    <>
      <PageHeader 
        title="Reports & Downloads" 
        description="Access historical reports and analysis documents"
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
        onRefresh={handleRefresh}
      />
      
      <ReportsDownloads selectedLocation={selectedLocation} />
    </>
  );
}