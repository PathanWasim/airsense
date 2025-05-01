import { useState, useEffect } from "react";
import { subscribeToData } from "@/lib/firebase";
import { formatRelativeTime, getAQILevel } from "@/lib/utils";
import { AQIParameter } from "@/types/index";
import AQICard from "./AQICard";
import { Skeleton } from "@/components/ui/skeleton";

interface LiveAQIOverviewProps {
  selectedLocation: string;
}

export default function LiveAQIOverview({ selectedLocation }: LiveAQIOverviewProps) {
  const [parameters, setParameters] = useState<AQIParameter[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    // Subscribe to Firebase data
    const unsubscribe = subscribeToData<any>('parameters', (data) => {
      if (data) {
        try {
          const formattedParams = Object.entries(data).map(([id, param]: [string, any]) => {
            const level = getAQILevel(param.value);
            let percentage = 0;
            
            // Determine the percentage for the progress bar based on parameter type
            if (id === 'pm25' || id === 'pm10') {
              percentage = Math.min((param.value / 100) * 100, 100);
            } else if (id === 'co') {
              percentage = Math.min((param.value / 5) * 100, 100);
            } else if (id === 'co2') {
              percentage = Math.min((param.value / 1000) * 100, 100);
            } else if (id === 'temperature') {
              percentage = Math.min(((param.value - 10) / 30) * 100, 100);
            } else if (id === 'humidity') {
              percentage = param.value;
            } else {
              percentage = Math.min((param.value / 100) * 100, 100);
            }
            
            return {
              id,
              name: id === 'pm25' ? 'PM2.5' : 
                    id === 'pm10' ? 'PM10' : 
                    id === 'co2' ? 'CO₂' : 
                    id.charAt(0).toUpperCase() + id.slice(1),
              value: param.value,
              unit: param.unit,
              level,
              percentage
            };
          });
          
          setParameters(formattedParams);
          
          // Check for anomalies
          formattedParams.forEach(param => {
            if ((param.id === 'pm25' && param.value > 100) || 
                (param.id === 'co2' && param.value > 1000)) {
              
              const anomalyData = {
                title: `High ${param.name} Level`,
                description: `${param.name} has exceeded threshold: ${param.value} ${param.unit}`,
                timestamp: Date.now(),
                priority: 'high',
                zone: selectedLocation,
                parameter: param.id,
                value: param.value
              };

              // Update Firebase with new anomaly
              updateData('anomalies', {
                [`alert-${Date.now()}`]: anomalyData
              });
            }
          });

          // Set last updated time if available
          if (data.lastUpdated) {
            setLastUpdated(formatRelativeTime(data.lastUpdated));
          } else {
            setLastUpdated("Just now");
          }
          
          setIsLoading(false);
        } catch (err) {
          console.error("Error processing parameters data:", err);
          setError("Failed to process data. Please check console for details.");
          setIsLoading(false);
        }
      } else {
        // No data returned from Firebase
        setIsLoading(false);
        setError("No air quality data available. Please use the Initialize Data button above.");
      }
    });
    
    return () => unsubscribe();
  }, [selectedLocation]);

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden p-6">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-8 w-20 mb-4" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Live Air Quality Index</h2>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-yellow-800 dark:text-yellow-200">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Live Air Quality Index</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <span className="material-icons text-xs mr-1">schedule</span>
          <span>Last updated: <span className="font-mono">{lastUpdated}</span></span>
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {parameters.map((param) => (
          <AQICard key={param.id} parameter={param} />
        ))}
      </div>
    </div>
  );
}
