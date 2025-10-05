import { Cpu, Database, Brain, ThermometerSnowflake } from "lucide-react";
import { FaPython } from "react-icons/fa";

const TechStack = () => {
  return (
    <section id="tech" className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-4" data-animation="fade-up">
            Technology <span className="text-primary">Stack</span>
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto mb-6" data-animation="width"></div>
          <p className="max-w-2xl mx-auto text-gray-600" data-animation="fade-up-delay">
            Built on cutting-edge technologies that ensure reliability, scalability, and precision.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10" data-animation="stagger-icons">
          {/* IoT Sensors */}
          <div className="tech-icon bg-white p-10 rounded-xl shadow-xl text-center flex flex-col items-center transition-all hover:-translate-y-2 hover:shadow-2xl border-t-4 border-primary">
            <div className="w-28 h-28 flex items-center justify-center mb-6 bg-primary/5 rounded-full p-6">
              <Cpu className="text-5xl text-primary" />
            </div>
            <h3 className="text-2xl font-semibold font-montserrat mb-4">IoT Sensors</h3>
            <p className="text-base text-gray-600">High-precision environmental sensors</p>
          </div>
          
          {/* Firebase */}
          <div className="tech-icon bg-white p-10 rounded-xl shadow-xl text-center flex flex-col items-center transition-all hover:-translate-y-2 hover:shadow-2xl border-t-4 border-primary">
            <div className="w-28 h-28 flex items-center justify-center mb-6 bg-primary/5 rounded-full p-6">
              <Database className="text-5xl text-primary" />
            </div>
            <h3 className="text-2xl font-semibold font-montserrat mb-4">Firebase</h3>
            <p className="text-base text-gray-600">Cloud database and authentication</p>
          </div>
          
          {/* OpenAI */}
          <div className="tech-icon bg-white p-10 rounded-xl shadow-xl text-center flex flex-col items-center transition-all hover:-translate-y-2 hover:shadow-2xl border-t-4 border-primary">
            <div className="w-28 h-28 flex items-center justify-center mb-6 bg-primary/5 rounded-full p-6">
              <Brain className="text-5xl text-primary" />
            </div>
            <h3 className="text-2xl font-semibold font-montserrat mb-4">OpenAI</h3>
            <p className="text-base text-gray-600">Advanced predictive analytics</p>
          </div>
          
          {/* Python */}
          <div className="tech-icon bg-white p-10 rounded-xl shadow-xl text-center flex flex-col items-center transition-all hover:-translate-y-2 hover:shadow-2xl border-t-4 border-primary">
            <div className="w-28 h-28 flex items-center justify-center mb-6 bg-primary/5 rounded-full p-6">
              <FaPython className="text-5xl text-primary" />
            </div>
            <h3 className="text-2xl font-semibold font-montserrat mb-4">Python</h3>
            <p className="text-base text-gray-600">Backend processing and ML models</p>
          </div>
          
          {/* DHT22 & MQ */}
          <div className="tech-icon bg-white p-10 rounded-xl shadow-xl text-center flex flex-col items-center transition-all hover:-translate-y-2 hover:shadow-2xl border-t-4 border-primary">
            <div className="w-28 h-28 flex items-center justify-center mb-6 bg-primary/5 rounded-full p-6">
              <ThermometerSnowflake className="text-5xl text-primary" />
            </div>
            <h3 className="text-2xl font-semibold font-montserrat mb-4">DHT22 & MQ</h3>
            <p className="text-base text-gray-600">Professional-grade sensors</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
