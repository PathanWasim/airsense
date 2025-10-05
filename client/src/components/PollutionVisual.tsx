import { useEffect, useRef, useState } from 'react';
import { Leaf, ArrowLeftRight, Wind, Activity } from 'lucide-react';

const PollutionVisual = () => {
  const [airQualityIndex, setAirQualityIndex] = useState(35);
  const pollutionContainerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const particleIntervalRef = useRef<number | null>(null);

  // Air quality colors
  const airQualityColors = {
    good: '#36B37E',       // Green (0-50)
    moderate: '#FBAD15',   // Yellow (51-100)
    unhealthy: '#F76254',  // Red (101-150)
    hazardous: '#7334E5'    // Purple (151+)
  };

  // Get color based on AQI
  const getColorFromAQI = (aqi: number) => {
    if (aqi <= 50) return airQualityColors.good;
    if (aqi <= 100) return airQualityColors.moderate;
    if (aqi <= 150) return airQualityColors.unhealthy;
    return airQualityColors.hazardous;
  };

  useEffect(() => {
    if (!particlesRef.current) return;

    // Function to create air quality particles
    const createParticle = () => {
      if (!particlesRef.current) return;
      
      const particle = document.createElement('div');
      
      // Random position and size
      const size = Math.random() * 8 + 4;
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      
      // Color based on air quality
      const randomFactor = Math.random() * 30 - 15; // ±15 to show variation
      const particleAQI = Math.max(0, Math.min(200, airQualityIndex + randomFactor));
      const color = getColorFromAQI(particleAQI);
      
      // Different opacity based on AQI
      const opacity = airQualityIndex > 100 ? 0.7 : 0.4;
      const particleOpacity = Math.random() * opacity + 0.1;
      
      // Set all styles at once for better performance
      Object.assign(particle.style, {
        position: 'absolute',
        left: `${left}%`,
        top: `${top}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: '50%',
        opacity: particleOpacity.toString(),
        transition: 'transform 4s ease-out'
      });
      
      particlesRef.current.appendChild(particle);
      
      // Animate the movement - needs to be separate to trigger the transition
      setTimeout(() => {
        const xMove = (Math.random() - 0.5) * 100;
        const yMove = (Math.random() - 0.5) * 100;
        particle.style.transform = `translate(${xMove}px, ${yMove}px)`;
      }, 10);
      
      // Remove after animation
      setTimeout(() => particle.remove(), 4000);
    };

    // Randomly change air quality for demo
    const changeAirQuality = () => {
      const randomAQI = Math.floor(Math.random() * 160) + 20;
      setAirQualityIndex(randomAQI);
    };

    // Update progress bar based on air quality
    if (progressRef.current) {
      progressRef.current.style.width = `${airQualityIndex / 2}%`;
      progressRef.current.style.backgroundColor = getColorFromAQI(airQualityIndex);
    }

    // Start animations
    particleIntervalRef.current = window.setInterval(createParticle, 300);
    const airQualityInterval = setInterval(changeAirQuality, 5000);

    // Cleanup
    return () => {
      if (particleIntervalRef.current) {
        clearInterval(particleIntervalRef.current);
      }
      clearInterval(airQualityInterval);
    };
  }, [airQualityIndex]);

  // Get air quality status text
  const getAirQualityStatus = (aqi: number) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy";
    return "Hazardous";
  };

  return (
    <div ref={pollutionContainerRef} className="pollution-container overflow-hidden rounded-2xl shadow-2xl h-full bg-gradient-to-r from-slate-900 to-blue-900">
      {/* Particles container */}
      <div ref={particlesRef} className="particles-container w-full h-full relative overflow-hidden">
        {/* Particles will be added here dynamically */}
      </div>
      
      {/* Info overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-8 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-white/70 uppercase tracking-wider mb-1">Real-time Air Quality</div>
            <div className="text-2xl font-bold text-white flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              <span>AQI: {airQualityIndex}</span>
            </div>
          </div>
          
          <div className="bg-black/30 px-4 py-2 rounded-lg">
            <div className="text-xs text-white/70 uppercase tracking-wider mb-1 text-right">Status</div>
            <div className="text-white font-semibold" style={{ color: getColorFromAQI(airQualityIndex) }}>
              {getAirQualityStatus(airQualityIndex)}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <Wind className="h-4 w-4" />
            <div className="text-sm">Particulate Matter: {Math.round(airQualityIndex * 0.8)} μg/m³</div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>CLEAN</span>
              <span>POLLUTED</span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                ref={progressRef} 
                className="h-full transition-all duration-1000" 
                style={{ width: `${airQualityIndex / 2}%`, backgroundColor: getColorFromAQI(airQualityIndex) }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Styles are applied using Tailwind and inline styles */}
    </div>
  );
};

export default PollutionVisual;
