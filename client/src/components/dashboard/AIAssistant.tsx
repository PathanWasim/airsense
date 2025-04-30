import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/types/index";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
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
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, selectedLocation);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        message: aiResponse,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateAIResponse = (message: string, location: string): string => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes("aqi") || lowerMsg.includes("air quality")) {
      return `The current Air Quality Index (AQI) in ${location} is 52, which is considered "Moderate". The main pollutant is PM2.5 at 35 μg/m³. Would you like recommendations based on this air quality level?`;
    } else if (lowerMsg.includes("exercise") || lowerMsg.includes("outdoor")) {
      return `Based on the current "Moderate" air quality in ${location}, it is generally safe for most people to exercise outdoors. However, if you're unusually sensitive to air pollution, you might want to consider reducing prolonged or intense outdoor activities.`;
    } else if (lowerMsg.includes("forecast")) {
      return `Here's the air quality forecast for ${location}:\n\n- Today: AQI 52 (Moderate)\n- Tomorrow: AQI 38 (Good)\n- Day After: AQI 30 (Good)\n\nThe air quality is expected to improve over the next few days.`;
    } else if (lowerMsg.includes("thank")) {
      return "You're welcome! If you have any more questions about air quality or need further assistance, feel free to ask.";
    } else {
      return `I'm sorry, I'm not sure how to answer that. You can ask me about current air quality, forecasts, health recommendations, or specific pollutants in ${location}.`;
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
        </div>
      </div>
    </Card>
  );
}
