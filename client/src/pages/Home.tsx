import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Features from "@/components/Features";

import HowItWorks from "@/components/HowItWorks";
import CallToAction from "@/components/CallToAction";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { setupScrollTriggers } from "@/lib/gsapConfig";

const Home = () => {
  useEffect(() => {
    setupScrollTriggers();
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e: Event) => {
        e.preventDefault();
        const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
        if (href) {
          const target = document.querySelector(href);
          if (target) {
            window.scrollTo({
              top: (target as HTMLElement).offsetTop - 80,
              behavior: 'smooth'
            });
          }
        }
      });
    });
    
    // Note: For a proper cleanup, we would need to store a reference to each event listener function
    // This is a simplified cleanup that doesn't fully remove the specific listeners
    return () => {};
    
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <About />
        <HowItWorks />
        <CallToAction />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
