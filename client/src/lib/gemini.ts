import { GoogleGenerativeAI } from '@google/generative-ai';

// Setup the Gemini API
// Using a default development API key since we're just mocking responses for demo purposes
const API_KEY = "GEMINI_API_KEY_DEMO_MODE";
const genAI = new GoogleGenerativeAI(API_KEY);

// Define types to match our existing API interface
export interface AirQualityRequest {
  message: string;
  location: string;
  airQualityData?: {
    aqi: number;
    parameters: Array<{
      name: string;
      value: number;
      unit: string;
    }>;
  };
}

export interface AirQualityResponse {
  message: string;
  recommendation?: string;
  analysis?: {
    concerns: string[];
    positives: string[];
  };
}

// Function to convert AQI value to air quality level
function getAirQualityLevel(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

/**
 * This is a simulated/mock implementation since we're not using an actual API key
 * In a real implementation, this would make API calls to Google's Gemini API
 */
export async function getAirQualityResponse(request: AirQualityRequest): Promise<AirQualityResponse> {
  try {
    // In demo mode, generate appropriate responses based on the request data
    // without actually calling the Gemini API
    
    // Extract data from request
    const { message, location, airQualityData } = request;
    const aqi = airQualityData?.aqi || 63;
    const parameters = airQualityData?.parameters || [];
    
    // Different response templates based on question types
    
    // If asking about current AQI
    if (message.toLowerCase().includes("aqi") && message.toLowerCase().includes("now")) {
      const aqiLevel = getAirQualityLevel(aqi);
      return {
        message: `The current Air Quality Index (AQI) in ${location} is ${aqi}, which is considered "${aqiLevel}". This reading was taken from the most recent sensor data.`,
        recommendation: aqiLevel === "Good" ? 
          "The air quality is good, so it's a great time for outdoor activities!" : 
          `With ${aqiLevel} air quality, those with respiratory sensitivities should consider limiting prolonged outdoor exposure.`
      };
    }
    
    // If asking about exercising outdoors
    if (message.toLowerCase().includes("exercise") && message.toLowerCase().includes("outdoor")) {
      const aqiLevel = getAirQualityLevel(aqi);
      
      if (aqi < 50) {
        return {
          message: `Yes, it's safe to exercise outdoors in ${location} today. The current AQI is ${aqi} (${aqiLevel}), which is considered good for all outdoor activities including running, cycling, or team sports.`,
          recommendation: "Enjoy your workout and stay hydrated!"
        };
      } else if (aqi < 100) {
        return {
          message: `It's generally okay to exercise outdoors in ${location} today, but be mindful of how you feel. The current AQI is ${aqi} (${aqiLevel}), which might affect unusually sensitive individuals.`,
          recommendation: "Consider shorter or less intense workouts if you have respiratory issues. Stay hydrated and take breaks as needed."
        };
      } else {
        return {
          message: `I would recommend caution with outdoor exercise in ${location} today. The current AQI is ${aqi} (${aqiLevel}), which could cause respiratory discomfort during prolonged exercise.`,
          recommendation: "Consider indoor alternatives or very short, less intense outdoor activities. If you experience any discomfort, move indoors immediately."
        };
      }
    }
    
    // If asking about forecast
    if (message.toLowerCase().includes("forecast")) {
      return {
        message: `Based on current trends in ${location}, we expect the air quality to remain in the ${getAirQualityLevel(aqi)} range for the next 24 hours, with some improvement expected in the evening hours as traffic decreases. The AQI is predicted to fluctuate between ${Math.max(aqi - 15, 0)} and ${aqi + 10}.`,
        recommendation: "Check the Forecast tab for a detailed hourly and daily air quality prediction."
      };
    }
    
    // If asking about pollutants
    if (message.toLowerCase().includes("pollutant")) {
      const mainParameter = parameters.sort((a, b) => b.value - a.value)[0];
      
      return {
        message: `The main pollutant in ${location} right now is ${mainParameter?.name || "PM2.5"} with a reading of ${mainParameter?.value || 35} ${mainParameter?.unit || "μg/m³"}. Other notable parameters include ${parameters[1]?.name || "PM10"} (${parameters[1]?.value || 28} ${parameters[1]?.unit || "μg/m³"}) and ${parameters[2]?.name || "CO₂"} (${parameters[2]?.value || 720} ${parameters[2]?.unit || "ppm"}).`,
        analysis: {
          concerns: [
            `${mainParameter?.name || "PM2.5"} levels are ${mainParameter?.value > 35 ? "above" : "within"} recommended limits`,
            `Current ${parameters[1]?.name || "PM10"} concentration may affect sensitive individuals`,
          ],
          positives: [
            `${parameters[2]?.name || "CO₂"} levels are within normal range`,
            "No hazardous gas levels detected in your area"
          ]
        }
      };
    }
    
    // If asking about protection
    if (message.toLowerCase().includes("protect") && (message.toLowerCase().includes("family") || message.toLowerCase().includes("me"))) {
      return {
        message: `To protect yourself and your family from the current air quality conditions in ${location} (AQI: ${aqi}), consider these measures:`,
        recommendation: `
1. Keep windows closed during high pollution periods
2. Use air purifiers with HEPA filters indoors
3. Check air quality reports before planning outdoor activities
4. Wear N95 masks when outdoors if AQI exceeds 150
5. Stay well-hydrated and maintain indoor plants that help filter air
6. Consider air quality monitoring devices for your home`,
      };
    }
    
    // If asking about health risks
    if (message.toLowerCase().includes("health") && message.toLowerCase().includes("risk")) {
      if (aqi < 50) {
        return {
          message: `With the current AQI of ${aqi} in ${location}, health risks are minimal for most people. Air quality is considered Good, and there are no significant health concerns.`,
          analysis: {
            concerns: [],
            positives: [
              "Air quality poses little to no risk",
              "Safe for all outdoor activities",
              "No special precautions needed for sensitive groups"
            ]
          }
        };
      } else if (aqi < 100) {
        return {
          message: `With the current AQI of ${aqi} in ${location}, there may be moderate health concerns for a very small number of individuals who are unusually sensitive to air pollution.`,
          analysis: {
            concerns: [
              "May cause respiratory symptoms in highly sensitive individuals",
              "Could trigger mild asthma symptoms in children with asthma"
            ],
            positives: [
              "Most people won't experience negative health effects",
              "Generally safe for most outdoor activities"
            ]
          }
        };
      } else {
        return {
          message: `With the current AQI of ${aqi} in ${location}, there are health risks to consider, especially for sensitive groups including children, elderly, and those with respiratory conditions.`,
          analysis: {
            concerns: [
              "May cause respiratory irritation in general population",
              "Could worsen existing heart or lung disease",
              "May trigger asthma attacks in susceptible individuals"
            ],
            positives: [
              "Effects are generally reversible once air quality improves",
              "Indoor air quality with proper filtration remains good"
            ]
          }
        };
      }
    }
    
    // If asking about comparison with other areas
    if ((message.toLowerCase().includes("compare") || message.toLowerCase().includes("comparison")) && message.toLowerCase().includes("area")) {
      return {
        message: `Compared to other monitored areas, ${location}'s current AQI of ${aqi} is ${aqi < 50 ? "better" : "slightly worse"} than the regional average. Downtown areas typically show higher pollution levels (AQI ~75) due to traffic, while residential suburbs average around 45-55. Industrial zones can reach AQIs of 85-95 during peak operational hours.`,
        recommendation: "For a visual comparison, check the Map View which shows all monitoring stations with color-coded air quality levels."
      };
    }
    
    // If asking about pollution sources
    if (message.toLowerCase().includes("cause") && message.toLowerCase().includes("pollution")) {
      return {
        message: `The main sources of air pollution in ${location} include:
1. Vehicle emissions from nearby highways and urban traffic
2. Industrial activities from manufacturing facilities
3. Construction dust and emissions
4. Energy production from local power plants
5. Seasonal factors like pollen or wildfire smoke

The current levels are most influenced by ${aqi > 70 ? "traffic patterns and industrial emissions" : "normal urban activity with moderate traffic"}.`,
        recommendation: "Pollution levels typically peak during morning and evening rush hours (7-9am and 4-6pm)."
      };
    }
    
    // Default response for other questions
    return {
      message: `Based on the air quality data for ${location} (AQI: ${aqi}), I can tell you that the current conditions are ${getAirQualityLevel(aqi).toLowerCase()}. The most significant parameters are ${parameters[0]?.name || "PM2.5"} (${parameters[0]?.value || 35} ${parameters[0]?.unit || "μg/m³"}) and ${parameters[1]?.name || "CO₂"} (${parameters[1]?.value || 720} ${parameters[1]?.unit || "ppm"}). How else can I help you understand today's air quality information?`,
      recommendation: "You can ask me about health implications, forecasts, or specific pollutant levels."
    };
  } catch (error) {
    console.error("Error in AI response generation:", error);
    return {
      message: "I'm sorry, I couldn't generate a response at this time. Please try again later.",
    };
  }
}

/**
 * In a real implementation with a valid API key, this function would make actual calls to the Gemini API 
 */
export async function generateAirQualityRecommendation(
  location: string, 
  aqi: number, 
  parameters: {name: string; value: number; unit: string}[]
): Promise<string> {
  try {
    // Mock implementation for demo purposes
    const aqiLevel = getAirQualityLevel(aqi);
    
    if (aqi < 50) {
      return `Air quality in ${location} is excellent today. It's a great time for outdoor activities and enjoying the fresh air!`;
    } else if (aqi < 100) {
      return `Air quality in ${location} is acceptable. Those who are unusually sensitive to air pollution may want to reduce prolonged outdoor exertion.`;
    } else if (aqi < 150) {
      return `People with respiratory or heart conditions, the elderly, and children should limit prolonged outdoor exertion in ${location} today.`;
    } else {
      return `Everyone should avoid prolonged outdoor exertion in ${location} today. Consider using air purifiers indoors and wearing masks if you need to go outside.`;
    }
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return "Unable to generate air quality recommendations at this time.";
  }
}