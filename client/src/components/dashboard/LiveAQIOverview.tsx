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
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToData<any>('parameters', (parametersData) => {
      try {
        if (parametersData) {
          const formattedParams = Object.entries(parametersData).map(([id, param]: [string, any]) => {
            const level = getAQILevel(param.value);
            let percentage = 0;

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
          setLastUpdated(formatRelativeTime(Date.now()));
          setError(null);
        } else {
          setError("No data available");
        }
      } catch (error) {
        console.error("Error processing parameters data:", error);
        setError("Failed to process data");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [selectedLocation]);

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <p className="text-sm text-red-500 dark:text-red-300 mt-1">Please try refreshing the page or check your connection.</p>
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