import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home1";
import Home1 from "@/pages/Home";
import LiveData from "@/pages/LiveData";
import ForecastPage from "@/pages/ForecastPage";
import AnomaliesPage from "@/pages/AnomaliesPage";
import ReportsPage from "@/pages/ReportsPage";
import AIAssistantPage from "@/pages/AIAssistantPage";
import AboutPage from "@/pages/AboutPage";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import Footer from "@/components/layout/Footer";
import { useDarkMode } from "@/hooks/useDarkMode";
import DataInitializer from "@/components/DataInitializer";
import 'leaflet/dist/leaflet.css';
import { useLocation } from "wouter";


import { AuthProvider } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function Router() {
  return (
    <>
      
      <Switch>
        <Route path="/" component={Home1} />
        <Route path="/home" component={Home} />
        <Route path="/live-data" component={LiveData} />
        <Route path="/forecast" component={ForecastPage} />
        <Route path="/anomalies" component={AnomaliesPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/ai-assistant" component={AIAssistantPage} />
        <Route path="/about" component={AboutPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

const queryClient = new QueryClient();



function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setHasLoadedOnce(true);
  };

  const [location] = useLocation();

  useEffect(() => {
    // Only trigger loading once at the root route
    if (location === "/" && !hasLoadedOnce) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [location]);
  

const isDashboardRoute = [
  "/home",
  "/live-data",
  "/forecast",
  "/anomalies",
  "/reports",
  "/ai-assistant",
  "/about"
].some((path) => location.startsWith(path));


  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);

    
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
       <TooltipProvider>
          <Toaster />
          {isLoading ? (
            <LoadingScreen onLoadingComplete={handleLoadingComplete} />
          ) : isDashboardRoute ? (
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
                  <DataInitializer />
                    <Router />
                  </div>
                </main>
                <Footer />
              </div>
            </div>
          ) : (
            <Router /> 
          )}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
