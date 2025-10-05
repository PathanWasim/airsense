import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { getAqiCategory } from "@/lib/firebase";

interface SensorLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
}

interface MapViewProps {
  locations: SensorLocation[];
}

export function MapView({ locations }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Clean up function to properly remove canvas
  const cleanupCanvas = () => {
    if (canvasRef.current && canvasRef.current.parentNode) {
      canvasRef.current.parentNode.removeChild(canvasRef.current);
      canvasRef.current = null;
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up any existing canvas before creating a new one
    cleanupCanvas();
    
    // This would normally load Google Maps
    // Since we can't include the API key here, we'll simulate the map
    const simulateMap = () => {
      if (!mapRef.current) return;
      
      const canvas = document.createElement('canvas');
      canvas.width = mapRef.current.clientWidth;
      canvas.height = mapRef.current.clientHeight;
      mapRef.current.appendChild(canvas);
      // Store reference to the canvas for proper cleanup
      canvasRef.current = canvas;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Draw map background
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw some map features
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      
      // Draw roads
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const length = Math.random() * 100 + 50;
        const angle = Math.random() * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
      }
      
      // Draw sensor locations
      locations.forEach((location, index) => {
        // Convert lat/lng to canvas x,y (simple mapping for visualization)
        const x = (index * canvas.width / locations.length) + 50;
        const y = 100 + Math.random() * 150;
        
        const category = getAqiCategory(location.aqi);
        let color = '#4ade80'; // Default good color
        
        if (category.className === 'aqi-badge-moderate') {
          color = '#facc15';
        } else if (category.className === 'aqi-badge-unhealthy') {
          color = '#f97316';
        } else if (category.className === 'aqi-badge-very-unhealthy') {
          color = '#ef4444';
        } else if (category.className === 'aqi-badge-hazardous') {
          color = '#7f1d1d';
        }
        
        // Draw circle for sensor
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, 2 * Math.PI);
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw sensor name
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(location.name, x, y + 30);
        
        // Draw AQI value
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(location.aqi.toString(), x, y + 4);
      });
    };
    
    // Simulate loading the map
    setTimeout(() => {
      simulateMap();
      setMapInitialized(true);
    }, 500);
    
    // Cleanup function for when the component unmounts or locations change
    return cleanupCanvas;
  }, [locations]);

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-base font-medium">Sensor Locations</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={mapRef} 
          className="w-full h-[300px] bg-muted rounded-md relative overflow-hidden"
        >
          {!mapInitialized && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-2"></span>
            <span className="text-xs">Good</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full inline-block mr-2"></span>
            <span className="text-xs">Moderate</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-orange-500 rounded-full inline-block mr-2"></span>
            <span className="text-xs">Unhealthy</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full inline-block mr-2"></span>
            <span className="text-xs">Very Unhealthy</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
