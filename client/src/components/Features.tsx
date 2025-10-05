import { ArrowRight } from "lucide-react";

interface FeatureCard {
  title: string;
  description: string;
  image: string;
  tag?: {
    text: string;
    bgColor: string;
  };
}

const Features = () => {
  const features: FeatureCard[] = [
    {
      title: "Real-time Monitoring",
      description: "Get instant updates on air quality metrics with our advanced sensor network. Monitor PM2.5, PM10, CO2, VOCs, temperature, and humidity.",
      image: "https://images.unsplash.com/photo-1580569214296-5cf2462363d7?auto=format&fit=crop&w=800&q=80",
      tag: {
        text: "CORE",
        bgColor: "bg-accent"
      }
    },
    {
      title: "AI Forecasting",
      description: "Predictive analytics powered by machine learning algorithms that forecast air quality changes based on historical data and environmental factors.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      tag: {
        text: "PREMIUM",
        bgColor: "bg-primary"
      }
    },
    {
      title: "Anomaly Alerts",
      description: "Receive timely notifications when air quality deviates from normal patterns, with customizable thresholds and notification preferences.",
      image: "https://images.unsplash.com/photo-1611095566888-f1446042c8fc?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Firebase-powered",
      description: "Cloud-backed infrastructure ensures your data is securely stored, always accessible, and seamlessly synchronized across all your devices.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
      tag: {
        text: "PREMIUM",
        bgColor: "bg-primary"
      }
    },
    {
      title: "Smart Dashboards",
      description: "Intuitive visualization tools that transform complex data into actionable insights with customizable widgets and reporting features.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Multi-device Sync",
      description: "Access your air quality data from any device – smartphone, tablet, or computer – with perfect synchronization across platforms.",
      image: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-b from-secondary to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4" data-animation="fade-up">
            Key <span className="text-primary">Features</span>
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto mb-6" data-animation="width"></div>
          <p className="max-w-2xl mx-auto text-gray-600" data-animation="fade-up-delay">
            Our comprehensive platform combines cutting-edge hardware with sophisticated software to deliver a complete air quality management solution.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-animation="stagger-cards">
          {features.map((feature, index) => (
            <div key={index} className="feature-card bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:-translate-y-2 hover:shadow-xl">
              <div className="h-40 bg-primary/10 relative">
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="w-full h-full object-cover"
                />
                {feature.tag && (
                  <div className={`absolute top-4 right-4 ${feature.tag.bgColor} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                    {feature.tag.text}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold font-montserrat mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <div className="flex items-center text-primary font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
