import { useState, useEffect } from "react";
import { subscribeToData } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Report } from "@/types/index";

interface ReportsDownloadsProps {
  selectedLocation: string;
}

export default function ReportsDownloads({ selectedLocation }: ReportsDownloadsProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = subscribeToData<any>('reports', (data) => {
      if (data) {
        try {
          const formattedReports = Object.entries(data).map(([id, report]: [string, any]) => {
            // Determine icon based on report type
            let icon = "description";
            if (report.type === "data") {
              icon = "table_chart";
            } else if (report.type === "anomaly") {
              icon = "error";
            }
            
            return {
              id,
              title: report.title,
              description: report.description,
              date: report.date,
              type: report.type,
              icon,
              fileType: report.fileType
            };
          });
          
          setReports(formattedReports);
          setIsLoading(false);
        } catch (error) {
          console.error("Error processing reports data:", error);
          setIsLoading(false);
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [selectedLocation]);

  if (isLoading) {
    return (
      <Card className="overflow-hidden mb-6">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Reports & Downloads</h2>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the right icon color based on report type
  const getIconColor = (type: string) => {
    switch (type) {
      case "report":
        return "text-blue-500 dark:text-blue-400";
      case "data":
        return "text-green-500 dark:text-green-400";
      case "anomaly":
        return "text-red-500 dark:text-red-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <Card className="overflow-hidden mb-6">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Reports & Downloads</h2>
      </div>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className={`material-icons ${getIconColor(report.type)}`}>{report.icon}</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{report.title}</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{report.description}</p>
                  <div className="mt-2 flex items-center">
                    <a 
                      href="#" 
                      className="inline-flex items-center text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      onClick={(e) => {
                        e.preventDefault();
                        // In a real app, this would download the file
                        alert(`Downloading ${report.title} in ${report.fileType} format`);
                      }}
                    >
                      <span className="material-icons text-xs mr-1">download</span>
                      Download {report.fileType.toUpperCase()}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
