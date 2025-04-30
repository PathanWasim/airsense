import { Link, useLocation } from "wouter";

interface MobileHeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export default function MobileHeader({ 
  isDarkMode, 
  toggleDarkMode, 
  mobileMenuOpen, 
  toggleMobileMenu 
}: MobileHeaderProps) {
  const [location] = useLocation();

  return (
    <header className="md:hidden bg-white dark:bg-gray-800 shadow-sm z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <button 
            onClick={toggleMobileMenu}
            className="mr-2 text-gray-600 dark:text-gray-300"
          >
            <span className="material-icons">menu</span>
          </button>
          <Link href="/">
            <a className="flex items-center">
              <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h1 className="ml-2 text-lg font-bold">AirSense</h1>
            </a>
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleDarkMode}
            className="text-gray-600 dark:text-gray-300"
          >
            <span className={`material-icons ${isDarkMode ? "hidden" : ""}`}>dark_mode</span>
            <span className={`material-icons ${isDarkMode ? "" : "hidden"}`}>light_mode</span>
          </button>
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      <div className={`${mobileMenuOpen ? "" : "hidden"} bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-2`}>
        <nav className="space-y-2">
          <Link href="/">
            <a className={`flex items-center px-4 py-2 rounded-md ${location === "/" ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
              <span className="material-icons mr-3">dashboard</span>
              <span>Home</span>
            </a>
          </Link>
          <Link href="/live-data">
            <a className={`flex items-center px-4 py-2 rounded-md ${location === "/live-data" ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
              <span className="material-icons mr-3">satellite_alt</span>
              <span>Live Data</span>
            </a>
          </Link>
          <Link href="/forecast">
            <a className={`flex items-center px-4 py-2 rounded-md ${location === "/forecast" ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
              <span className="material-icons mr-3">trending_up</span>
              <span>Forecast</span>
            </a>
          </Link>
          <Link href="/anomalies">
            <a className={`flex items-center px-4 py-2 rounded-md ${location === "/anomalies" ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
              <span className="material-icons mr-3">warning</span>
              <span>Anomalies</span>
            </a>
          </Link>
          <Link href="/reports">
            <a className={`flex items-center px-4 py-2 rounded-md ${location === "/reports" ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
              <span className="material-icons mr-3">bar_chart</span>
              <span>Reports</span>
            </a>
          </Link>
          <Link href="/ai-assistant">
            <a className={`flex items-center px-4 py-2 rounded-md ${location === "/ai-assistant" ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
              <span className="material-icons mr-3">smart_toy</span>
              <span>AI Assistant</span>
            </a>
          </Link>
          <Link href="/about">
            <a className={`flex items-center px-4 py-2 rounded-md ${location === "/about" ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
              <span className="material-icons mr-3">info</span>
              <span>About</span>
            </a>
          </Link>
        </nav>
      </div>
    </header>
  );
}
