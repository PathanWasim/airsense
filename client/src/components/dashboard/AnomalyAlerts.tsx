import { useState, useEffect } from "react";
import { subscribeToData } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Anomaly } from "@/types/index";
import { formatRelativeTime } from "@/lib/utils";

interface AnomalyAlertsProps {
  selectedLocation: string;
}

export default function AnomalyAlerts({ selectedLocation }: AnomalyAlertsProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = subscribeToData<any>('anomalies', async (data) => {
      if (data) {
        const anomaliesArray = Object.entries(data)
          .map(([id, anomaly]: [string, any]) => ({
            id,
            ...anomaly,
            relativeTime: formatRelativeTime(anomaly.timestamp)
          }))
          .sort((a, b) => b.timestamp - a.timestamp);

        // Keep only the last 5 alerts
        if (anomaliesArray.length > 5) {
          const oldestAnomalies = anomaliesArray.slice(5);
          // Remove old anomalies from Firebase
          const updates = oldestAnomalies.reduce((acc, anomaly) => {
            acc[`anomalies/${anomaly.id}`] = null;
            return acc;
          }, {});
          await updateData('/', updates);
        }

        // Update audit trail
        const auditData = anomaliesArray.reduce((acc, anomaly) => {
          if (!acc[anomaly.parameter]) {
            acc[anomaly.parameter] = {
              lastAlert: anomaly.timestamp,
              count: 1,
              currentStatus: 'alert'
            };
          }
          return acc;
        }, {});
        
        await updateData('anomalyAudit', auditData);
      if (data) {
        try {
          const formattedAnomalies = Object.entries(data).map(([id, anomaly]: [string, any]) => ({
            id,
            title: anomaly.title,
            description: anomaly.description,
            timestamp: anomaly.timestamp,
            relativeTime: formatRelativeTime(anomaly.timestamp),
            priority: anomaly.priority as "high" | "medium" | "low" | "resolved",
            zone: anomaly.zone
          }));
          
          // Sort by timestamp (most recent first)
          formattedAnomalies.sort((a, b) => b.timestamp - a.timestamp);
          
          setAnomalies(formattedAnomalies);
        } catch (error) {
          console.error("Error processing anomalies data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [selectedLocation]);

  // Function to get appropriate icon and color based on priority
  const getAnomalyStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return {
          icon: "warning",
          color: "text-red-500",
          badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
        };
      case "medium":
        return {
          icon: "error_outline",
          color: "text-amber-500",
          badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
        };
      case "low":
        return {
          icon: "info",
          color: "text-blue-500",
          badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
        };
      case "resolved":
        return {
          icon: "check_circle",
          color: "text-green-500",
          badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        };
      default:
        return {
          icon: "info",
          color: "text-gray-500",
          badge: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        };
    }
  };

  // Function to get text for priority
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "High Priority";
      case "medium":
        return "Medium Priority";
      case "low":
        return "Low Priority";
      case "resolved":
        return "Resolved";
      default:
        return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Anomaly Alerts</h2>
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4">
              <div className="flex items-start">
                <Skeleton className="w-6 h-6 rounded-full" />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-32 h-5" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                  <div className="mt-1">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4 mt-1" />
                  </div>
                  <div className="mt-2 flex">
                    <Skeleton className="w-24 h-5 rounded-full mr-2" />
                    <Skeleton className="w-16 h-5 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Count active (non-resolved) anomalies
  const activeAnomalies = anomalies.filter(a => a.priority !== "resolved").length;

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Anomaly Alerts</h2>
        {activeAnomalies > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 dark:bg-red-700 rounded-full">
            {activeAnomalies}
          </span>
        )}
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {anomalies.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No anomalies detected</p>
          </div>
        ) : (
          anomalies.map((anomaly) => {
            const styles = getAnomalyStyles(anomaly.priority);
            
            return (
              <div key={anomaly.id} className="p-4 hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className={`material-icons ${styles.color}`}>{styles.icon}</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{anomaly.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{anomaly.relativeTime}</p>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{anomaly.description}</p>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.badge}`}>
                        {getPriorityText(anomaly.priority)}
                      </span>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        {anomaly.zone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="p-4 bg-gray-50 dark:bg-gray-750 text-center">
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
          View All Alerts
        </button>
      </div>
    </Card>
  );
}
