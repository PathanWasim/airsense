import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("Initializing");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  
  // Canvas animation for particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Reinitialize particles when canvas is resized
      initParticles();
    };
    
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < 100; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 1,
          speedY: (Math.random() - 0.5) * 1,
          color: i % 3 === 0 ? 'rgba(54, 179, 126, ' + (Math.random() * 0.5 + 0.2) + ')' : 
                 i % 3 === 1 ? 'rgba(59, 130, 246, ' + (Math.random() * 0.5 + 0.2) + ')' : 
                 'rgba(255, 255, 255, ' + (Math.random() * 0.5 + 0.2) + ')',
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    };
    
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.speedX;
        p.y += p.speedY;
        
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Connect nearby particles with lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distance = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(drawParticles);
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    drawParticles();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Loading animation and progress
  useEffect(() => {
    // Setup logo animations
    if (logoRef.current) {
      gsap.from(logoRef.current, {
        scale: 0.5,
        opacity: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)"
      });
    }
    
    // Simulate loading steps with different text
    const steps = [
      { text: "Initializing Environment", duration: 800 },
      { text: "Calibrating Air Quality Sensors", duration: 1000 },
      { text: "Establishing Network Connection", duration: 900 },
      { text: "Processing Environmental Data", duration: 1100 },
      { text: "Rendering Interface Components", duration: 800 },
      { text: "Almost Ready...", duration: 600 },
    ];

    let totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
    let currentStep = 0;
    let startTime = Date.now();
    let stepStartTime = startTime;

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const stepElapsed = now - stepStartTime;
      
      // Update text based on current step
      if (currentStep < steps.length && stepElapsed >= steps[currentStep].duration) {
        stepStartTime = now;
        currentStep++;
        if (currentStep < steps.length) {
          setText(steps[currentStep].text);
        }
      }
      
      // Calculate overall progress
      const newProgress = Math.min(100, Math.floor((elapsed / totalDuration) * 100));
      setProgress(newProgress);
      
      if (newProgress < 100) {
        requestAnimationFrame(updateProgress);
      } else {
        // Add a small delay before calling completion to allow final animation
        setTimeout(() => {
          // Fancy exit animation
          gsap.to(".loading-content", {
            y: -30,
            opacity: 0,
            duration: 0.6,
            ease: "power2.in"
          });
          
          gsap.to(".loading-screen", {
            opacity: 0,
            duration: 0.8,
            delay: 0.3,
            onComplete: onLoadingComplete
          });
        }, 400);
      }
    };
    
    requestAnimationFrame(updateProgress);
    
    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onLoadingComplete]);

  return (
    <div className="loading-screen fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.95), rgba(59, 130, 246, 0.8))',
      }}>
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-0 opacity-30"
      />
      
      <div className="loading-content relative z-10 text-center px-4">
        <div ref={logoRef} className="mb-12 transform-gpu">
          <div className="pulse-ring absolute -inset-4 rounded-full border-4 animate-ping opacity-75" style={{ borderColor: 'rgb(255, 255, 255)' }}></div>
          <div className="relative">
            <div className="absolute -inset-12 blur-3xl rounded-full animate-pulse" style={{ backgroundColor: 'rgb(21, 191, 209)' }}></div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 drop-shadow-lg">
              <span style={{ color: '#ffffff' }}>Air</span>Sense
            </h1>
          </div>
          <div className="mt-4 backdrop-blur-sm bg-white/10 px-6 py-3 rounded-full inline-block">
            <p className="text-white text-lg tracking-wide font-light">{text}</p>
          </div>
        </div>
        
        <div className="w-72 md:w-96 bg-white/10 h-2 rounded-full overflow-hidden mb-8 backdrop-blur-sm">
          <div 
            className="h-full transition-all ease-out duration-300 rounded-full"
            style={{ 
              background: 'linear-gradient(to right, rgba(54, 179, 126, 0.8), rgb(54, 179, 126))',
              width: `${progress}%` 
            }}

          ></div>
        </div>
        
        <div className="flex items-center justify-center gap-2 mb-4">
          {/* Multiple spinning circles with varying speeds */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 animate-spin" 
              style={{ 
                borderTopColor: '#36B37E',
                borderRightColor: 'rgba(255, 255, 255, 0.2)',
                borderBottomColor: 'rgba(255, 255, 255, 0.2)',
                borderLeftColor: 'rgba(255, 255, 255, 0.2)',
                animationDuration: '1s' 
              }}
            ></div>
            <div className="absolute inset-2 rounded-full border-4 animate-spin" 
              style={{ 
                borderRightColor: '#36B37E',
                borderLeftColor: 'rgba(255, 255, 255, 0.2)',
                borderTopColor: 'rgba(255, 255, 255, 0.2)',
                borderBottomColor: 'rgba(255, 255, 255, 0.2)',
                animationDuration: '1.5s',
                animationDirection: 'reverse'
              }}
            ></div>
            <div className="absolute inset-4 rounded-full border-4 animate-spin" 
              style={{ 
                borderBottomColor: '#36B37E',
                borderTopColor: 'rgba(255, 255, 255, 0.2)',
                borderLeftColor: 'rgba(255, 255, 255, 0.2)',
                borderRightColor: 'rgba(255, 255, 255, 0.2)',
                animationDuration: '2s'
              }}
            ></div>
            <div className="absolute inset-6 rounded-full backdrop-blur-sm flex items-center justify-center shadow-inner"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.8)' }}
            >
              <span className="text-xs font-mono text-white font-bold">{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;