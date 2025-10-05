import { useState, useEffect } from "react";
import { subscribeToData } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ForecastItem, DayForecast } from "@/types/index";
import { getAQILevel, getAQIColor, getAQILevelText } from "@/lib/utils";

interface ForecastProps {
  selectedLocation: string;
}
let max = 0;

export default function Forecast({ selectedLocation }: ForecastProps) {
  const [sixHourForecast, setSixHourForecast] = useState<ForecastItem[]>([]);
  const [threeDayForecast, setThreeDayForecast] = useState<DayForecast[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = subscribeToData<any>('forecast', (data) => {
      if (data) {
        try {
          // Process 6-hour forecast
          if (data.hourly) {
            const hourlyForecast = Object.entries(data.hourly).map(([id, item]: [string, any]) => {
              const level = getAQILevel(item.aqi);
              return {
                id,
                time: item.time,
                displayTime: new Date(item.time).getHours() + ":00",
                aqi: item.aqi,
                level,
                relativeTime: id === "0" ? "Now" : `+${id}h`
              };
            });

            max = Math.max(...data.hourly.map((item: any) => item.aqi));

            setSixHourForecast(hourlyForecast);
          }

          // Process 3-day forecast
          if (data.daily) {
            const dailyForecast = Object.entries(data.daily).map(([id, item]: [string, any]) => {
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
            });

            setThreeDayForecast(dailyForecast);
          }

          // Set AI recommendation
          if (data.recommendation) {
            setAiRecommendation(data.recommendation);
          } else {
            // We'll generate an AI recommendation using parameters
            try {
              // Import just when needed to avoid potential early initialization issues
              const { generateAirQualityRecommendation } = require('@/lib/openai');

              // Get parameters for AI recommendation
              const aqi = data.daily && data.daily["0"] ? data.daily["0"].aqi : 50;
              const parameters = [];

              if (Object.keys(data.parameters || {}).length > 0) {
                Object.entries(data.parameters).forEach(([id, param]: [string, any]) => {
                  parameters.push({
                    name: id === 'pm25' ? 'PM2.5' :
                      id === 'pm10' ? 'PM10' :
                        id === 'co2' ? 'CO₂' :
                          id.charAt(0).toUpperCase() + id.slice(1),
                    value: param.value,
                    unit: param.unit
                  });
                });
              } else {
                // Add some default parameter if none are available
                parameters.push({ name: 'PM2.5', value: 35, unit: 'μg/m³' });
              }

              // Generate recommendation asynchronously
              generateAirQualityRecommendation(selectedLocation, aqi, parameters)
                .then((aiRecommendation: any) => {
                  setAiRecommendation(aiRecommendation);
                })
                .catch((error: any) => {
                  console.error('Error generating AI recommendation:', error);
                  // Fallback recommendation
                  const todayLevel = getAQILevel(aqi);
                  let fallbackRecommendation = "Air quality is expected to be good today. Enjoy outdoor activities!";

                  if (todayLevel === "moderate") {
                    fallbackRecommendation = "Air quality is expected to remain moderate throughout the day. Consider keeping windows closed during peak traffic hours.";
                  } else if (todayLevel === "poor") {
                    fallbackRecommendation = "Air quality is expected to be poor today. Consider limiting prolonged outdoor activities, especially if you have respiratory issues.";
                  } else if (todayLevel === "unhealthy" || todayLevel === "hazardous") {
                    fallbackRecommendation = "Air quality is expected to be unhealthy today. Avoid outdoor activities and keep windows closed. Consider using air purifiers indoors.";
                  }

                  setAiRecommendation(getAdviceBasedOnAQI(max));
                });
            } catch (error) {
              console.error('Error initializing AI recommendation:', error);
              // Fallback to simple recommendation
              const todayAQI = data.daily && data.daily["0"] ? data.daily["0"].aqi : 50;
              const todayLevel = getAQILevel(todayAQI);

              let recommendation = "Air quality is expected to be good today. Enjoy outdoor activities!";

              if (todayLevel === "moderate") {
                recommendation = "Air quality is expected to remain moderate throughout the day. Consider keeping windows closed during peak traffic hours.";
              } else if (todayLevel === "poor") {
                recommendation = "Air quality is expected to be poor today. Consider limiting prolonged outdoor activities, especially if you have respiratory issues.";
              } else if (todayLevel === "unhealthy" || todayLevel === "hazardous") {
                recommendation = "Air quality is expected to be unhealthy today. Avoid outdoor activities and keep windows closed. Consider using air purifiers indoors.";
              }

              setAiRecommendation(getAdviceBasedOnAQI(max));
            }
          }

          setIsLoading(false);
        } catch (error) {
          console.error("Error processing forecast data:", error);
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
      <Card className="overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">AQI Forecast</h2>
        </div>
        <CardContent className="p-4">
          <Skeleton className="w-full h-24 mb-6 rounded-lg" />
          <Skeleton className="w-full h-16 mb-4 rounded-lg" />
          <Skeleton className="w-full h-40 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  function getAdviceBasedOnAQI(aqi: number): string {
    if (aqi <= 50) {
      return "Air quality is good. Ideal for outdoor activities.";
    } else if (aqi <= 100) {
      return "Air quality is moderate. Consider reducing prolonged outdoor exertion if you're sensitive to pollution.";
    } else if (aqi <= 150) {
      return "Air quality is unhealthy for sensitive groups. People with respiratory conditions should limit outdoor activity.";
    } else if (aqi <= 200) {
      return "Air quality is unhealthy. Everyone should reduce prolonged outdoor exertion.";
    } else if (aqi <= 300) {
      return "Air quality is very unhealthy. Avoid outdoor activities. If possible, stay indoors and use air purifiers.";
    } else {
      return "Air quality is hazardous. Avoid all outdoor activities. Stay indoors with air purifiers running.";
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">AQI Forecast</h2>
      </div>
      <CardContent className="p-4">
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
          <div className="flex items-start">
            <span className="material-icons text-blue-500 mr-3">info</span>
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">AI Recommendation</h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">{aiRecommendation}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* 6 Hour Forecast */}
          <div className="border-b dark:border-gray-700 pb-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Next 6 Hours</h3>
            <div className="grid grid-cols-6 gap-2">
              {sixHourForecast.map((hour) => (
                <div key={hour.id} className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{hour.relativeTime}</p>
                  <div className={`my-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full ${getAQIColor(hour.level as any)}`}>
                    <span className="text-xs font-medium">{hour.aqi}</span>
                  </div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{hour.displayTime}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Day Forecast */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">3 Day Forecast</h3>
            <div className="space-y-2">
              {threeDayForecast.map((day) => (
                <div key={day.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-24">{day.day}</span>
                    <div className="flex items-center">
                      <span className={`material-icons ${day.weather === "Sunny" ? "text-amber-500 dark:text-amber-400" : "text-blue-500 dark:text-blue-400"} text-sm mr-1`}>
                        {day.weatherIcon}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{day.temperature}°C</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full ${getAQIColor(day.level as any)} text-xs font-medium mr-2`}>
                      {day.aqi}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {getAQILevelText(day.level as any)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
