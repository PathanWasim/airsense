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
    
    // First, let's get the parameters data
    const unsubscribeParams = subscribeToData<any>('/parameters', (parametersData) => {
      if (parametersData) {
        // Then get historical data or generate it if needed
        generateHistoricalData(parametersData);
      }
    });
    
    return () => {
      unsubscribeParams();
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [selectedLocation, timeRange, pollutantFilter]);
  
  // Generate or fetch historical data based on current parameters
  const generateHistoricalData = (parametersData: any) => {
    if (!parametersData) return;
    
    // Get current parameter values to use as base for historical data
    const currentPM25 = parametersData.pm25?.value || 35;
    const currentPM10 = parametersData.pm10?.value || 42;
    const currentCO2 = parametersData.co2?.value || 750;
    const currentTemp = parametersData.temperature?.value || 24;
    
    // Create the historical data with realistic variations
    const historicalData = {
      hourly: {
        labels: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'],
        pm25: Array(9).fill(0).map((_,i) => Math.max(5, currentPM25 + (Math.sin(i/2) * 10 - i/2))),
        pm10: Array(9).fill(0).map((_,i) => Math.max(10, currentPM10 + (Math.cos(i/1.5) * 8 - i/3))),
        co2: Array(9).fill(0).map((_,i) => Math.max(400, currentCO2 + (Math.sin(i/3) * 50 + i*3))),
        temperature: Array(9).fill(0).map((_,i) => Math.max(15, currentTemp + (Math.sin(i/4) * 3 - 1)))
      },
      daily: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        pm25: Array(7).fill(0).map((_,i) => Math.max(5, currentPM25 + (Math.sin(i/1.2) * 15 - i))),
        pm10: Array(7).fill(0).map((_,i) => Math.max(10, currentPM10 + (Math.cos(i) * 12 - i/2))),
        co2: Array(7).fill(0).map((_,i) => Math.max(400, currentCO2 + (Math.sin(i/2) * 70 + i*5))),
        temperature: Array(7).fill(0).map((_,i) => Math.max(15, currentTemp + (Math.sin(i/3) * 4 - 2)))
      },
      weekly: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        pm25: Array(4).fill(0).map((_,i) => Math.max(5, currentPM25 + (Math.sin(i) * 20 - i*2))),
        pm10: Array(4).fill(0).map((_,i) => Math.max(10, currentPM10 + (Math.cos(i/1.2) * 15 - i))),
        co2: Array(4).fill(0).map((_,i) => Math.max(400, currentCO2 + (Math.sin(i/1.5) * 100 + i*8))),
        temperature: Array(4).fill(0).map((_,i) => Math.max(15, currentTemp + (Math.sin(i/2) * 5 - 3)))
      }
    };
    
    // Now render the chart with this data
    renderChart(historicalData);
    setIsLoading(false);
  };
  
  const renderChart = (data: any) => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Clean up any existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Get time period data
    const timeData = data[timeRange].labels;
    
    // Prepare datasets based on filter
    let datasets = [];
    
    if (pollutantFilter === 'all' || pollutantFilter === 'particulate') {
      datasets.push({
        label: 'PM2.5',
        data: data[timeRange].pm25,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.4
      });
      
      datasets.push({
        label: 'PM10',
        data: data[timeRange].pm10,
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
        data: data[timeRange].co2,
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
        data: data[timeRange].temperature,
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
