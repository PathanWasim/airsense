import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import Footer from "@/components/layout/Footer";
import { useDarkMode } from "@/hooks/useDarkMode";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        
        <div className="flex-1 flex flex-col">
          <MobileHeader 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode}
            mobileMenuOpen={mobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />
          
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <Router />
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
