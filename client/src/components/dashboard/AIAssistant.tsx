import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage, AQIParameter } from "@/types/index";
import { getAirQualityResponse } from "@/lib/gemini"; // Updated to use Gemini
import { subscribeToData } from "@/lib/firebase";

interface AIAssistantProps {
  selectedLocation: string;
}

export default function AIAssistant({ selectedLocation }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      message: "Hello! I'm your AirSense AI assistant. How can I help you with air quality information today?",
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aqiData, setAqiData] = useState<{
    aqi: number;
    parameters: Array<{
      name: string;
      value: number;
      unit: string;
    }>;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch AQI data for context
  useEffect(() => {
    const locationsSub = subscribeToData<any>('locations', (locationsData) => {
      if (locationsData) {
        // Find the matching location to get overall AQI
        const foundLocation = Object.values(locationsData).find((loc: any) => 
          loc.name === selectedLocation
        );
        
        // Get parameters data separately
        const paramsSub = subscribeToData<any>('parameters', (parametersData) => {
          if (parametersData) {
            // Format parameters
            const formattedParams = Object.entries(parametersData).map(([id, param]: [string, any]) => ({
              name: id === 'pm25' ? 'PM2.5' : 
                    id === 'pm10' ? 'PM10' : 
                    id === 'co2' ? 'CO₂' : 
                    id.charAt(0).toUpperCase() + id.slice(1),
              value: param.value,
              unit: param.unit
            }));
            
            setAqiData({
              aqi: foundLocation?.aqi || 63,
              parameters: formattedParams
            });
          }
        });
        
        return () => paramsSub();
      }
    });
    
    return () => locationsSub();
  }, [selectedLocation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      message: inputMessage,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);
    
    try {
      // Get AI response using OpenAI
      const response = await getAirQualityResponse({
        message: userMessage.message,
        location: selectedLocation,
        airQualityData: aqiData || undefined
      });
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        message: response.message,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Fallback response
      const errorMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        sender: "ai",
        message: "I'm sorry, I couldn't process your request at the moment. Please try again later.",
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    // Focus on input field
    const inputElement = document.getElementById("chat-input") as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">AI Assistant</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ask questions about air quality data</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "300px" }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start ${msg.sender === "user" ? "justify-end" : ""}`}>
            {msg.sender === "ai" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="material-icons text-sm text-blue-600 dark:text-blue-400">smart_toy</span>
                </div>
              </div>
            )}
            <div className={`${msg.sender === "ai" ? "ml-3 bg-gray-100 dark:bg-gray-700" : "bg-blue-600 dark:bg-blue-700"} rounded-lg py-2 px-3 max-w-md`}>
              <p className={`text-sm ${msg.sender === "ai" ? "text-gray-800 dark:text-gray-200" : "text-white"}`}>
                {msg.message}
              </p>
            </div>
            {msg.sender === "user" && (
              <div className="ml-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <span className="material-icons text-sm text-gray-600 dark:text-gray-400">person</span>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="material-icons text-sm text-blue-600 dark:text-blue-400">smart_toy</span>
              </div>
            </div>
            <div className="ml-3 bg-gray-100 dark:bg-gray-700 rounded-lg py-2 px-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center">
          <Input
            id="chat-input"
            type="text"
            placeholder="Type your question..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 rounded-l-md"
          />
          <Button 
            type="submit" 
            className="inline-flex items-center px-4 py-2 rounded-r-md"
          >
            <span className="material-icons text-sm mr-1">send</span>
            Send
          </Button>
        </form>
        <div className="mt-2 flex flex-wrap gap-2">
          <button 
            onClick={() => handleQuickQuestion("What is the AQI now?")}
            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-1 px-2 rounded-full"
          >
            What is the AQI now?
          </button>
          <button 
            onClick={() => handleQuickQuestion("Is it safe to exercise outdoors?")}
            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-1 px-2 rounded-full"
          >
            Is it safe to exercise outdoors?
          </button>
          <button 
            onClick={() => handleQuickQuestion("Show air quality forecast")}
            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-1 px-2 rounded-full"
          >
            Show air quality forecast
          </button>
          <button 
            onClick={() => handleQuickQuestion("What are the main pollutants today?")}
            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-1 px-2 rounded-full"
          >
            What are the main pollutants today?
          </button>
          <button 
            onClick={() => handleQuickQuestion("How do I protect my family from pollution?")}
            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-1 px-2 rounded-full"
          >
            How do I protect my family?
          </button>
          <button 
            onClick={() => handleQuickQuestion("What are the health risks of current air quality?")}
            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-1 px-2 rounded-full"
          >
            Health risks today
          </button>
          <button 
            onClick={() => handleQuickQuestion("Compare air quality with other areas")}
            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-1 px-2 rounded-full"
          >
            Compare with other areas
          </button>
          <button 
            onClick={() => handleQuickQuestion("What causes air pollution here?")}
            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-1 px-2 rounded-full"
          >
            Pollution sources
          </button>
        </div>
      </div>
    </Card>
  );
}
