import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import ParticleCanvas from "./ParticleCanvas";
import PollutionVisual from "./PollutionVisual";
import { ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { TypeAnimation } from "react-type-animation";

const Hero = () => {
  const heroContentRef = useRef<HTMLDivElement>(null);
  const heroVisualRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial animations
    if (heroContentRef.current && heroVisualRef.current && chevronRef.current) {
      gsap.from(heroContentRef.current, {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power3.out"
      });
      
      gsap.from(heroVisualRef.current, {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power3.out",
        delay: 0.3
      });
      
      gsap.to(chevronRef.current, {
        y: 10,
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: "power1.inOut"
      });
    }
  }, []);

  return (
    <section id="home" className="min-h-screen relative flex items-center justify-center overflow-hidden bg-white">
      <ParticleCanvas />
      <div className="container mx-auto px-4 py-20 pt-32 relative z-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div ref={heroContentRef} className="hero-content" data-animation="fade-right">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-montserrat leading-tight mb-4">
              <span className="text-black">AirSense</span>
              <span className="block" style={{ color: '#3B82F6' }}>
                <TypeAnimation
                  sequence={[
                    'Breathe Smart. Live Safe.',
                    2000,
                    'Monitor. Analyze. Breathe.',
                    2000,
                    'Clean Air. Healthy Life.',
                    2000
                  ]}
                  wrapper="span"
                  speed={40}
                  style={{ display: 'inline-block' }}
                  repeat={Infinity}
                  cursor={true}
                />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Real-time Air Quality Monitoring using IoT and AI
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="default"
                className="text-white px-8 py-6 h-auto rounded-full font-medium transition-all text-center hover:bg-blue-500"
                style={{
                  backgroundColor: '#3B82F6'
                }}
              >
                Explore Dashboard
              </Button>
              <Button 
                variant="outline"
                className="bg-white border-2 px-8 py-6 h-auto rounded-full font-medium transition-all text-center hover:bg-blue-500 hover:text-white"
                style={{
                  borderColor: '#3B82F6',
                  color: '#0000ff'
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
          
          <div ref={heroVisualRef} className="hero-visual relative h-96" data-animation="fade-left">
            <PollutionVisual />
          </div>
        </div>
      </div>
      
      <div ref={chevronRef} className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-center">
        <a href="#about" style={{ color: '#3B82F6' }}>
          <ChevronDown className="h-8 w-8" />
        </a>
      </div>
    </section>
  );
};

export default Hero;
