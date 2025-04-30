import { useState, useEffect } from 'react';
import { subscribeToData } from '@/lib/firebase';
import { AQIParameter, SensorLocation, ForecastItem, DayForecast, Anomaly } from '@/types/index';
import { getAQILevel, formatRelativeTime } from '@/lib/utils';

interface UseAQIDataOptions {
  location: string;
}

interface AQIDataResult {
  parameters: AQIParameter[];
  locations: SensorLocation[];
  hourlyForecast: ForecastItem[];
  dailyForecast: DayForecast[];
  anomalies: Anomaly[];
  lastUpdated: string;
  isLoading: boolean;
  error: Error | null;
}

export function useAQIData({ location }: UseAQIDataOptions): AQIDataResult {
  const [data, setData] = useState<AQIDataResult>({
    parameters: [],
    locations: [],
    hourlyForecast: [],
    dailyForecast: [],
    anomalies: [],
    lastUpdated: '',
    isLoading: true,
    error: null
  });

  useEffect(() => {
    setData(prev => ({ ...prev, isLoading: true }));
    
    const unsubscribe = subscribeToData<any>('/', (fbData) => {
      if (fbData) {
        try {
          // Process parameters
          const parameters = fbData.parameters ? Object.entries(fbData.parameters).map(([id, param]: [string, any]) => {
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
          }) : [];
          
          // Process locations
          const locations = fbData.locations ? Object.entries(fbData.locations).map(([id, loc]: [string, any]) => {
            const level = getAQILevel(loc.aqi);
            
            return {
              id,
              name: loc.name,
              lat: loc.lat,
              lng: loc.lng,
              aqi: loc.aqi,
              level
            };
          }) : [];
          
          // Process hourly forecast
          const hourlyForecast = fbData.forecast?.hourly ? Object.entries(fbData.forecast.hourly).map(([id, item]: [string, any]) => {
            const level = getAQILevel(item.aqi);
            return {
              id,
              time: item.time,
              displayTime: new Date(item.time).getHours() + ":00",
              aqi: item.aqi,
              level,
              relativeTime: id === "0" ? "Now" : `+${id}h`
            };
          }) : [];
          
          // Process daily forecast
          const dailyForecast = fbData.forecast?.daily ? Object.entries(fbData.forecast.daily).map(([id, item]: [string, any]) => {
            const level = getAQILevel(item.aqi);
            return {
              id,
              day: item.day,
              weather: item.weather,
              weatherIcon: item.weather === "Sunny" ? "wb_sunny" : 
                          item.weather === "Cloudy" ? "cloud" : 
                          item.weather === "Rainy" ? "grain" : 
                          "cloud",
              temperature: item.temperature,
              aqi: item.aqi,
              level
            };
          }) : [];
          
          // Process anomalies
          const anomalies = fbData.anomalies ? Object.entries(fbData.anomalies).map(([id, anomaly]: [string, any]) => ({
            id,
            title: anomaly.title,
            description: anomaly.description,
            timestamp: anomaly.timestamp,
            relativeTime: formatRelativeTime(anomaly.timestamp),
            priority: anomaly.priority as "high" | "medium" | "low" | "resolved",
            zone: anomaly.zone
          })) : [];
          
          // Sort anomalies by timestamp (most recent first)
          anomalies.sort((a, b) => b.timestamp - a.timestamp);
          
          // Set last updated time
          const lastUpdated = fbData.lastUpdated ? formatRelativeTime(fbData.lastUpdated) : "Just now";
          
          setData({
            parameters,
            locations,
            hourlyForecast,
            dailyForecast,
            anomalies,
            lastUpdated,
            isLoading: false,
            error: null
          });
          
        } catch (error) {
          console.error("Error processing data:", error);
          setData(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error instanceof Error ? error : new Error('Unknown error occurred')
          }));
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [location]);

  return data;
}
