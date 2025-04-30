import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import AIAssistant from "@/components/dashboard/AIAssistant";
import UserInteractionPanel from "@/components/dashboard/UserInteractionPanel";
import { useToast } from "@/hooks/use-toast";

export default function AIAssistantPage() {
  const [selectedLocation, setSelectedLocation] = useState("Downtown");
  const { toast } = useToast();

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    toast({
      title: "Location Changed",
      description: `AI Assistant now using data for ${location}`,
      variant: "default",
    });
  };

  const handleRefresh = () => {
    toast({
      title: "AI Assistant Refreshed",
      description: "Latest AI data loaded",
      variant: "default",
    });
  };

  return (
    <>
      <PageHeader 
        title="AI Assistant" 
        description="Get personalized air quality insights and recommendations"
        selectedLocation={selectedLocation}
        onLocationChange={handleLocationChange}
        onRefresh={handleRefresh}
      />
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <AIAssistant selectedLocation={selectedLocation} />
        <UserInteractionPanel selectedLocation={selectedLocation} />
      </div>
    </>
  );
}