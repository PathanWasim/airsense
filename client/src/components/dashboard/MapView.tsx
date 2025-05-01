
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
    // Add Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);

    // Add Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    script.onload = () => {
      setIsLoading(true);
      loadMapData();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  const loadMapData = () => {
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
          initMap(formattedLocations);
        } catch (error) {
          console.error("Error processing location data:", error);
          setIsLoading(false);
        }
      }
    });

    return unsubscribe;
  };

  const initMap = (locations: SensorLocation[]) => {
    if (!mapContainerRef.current || !window.L) return;

    if (mapRef.current) {
      mapRef.current.remove();
    }

    const defaultLat = locations.length > 0 ? locations[0].lat : 51.5074;
    const defaultLng = locations.length > 0 ? locations[0].lng : -0.1278;

    const map = window.L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 13);
    mapRef.current = map;

    const isDark = document.documentElement.classList.contains('dark');
    const tileLayer = isDark 
      ? window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png')
      : window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    tileLayer.addTo(map);

    locations.forEach(loc => {
      const color = loc.level === 'good' ? '#10B981' 
                 : loc.level === 'moderate' ? '#FBBF24'
                 : loc.level === 'poor' ? '#F97316'
                 : loc.level === 'unhealthy' ? '#EF4444'
                 : loc.level === 'hazardous' ? '#991B1B'
                 : '#9CA3AF';

      const marker = window.L.circleMarker([loc.lat, loc.lng], {
        radius: 12,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      const popup = window.L.popup({
        maxWidth: 220,
        className: 'custom-popup'
      }).setContent(`
        <div class="p-2">
          <h3 class="font-semibold">${loc.name}</h3>
          <div class="mt-1">
            <span class="font-medium">AQI: ${loc.aqi}</span>
            <br/>
            <span class="text-sm">Status: ${getAQILevelText(loc.level)}</span>
          </div>
        </div>
      `);

      marker.bindPopup(popup);

      if (onLocationSelect) {
        marker.on('click', () => {
          onLocationSelect(loc.name);
        });
      }
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Sensor Locations</h2>
        {isLoading ? (
          <Skeleton className="w-full h-[400px] rounded-lg" />
        ) : (
          <div ref={mapContainerRef} className="w-full h-[400px] rounded-lg" />
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {['good', 'moderate', 'poor', 'unhealthy'].map((level) => (
            <div key={level} className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-1 ${
                level === 'good' ? 'bg-green-500' :
                level === 'moderate' ? 'bg-yellow-500' :
                level === 'poor' ? 'bg-orange-500' :
                'bg-red-500'
              }`} />
              <span className="text-sm capitalize">{level}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
