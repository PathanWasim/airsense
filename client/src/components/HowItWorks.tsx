import { useEffect, useRef } from "react";
import { Plug, ArrowLeftRight, LineChart, Bell } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HowItWorks = () => {
  const progressRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const stepIconsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (progressRef.current && stepsRef.current) {
      // Set up the progress bar animation on scroll
      gsap.to(progressRef.current, {
        scrollTrigger: {
          trigger: stepsRef.current,
          start: "top center",
          end: "bottom center",
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress;
            
            // Update step icons based on progress
            stepIconsRef.current.forEach((icon, index) => {
              if (!icon) return;
              
              const thresholds = [0, 0.33, 0.66, 1];
              
              if (progress >= thresholds[index]) {
                icon.classList.add("bg-white", "text-white");
                icon.classList.remove("bg-white", "border-gray-200", "text-primary");
              } else {
                icon.classList.remove("bg-white", "text-white");
                icon.classList.add("bg-white", "border-gray-200", "text-primary");
              }
            });
          }
        },
        height: "100%",
        ease: "none"
      });
    }
  }, []);

  // Step data
  const steps = [
    {
      number: "01",
      title: "Install Sensors",
      description: "Place our compact, energy-efficient sensors in key locations throughout your space. The setup takes minutes with our guided installation app.",
      icon: <Plug />,
      image: "https://images.unsplash.com/photo-1585237017125-24baf8d7406f?auto=format&fit=crop&w=800&q=80",
      alt: "Installing sensors"
    },
    {
      number: "02",
      title: "Collect Data",
      description: "Sensors continuously gather air quality metrics and transmit them securely to our cloud platform, maintaining your privacy while ensuring data integrity.",
      icon: <ArrowLeftRight />,
      image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=80",
      alt: "Data collection process"
    },
    {
      number: "03",
      title: "Analyze Patterns",
      description: "Our AI algorithms process the data to identify patterns, detect anomalies, and generate insights about your air quality and potential improvement areas.",
      icon: <LineChart />,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      alt: "Data analysis dashboard"
    },
    {
      number: "04",
      title: "Get Notifications",
      description: "Receive timely alerts and recommendations via our mobile app or web dashboard when air quality changes or requires attention.",
      icon: <Bell />,
      image: "https://images.unsplash.com/photo-1484807352052-23338990c6c6?auto=format&fit=crop&w=800&q=80",
      alt: "Mobile phone with notifications"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4" data-animation="fade-up">
             <span className="text-primary">How It Works</span>
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto mb-6" data-animation="width"></div>
          <p className="max-w-2xl mx-auto text-gray-600" data-animation="fade-up-delay">
            A simple yet powerful process to monitor, analyze, and improve your air quality
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8" ref={stepsRef}>
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="step-card bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl" 
              data-animation="stagger-fade-up"
            >
              <div className="relative">
                <img 
                  src={step.image} 
                  alt={step.alt} 
                  className="w-full h-48 object-cover"
                />
                <div 
                  ref={el => stepIconsRef.current[index] = el}
                  className="absolute -bottom-6 left-6 w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center text-primary border-2 border-gray-100"
                >
                  {step.icon}
                </div>
              </div>
              
              <div className="p-6 pt-10">
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded mb-2">
                  Step {step.number}
                </div>
                <h3 className="text-xl font-semibold font-montserrat mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>

              <div className="px-6 pb-6">
                <div 
                  className="w-full h-1 bg-gray-100 rounded-full overflow-hidden"
                >
                  <div 
                    ref={progressRef} 
                    className="h-full bg-blue-600 transition-all duration-1000" 
                    style={{ width: `${(Number(step.number) / steps.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
