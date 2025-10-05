const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Define input/output interfaces
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

// Helper function to build the context prompt
function buildPrompt(request: AirQualityRequest): string {
  const { message, location, airQualityData } = request;

  const context = `
You are an environmental AI assistant specialized in analyzing air quality data and providing context-aware health, activity, and safety recommendations.

Location: ${location}
AQI: ${airQualityData?.aqi ?? "N/A"}
Parameters:
${airQualityData?.parameters.map(p => `- ${p.name}: ${p.value} ${p.unit}`).join("\n") || "No parameters available"}

User Question: ${message}

Based on this data, provide a detailed and relevant response with recommendations or alerts as needed.
response should be short and summarative in less than 80 words.
Please provide the following response in bulleted list format with arrows or emojis and start with name "adesh" like look adesh: 
`;

  return context;
}

// Direct API call using fetch (no SDK)
export async function getAirQualityResponse(request: AirQualityRequest): Promise<AirQualityResponse> {
  try {
    if (!API_KEY) {
      return {
        message: "Google AI API key is not configured. Please set VITE_GOOGLE_AI_API_KEY in your environment variables."
      };
    }

    const prompt = buildPrompt(request);

    const body = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    };

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // Extract the response text safely
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No meaningful response from Gemini.";

    return {
      message: text
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      message: "Sorry, I couldn't fetch a response from Gemini at this time."
    };
  }
}
