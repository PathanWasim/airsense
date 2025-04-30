import { useState, useEffect, useRef } from "react";
import { subscribeToData } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SensorLocation } from "@/types/index";
import { getAQILevel, getAQILevelText } from "@/lib/utils";

interface MapViewProps {
  selectedLocation: string;
  onLocationSelect?: (location: string) => void;
}

export default function MapView({ selectedLocation, onLocationSelect }: MapViewProps) {
  const [locations, setLocations] = useState<SensorLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    
    const unsubscribe = subscribeToData<any>('locations', (data) => {
      if (data) {
        try {
          const formattedLocations = Object.entries(data).map(([id, loc]: [string, any]) => {
            const level = getAQILevel(loc.aqi);
            
            return {
              id,
              name: loc.name,
              lat: loc.lat,
              lng: loc.lng,
              aqi: loc.aqi,
              level
            };
          });
          
          setLocations(formattedLocations);
          setIsLoading(false);
          
          // Initialize map after we have the data
          initMap(formattedLocations);
        } catch (error) {
          console.error("Error processing location data:", error);
          setIsLoading(false);
        }
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const initMap = (locations: SensorLocation[]) => {
    if (!mapContainerRef.current) return;
    
    // Check if Leaflet is available (it should be loaded via CDN)
    if (typeof window.L !== 'undefined') {
      // Clear existing map if any
      if (mapRef.current) {
        mapRef.current.remove();
      }
      
      // Default to central location or first sensor location
      const defaultLat = locations.length > 0 ? locations[0].lat : 51.505;
      const defaultLng = locations.length > 0 ? locations[0].lng : -0.09;

      // Create the map
      const map = window.L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 13);
      mapRef.current = map;
      
      // Use different tile layers based on theme
      const isDark = document.documentElement.classList.contains('dark');
      const tileLayer = isDark 
        ? window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')
        : window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
        
      tileLayer.addTo(map);
      
      // Add markers for each location
      locations.forEach(loc => {
        let color;
        switch (loc.level) {
          case 'good':
            color = '#10B981'; // green
            break;
          case 'moderate':
            color = '#FBBF24'; // yellow
            break;
          case 'poor':
            color = '#F97316'; // orange
            break;
          case 'unhealthy':
            color = '#EF4444'; // red
            break;
          case 'hazardous':
            color = '#991B1B'; // dark red
            break;
          default:
            color = '#9CA3AF'; // gray
        }
        
        const marker = window.L.circleMarker([loc.lat, loc.lng], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map);
        
        marker.bindPopup(`
          <div class="text-sm">
            <strong>${loc.name}</strong><br>
            AQI: ${loc.aqi}<br>
            Status: ${getAQILevelText(loc.level as any)}
          </div>
        `);
        
        // Optional: click handler to select this location
        if (onLocationSelect) {
          marker.on('click', () => {
            onLocationSelect(loc.name);
          });
        }
      });
    }
  };

  // Add L to window type
  declare global {
    interface Window {
      L: any;
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Sensor Locations</h2>
      </div>
      <CardContent className="p-4">
        {isLoading ? (
          <Skeleton className="w-full h-80 rounded-lg" />
        ) : (
          <div ref={mapContainerRef} className="w-full h-80 rounded-lg bg-gray-100 dark:bg-gray-700" />
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
            Good
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <span className="w-2 h-2 mr-1 bg-yellow-500 rounded-full"></span>
            Moderate
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
            <span className="w-2 h-2 mr-1 bg-orange-500 rounded-full"></span>
            Poor
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <span className="w-2 h-2 mr-1 bg-red-500 rounded-full"></span>
            Unhealthy
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
