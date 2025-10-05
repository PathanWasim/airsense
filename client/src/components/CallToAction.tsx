import { Button } from "@/components/ui/button";

const CallToAction = () => {
  return (
    <section className="py-20 bg-primary text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-montserrat mb-6" data-animation="fade-up">
          Ready to Breathe Cleaner Air?
        </h2>
        <p className="max-w-2xl mx-auto mb-8 opacity-90" data-animation="fade-up-delay">
          Join thousands of satisfied users who have transformed their living and working environments with AirSense.
        </p>
        <div className="flex flex-wrap justify-center gap-4" data-animation="fade-up-delay-more">
          <Button
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90 px-8 py-4 h-auto rounded-full font-medium transition-all"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started Now
          </Button>
          <Button
            variant="outline"
            className="border-2 border-white hover:bg-white hover:text-primary px-8 py-4 h-auto rounded-full font-medium transition-all text-white"
          >
            View Demo Dashboard
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
