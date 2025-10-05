import { Cloud, Brain, SmartphoneCharging } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4" data-animation="fade-up">
             <span className="text-primary">About AirSense</span>
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-6" data-animation="width"></div>
          <p className="max-w-2xl mx-auto text-gray-600" data-animation="fade-up-delay">
            AirSense is a revolutionary IoT-powered air quality monitoring system that helps you understand, track, and improve the air you breathe. Using advanced sensors and artificial intelligence, we provide real-time insights about your environment.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8" data-animation="stagger">
          <div className="about-card p-6 bg-white rounded-xl shadow-md text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Cloud className="text-primary h-8 w-8" />
            </div>
            <h3 className="text-black font-semibold font-montserrat mb-2">Real-time Monitoring</h3>
            <p className="text-gray-600">Continuous tracking of air quality parameters including PM2.5, PM10, CO2, VOCs, and more with enterprise-grade sensors.</p>
          </div>
          
          <div className="about-card p-6 bg-white rounded-xl shadow-md text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Brain className="text-primary h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold font-montserrat mb-2">AI-Powered Analysis</h3>
            <p className="text-gray-600">Advanced algorithms that detect patterns, predict air quality changes, and provide personalized recommendations.</p>
          </div>
          
          <div className="about-card p-6 bg-white rounded-xl shadow-md text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <SmartphoneCharging className="text-primary h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold font-montserrat mb-2">Smart Notifications</h3>
            <p className="text-gray-600">Instant alerts when air quality changes, with actionable insights to help you maintain a healthy environment.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
