import OpenAI from "openai";

// Create a mock client initially
let openai = new OpenAI({
  apiKey: "placeholder", // This will be replaced with the actual key
  dangerouslyAllowBrowser: true
});

// Flag to track if we've already tried to initialize
let initializing = false;
let initialized = false;

// Initialize the OpenAI client by fetching the API key from server
async function initializeOpenAI(): Promise<OpenAI> {
  // Avoid multiple concurrent initialization attempts
  if (initializing) {
    // Wait until initialization is complete
    return new Promise((resolve) => {
      const checkInitialized = () => {
        if (initialized) {
          resolve(openai);
        } else {
          setTimeout(checkInitialized, 100);
        }
      };
      checkInitialized();
    });
  }
  
  // Return existing instance if already initialized
  if (initialized) {
    return openai;
  }
  
  initializing = true;
  
  try {
    // Fetch API key from server
    const response = await fetch('/api/env');
    const data = await response.json();
    
    if (!data.VITE_OPENAI_API_KEY) {
      throw new Error("API key not found in server response");
    }
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    openai = new OpenAI({ 
      apiKey: data.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Enable API key usage in browser
    });
    
    initialized = true;
    console.log("OpenAI client initialized successfully");
    return openai;
  } catch (error) {
    console.error("Failed to initialize OpenAI client:", error);
    throw error;
  } finally {
    initializing = false;
  }
}

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
    // Initialize OpenAI if not already done
    if (!openai) {
      await initializeOpenAI();
    }
    
    const { message, location, airQualityData } = request;
    
    // Construct system prompt with AQI expertise
    const systemPrompt = `You are an expert air quality analyst AI assistant for an Air Quality Monitoring Dashboard. 
Your role is to provide helpful, accurate information about air quality, pollution, health effects, and recommendations.
- Be concise but informative in your responses
- When making health recommendations, be clear but not alarmist
- Include specific advice related to the air quality parameters mentioned
- Format your response as conversational text
- If technical terms are used, briefly explain them
- Respond directly to user's query without unnecessary preamble`;

    // Create chat completion
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: `Location: ${location}
${airQualityData ? `
Current AQI: ${airQualityData.aqi}
Parameters: ${airQualityData.parameters.map(p => `${p.name}: ${p.value} ${p.unit}`).join(', ')}
` : ''}
User question: ${message}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Extract and return the AI message
    const aiMessage = response.choices[0].message.content?.trim() || 
      "I'm sorry, I couldn't analyze the air quality data at this moment.";
    
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
export async function generateAirQualityRecommendation(
  location: string, 
  aqi: number,
  parameters: Array<{ name: string; value: number; unit: string }>
): Promise<string> {
  try {
    // Initialize OpenAI if not already done
    if (!openai) {
      await initializeOpenAI();
    }
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: `You are an expert air quality analyst providing concise recommendations based on current air quality data.
Format your response as a single short paragraph (3-4 sentences maximum) with practical advice.
Focus on health recommendations, activities to avoid or encourage, and any precautions specific groups should take.`
        },
        {
          role: "user",
          content: `Location: ${location}
Current AQI: ${aqi}
Parameters: ${parameters.map(p => `${p.name}: ${p.value} ${p.unit}`).join(', ')}

Generate a concise recommendation based on this air quality data.`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    return response.choices[0].message.content?.trim() || 
      "Based on current air quality conditions, no special precautions are needed.";
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return "Unable to generate recommendations at this time. Please check back later.";
  }
}

export default openai;