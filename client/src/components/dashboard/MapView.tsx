import { useState, useEffect, useRef } from "react";
import { subscribeToData } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SensorLocation } from "@/types/index";
import { getAQILevel, getAQILevelText } from "@/lib/utils";

export default function MapView({ selectedLocation, onLocationSelect }) {
  const [locations, setLocations] = useState<SensorLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // 1) load Leaflet once
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";
    script.onload = loadMapData;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
      if (mapRef.current) mapRef.current.remove();
    };
  }, []);

  // 2) subscribe to your firebase data
  const loadMapData = () => {
    const unsub = subscribeToData<any>("locations", (data) => {
      if (!data) return;
      const formatted: SensorLocation[] = Object.entries(data).map(
        ([id, loc]: [string, any]) => ({
          id,
          name: loc.name,
          lat: loc.lat,
          lng: loc.lng,
          aqi: loc.aqi,
          level: getAQILevel(loc.aqi),
        }),
      );
      setLocations(formatted);
      setIsLoading(false);
    });
    return unsub;
  };

  // 3) once loading is done *and* the div is in the tree, init the map
  useEffect(() => {
    if (isLoading || !locations.length) return;

    // remove old map if exists
    if (mapRef.current) mapRef.current.remove();

    // default center
    const { lat, lng } = locations[0];
    const L = window.L;
    const map = L.map(mapContainerRef.current).setView([lat, lng], 13);
    mapRef.current = map;

    const isDark = document.documentElement.classList.contains("dark");
    const tiles = isDark
      ? L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        )
      : L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");

    tiles.addTo(map);

    // add your circleMarkers + popups
    locations.forEach((loc) => {
      const color =
        loc.level === "good"
          ? "#10B981"
          : loc.level === "moderate"
            ? "#FBBF24"
            : loc.level === "poor"
              ? "#F97316"
              : loc.level === "unhealthy"
                ? "#EF4444"
                : "#9CA3AF";

      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 12,
        fillColor: color,
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map);

      marker.bindPopup(
        `<div class="p-2">
           <h3 class="font-semibold">${loc.name}</h3>
           <div class="mt-1">
             <span class="font-medium">AQI: ${loc.aqi}</span><br/>
             <span class="text-sm">Status: ${getAQILevelText(loc.level)}</span>
           </div>
         </div>`,
      );

      onLocationSelect && marker.on("click", () => onLocationSelect(loc.name));
    });

    // **this is the key**: let Leaflet recalc its tiles
    map.invalidateSize();
  }, [isLoading, locations, onLocationSelect]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Sensor Locations</h2>
        {isLoading ? (
          <Skeleton className="w-full h-[400px] rounded-lg" />
        ) : (
          <div
            ref={mapContainerRef}
            className="w-full h-[400px] rounded-lg"
            style={{ zIndex: 0 }}
          />
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {["good", "moderate", "poor", "unhealthy"].map((level) => (
            <div key={level} className="flex items-center">
              <span
                className={`w-3 h-3 rounded-full mr-1 ${
                  level === "good"
                    ? "bg-green-500"
                    : level === "moderate"
                      ? "bg-yellow-500"
                      : level === "poor"
                        ? "bg-orange-500"
                        : "bg-red-500"
                }`}
              />
              <span className="text-sm capitalize">{level}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
