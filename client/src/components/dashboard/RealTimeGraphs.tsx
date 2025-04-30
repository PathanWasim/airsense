import { useState, useEffect, useRef } from "react";
import { subscribeToData } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Chart from "chart.js/auto";

interface RealTimeGraphsProps {
  selectedLocation: string;
}

type TimeRange = "hourly" | "daily" | "weekly";
type PollutantFilter = "all" | "particulate" | "gases" | "climate";

export default function RealTimeGraphs({ selectedLocation }: RealTimeGraphsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("hourly");
  const [pollutantFilter, setPollutantFilter] = useState<PollutantFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = subscribeToData<any>('/trends', (data) => {
      if (data) {
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }
        
        renderChart(data);
        setIsLoading(false);
      }
    });
    
    return () => {
      unsubscribe();
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [selectedLocation, timeRange, pollutantFilter]);
  
  const renderChart = (data: any) => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Filter data based on selections
    let timeData: string[];
    let chartData: any = {};
    
    // In a real implementation, we would use the actual data from Firebase
    // Here we're generating some sample data for the chart
    if (timeRange === 'hourly') {
      timeData = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    } else if (timeRange === 'daily') {
      timeData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else {
      timeData = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    }
    
    // Determine which pollutants to show based on filter
    let datasets = [];
    
    if (pollutantFilter === 'all' || pollutantFilter === 'particulate') {
      datasets.push({
        label: 'PM2.5',
        data: Array(timeData.length).fill(0).map(() => Math.floor(Math.random() * 40) + 20),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4
      });
      
      datasets.push({
        label: 'PM10',
        data: Array(timeData.length).fill(0).map(() => Math.floor(Math.random() * 30) + 40),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4
      });
    }
    
    if (pollutantFilter === 'all' || pollutantFilter === 'gases') {
      datasets.push({
        label: 'CO₂',
        data: Array(timeData.length).fill(0).map(() => Math.floor(Math.random() * 100) + 500),
        borderColor: 'rgba(249, 115, 22, 1)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4
      });
    }
    
    if (pollutantFilter === 'all' || pollutantFilter === 'climate') {
      datasets.push({
        label: 'Temperature',
        data: Array(timeData.length).fill(0).map(() => Math.floor(Math.random() * 10) + 20),
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4,
        yAxisID: 'temperature'
      });
    }
    
    // Create the chart
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timeData,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
            padding: 10,
            cornerRadius: 4,
            bodySpacing: 4
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(156, 163, 175, 0.1)'
            }
          },
          temperature: {
            position: 'right',
            beginAtZero: false,
            grid: {
              display: false
            },
            display: pollutantFilter === 'climate' || pollutantFilter === 'all'
          }
        }
      }
    });
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Real-Time Trends</h2>
        <div className="flex items-center mt-3 md:mt-0 space-x-2">
          <div className="inline-flex items-center rounded-md shadow-sm">
            <button 
              onClick={() => setTimeRange("hourly")}
              className={`px-4 py-2 text-sm font-medium ${timeRange === 'hourly' ? 'text-blue-600 bg-white dark:bg-gray-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700'} border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:z-10 focus:outline-none`}>
              Hourly
            </button>
            <button 
              onClick={() => setTimeRange("daily")}
              className={`px-4 py-2 text-sm font-medium ${timeRange === 'daily' ? 'text-blue-600 bg-white dark:bg-gray-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700'} border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus:z-10 focus:outline-none`}>
              Daily
            </button>
            <button 
              onClick={() => setTimeRange("weekly")}
              className={`px-4 py-2 text-sm font-medium ${timeRange === 'weekly' ? 'text-blue-600 bg-white dark:bg-gray-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700'} border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:z-10 focus:outline-none`}>
              Weekly
            </button>
          </div>
          <select 
            className="rounded-md border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={pollutantFilter}
            onChange={(e) => setPollutantFilter(e.target.value as PollutantFilter)}
          >
            <option value="all">All Pollutants</option>
            <option value="particulate">PM2.5 & PM10</option>
            <option value="gases">Gases (CO, CO₂)</option>
            <option value="climate">Temperature & Humidity</option>
          </select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4 md:p-6">
          {isLoading ? (
            <div className="w-full h-64 md:h-80 flex justify-center items-center">
              <Skeleton className="w-full h-full" />
            </div>
          ) : (
            <div className="w-full h-64 md:h-80">
              <canvas ref={chartRef} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
