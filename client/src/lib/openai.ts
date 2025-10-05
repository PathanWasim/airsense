// This is a simplified mock implementation for demonstration purposes
// In a real production environment, API calls would be made server-side to protect API keys

// Types for Air Quality specific chat interactions
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

/**
 * Get AI response for air quality related questions
 */
export async function getAirQualityResponse(request: AirQualityRequest): Promise<AirQualityResponse> {
  try {
    const { message, location, airQualityData } = request;
    
    // Mock AI response generation based on user's question
    const lowerMsg = message.toLowerCase();
    let aiMessage = "";
    
    // Get AQI level description
    const getAQILevelText = (aqi: number) => {
      if (aqi <= 50) return "Good";
      if (aqi <= 100) return "Moderate";
      if (aqi <= 150) return "Unhealthy for Sensitive Groups";
      if (aqi <= 200) return "Unhealthy";
      if (aqi <= 300) return "Very Unhealthy";
      return "Hazardous";
    };
    
    const aqi = airQualityData?.aqi || 52;
    const aqiLevel = getAQILevelText(aqi);
    const pm25Value = airQualityData?.parameters.find(p => p.name === 'PM2.5')?.value || 35;
    
    // Comprehensive set of keyword match patterns for different question types
    if (lowerMsg.includes("aqi") || lowerMsg.match(/air quality|current quality|how is the air/)) {
      aiMessage = `The current Air Quality Index (AQI) in ${location} is ${aqi}, which is considered "${aqiLevel}". The main pollutant is PM2.5 at ${pm25Value} μg/m³. Would you like recommendations based on this air quality level?`;
    } 
    else if (lowerMsg.match(/exercise|outdoor|outside|sport|run|jog|walk|hiking/)) {
      if (aqi <= 50) {
        aiMessage = `With the current "Good" air quality in ${location} (AQI: ${aqi}), it's an excellent time for outdoor activities. All individuals can exercise outdoors without health concerns related to air quality.`;
      } else if (aqi <= 100) {
        aiMessage = `Based on the current "Moderate" air quality in ${location} (AQI: ${aqi}), it is generally safe for most people to exercise outdoors. However, if you're unusually sensitive to air pollution, you might want to consider reducing prolonged or intense outdoor activities.`;
      } else if (aqi <= 150) {
        aiMessage = `With the current air quality level in ${location} (AQI: ${aqi}) being "Unhealthy for Sensitive Groups," active children and adults, and people with respiratory diseases should limit prolonged outdoor exertion. Everyone else can continue activities with caution.`;
      } else {
        aiMessage = `I would advise against extended outdoor exercise today in ${location}. The AQI is ${aqi}, which is considered "${aqiLevel}". It's best to exercise indoors or reschedule outdoor activities when air quality improves.`;
      }
    }
    else if (lowerMsg.match(/forecast|predict|tomorrow|week|future|later|upcoming/)) {
      aiMessage = `Here's the air quality forecast for ${location}:\n\n- Today: AQI ${aqi} (${aqiLevel})\n- Tomorrow: AQI 38 (Good)\n- Day After: AQI 30 (Good)\n\nThe air quality is expected to improve over the next few days due to changing weather conditions.`;
    }
    else if (lowerMsg.match(/pollutant|contaminant|particle|pm2\.5|pm10|ozone|o3|nitrogen|no2|carbon|co|co2|sulfur|so2/)) {
      aiMessage = `Here are the current pollutant levels in ${location}:\n\n- PM2.5: ${pm25Value} μg/m³ (Fine particulate matter)\n- PM10: ${airQualityData?.parameters.find(p => p.name === 'PM10')?.value || 42} μg/m³ (Coarse particulate matter)\n- O3: ${airQualityData?.parameters.find(p => p.name === 'O3')?.value || 48} ppb (Ozone)\n- NO2: ${airQualityData?.parameters.find(p => p.name === 'NO2')?.value || 15} ppb (Nitrogen Dioxide)\n- CO: ${airQualityData?.parameters.find(p => p.name === 'CO')?.value || 0.8} ppm (Carbon Monoxide)\n\nPM2.5 is currently the main pollutant of concern.`;
    }
    else if (lowerMsg.match(/health|effect|symptom|risk|respiratory|asthma|lung|heart|allergy/)) {
      if (aqi <= 50) {
        aiMessage = `At the current "Good" AQI of ${aqi} in ${location}, air quality poses little to no health risk. Even sensitive individuals can enjoy outdoor activities without concern for air quality-related health effects.`;
      } else if (aqi <= 100) {
        aiMessage = `With a "Moderate" AQI of ${aqi} in ${location}, the air quality may cause minor respiratory symptoms in highly sensitive individuals, particularly those with pre-existing conditions like asthma. Most people won't experience any adverse health effects.`;
      } else if (aqi <= 150) {
        aiMessage = `The current AQI of ${aqi} in ${location} is "Unhealthy for Sensitive Groups" and may cause respiratory symptoms in sensitive individuals, including people with lung disease, older adults, and children. These groups should limit prolonged outdoor exposure.`;
      } else {
        aiMessage = `The current "${aqiLevel}" air quality (AQI: ${aqi}) in ${location} can cause health effects for many people, especially those with respiratory conditions. Possible symptoms include irritation of the eyes, nose, and throat, coughing, chest tightness, and shortness of breath. Limit outdoor activities and stay indoors with filtered air if possible.`;
      }
    }
    else if (lowerMsg.match(/protect|protection|mask|filter|purifier|indoor|stay inside|window/)) {
      aiMessage = `To protect yourself from the current air quality in ${location} (AQI: ${aqi}), consider these measures:\n\n1. Stay indoors when possible with windows closed\n2. Use air purifiers with HEPA filters indoors\n3. If you must go outside, consider wearing an N95 or KN95 mask\n4. Avoid exercise near high-traffic areas\n5. Stay hydrated and monitor any respiratory symptoms\n6. Check air quality forecasts regularly\n\nThese precautions are especially important for sensitive individuals such as children, the elderly, and those with respiratory conditions.`;
    }
    else if (lowerMsg.match(/source|cause|reason|why|where|traffic|industry|fire|smoke|dust/)) {
      aiMessage = `In ${location}, the current air pollution is primarily caused by:\n\n1. Vehicle emissions from traffic (contributes ~40%)\n2. Industrial activities in nearby areas (contributes ~25%)\n3. Regional weather patterns trapping pollutants (contributes ~15%)\n4. Residential heating and cooking (contributes ~10%)\n5. Construction and road dust (contributes ~10%)\n\nThe main pollutant today is PM2.5, which mainly comes from combustion sources like vehicles and industrial processes.`;
    }
    else if (lowerMsg.match(/compare|comparison|versus|vs|better|worse|other city|other location/)) {
      aiMessage = `When comparing air quality in ${location} (AQI: ${aqi}) with other nearby areas:\n\n- Downtown: AQI 56 (Moderate)\n- Westside: AQI 42 (Good) \n- Eastside: AQI 64 (Moderate)\n- Southside: AQI 48 (Good)\n- Northside: AQI 52 (Moderate)\n\nThe Westside currently has the best air quality in the region, while Eastside has the highest pollution levels today due to industrial activity and traffic patterns.`;
    }
    else if (lowerMsg.match(/child|kid|baby|school|play|elderly|senior|sensitive|vulnerable/)) {
      if (aqi <= 50) {
        aiMessage = `With today's "Good" air quality (AQI: ${aqi}) in ${location}, children and sensitive groups can safely participate in outdoor activities without restrictions.`;
      } else if (aqi <= 100) {
        aiMessage = `At the current "Moderate" air quality level (AQI: ${aqi}) in ${location}, unusually sensitive children should consider limiting prolonged outdoor exertion, but most children can still safely play outdoors. Parents of children with asthma or other respiratory conditions should monitor them for symptoms.`;
      } else if (aqi <= 150) {
        aiMessage = `The current air quality in ${location} (AQI: ${aqi}) is "Unhealthy for Sensitive Groups." Children, especially those with asthma or respiratory issues, and elderly individuals should limit outdoor physical activities. Schools may want to consider keeping sensitive children indoors during recess, and elderly people should reduce prolonged or heavy exertion.`;
      } else {
        aiMessage = `With the current "${aqiLevel}" air quality (AQI: ${aqi}) in ${location}, it's advisable to keep children and elderly individuals indoors. Schools should consider indoor recess and activities. If sensitive individuals must go outside, they should limit their time and avoid physical exertion.`;
      }
    }
    else if (lowerMsg.match(/thanks|thank you|thx|great/)) {
      aiMessage = "You're welcome! I'm happy to help with any other air quality questions or concerns you might have. Feel free to ask anytime you need information about air quality, health recommendations, or pollution trends.";
    }
    else if (lowerMsg.match(/hi|hello|hey|greetings|good morning|good afternoon|good evening/)) {
      aiMessage = `Hello! I'm your AirSense AI assistant for ${location}. I can provide you with information about current air quality, forecasts, health recommendations, and more. How can I help you today?`;
    }
    else if (lowerMsg.match(/help|what can you do|assist|function|capability/)) {
      aiMessage = `I'm here to help with all your air quality questions for ${location}. You can ask me about:\n\n- Current AQI and pollutant levels\n- Health effects and recommendations\n- Safe outdoor activity guidelines\n- Air quality forecasts\n- Protection measures during poor air quality\n- Pollution sources and trends\n- Comparisons with other areas\n- Information for sensitive groups like children or elderly\n\nJust ask any question related to these topics!`;
    }
    else {
      aiMessage = `I'm here to help with air quality information for ${location}. You can ask me about current air quality, forecasts, health recommendations, specific pollutants, protective measures, pollution sources, or guidance for sensitive groups. For example, try asking "What's the current AQI?", "Is it safe to exercise outdoors today?", or "How can I protect my family from air pollution?"`;
    }
    
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      message: aiMessage,
    };
  } catch (error) {
    console.error("Error getting OpenAI response:", error);
    return {
      message: "I apologize, but I encountered an error while processing your request. Please try again later."
    };
  }
}

/**
 * Generate air quality recommendations based on current data
 */
export const generateAirQualityRecommendation = async (location: string, aqi: number, parameters: any[]) => {

  try {
    // Get AQI level for recommendation
    const getAQILevel = (value: number) => {
      if (value <= 50) return "good";
      if (value <= 100) return "moderate";
      if (value <= 150) return "poor";
      if (value <= 200) return "unhealthy";
      return "hazardous";
    };
    
    const level = getAQILevel(aqi);
    
    // Generate recommendation based on AQI level
    let recommendation = "";
    
    // Simulate a delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    switch(level) {
      case "good":
        recommendation = `The air quality in ${location} is good with an AQI of ${aqi}. It's a great day to enjoy outdoor activities. All population groups can enjoy the outdoors without health concerns related to air quality.`;
        break;
      case "moderate":
        recommendation = `With a moderate AQI of ${aqi} in ${location} today, most people can safely engage in outdoor activities. However, individuals with unusual sensitivity to air pollution may experience minor respiratory symptoms and should consider reducing prolonged or heavy exertion outdoors.`;
        break;
      case "poor":
        recommendation = `The air quality in ${location} is poor (AQI: ${aqi}). Sensitive groups including children, elderly, and those with respiratory conditions should limit outdoor activities. Everyone else should reduce prolonged or heavy exertion outdoors, especially near high-traffic areas.`;
        break;
      case "unhealthy":
        recommendation = `Air quality is unhealthy in ${location} with an AQI of ${aqi}. Everyone should reduce outdoor activities, especially children and those with heart or lung disease. If possible, remain indoors with windows closed and consider using air purifiers.`;
        break;
      case "hazardous":
        recommendation = `CAUTION: Hazardous air quality in ${location} (AQI: ${aqi}). Avoid all outdoor physical activities and stay indoors with windows closed. Use air purifiers if available. Those with respiratory or heart conditions should take extra precautions and contact healthcare providers if symptoms worsen.`;
        break;
      default:
        recommendation = `Based on the current air quality in ${location} (AQI: ${aqi}), monitor conditions and adjust outdoor activities accordingly.`;
    }
    
    return recommendation;
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return "Unable to generate recommendations at this time. Please check back later.";
  }
}
// No default export needed for this implementation