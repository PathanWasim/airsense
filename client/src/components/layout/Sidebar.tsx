import { Link, useLocation } from "wouter";

interface SidebarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export default function Sidebar({ isDarkMode, toggleDarkMode }: SidebarProps) {
  const [location] = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar dark:bg-sidebar shadow-md">
      <div className="p-4 border-b dark:border-sidebar-border">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-sidebar-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h1 className="ml-2 text-xl font-bold text-sidebar-foreground">AirSense</h1>
        </div>
      </div>
      
      <nav className="flex-1 py-4 px-2">
        <Link href="/home">
          <a className={`flex items-center px-4 py-3 mb-2 rounded-lg ${location === "/home" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
            <span className="material-icons mr-3">dashboard</span>
            <span>Home</span>
          </a>
        </Link>
        <Link href="/live-data">
          <a className={`flex items-center px-4 py-3 mb-2 rounded-lg ${location === "/live-data" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
            <span className="material-icons mr-3">satellite_alt</span>
            <span>Live Data</span>
          </a>
        </Link>
        <Link href="/forecast">
          <a className={`flex items-center px-4 py-3 mb-2 rounded-lg ${location === "/forecast" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
            <span className="material-icons mr-3">trending_up</span>
            <span>Forecast</span>
          </a>
        </Link>
        <Link href="/anomalies">
          <a className={`flex items-center px-4 py-3 mb-2 rounded-lg ${location === "/anomalies" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
            <span className="material-icons mr-3">warning</span>
            <span>Anomalies</span>
          </a>
        </Link>
        <Link href="/reports">
          <a className={`flex items-center px-4 py-3 mb-2 rounded-lg ${location === "/reports" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
            <span className="material-icons mr-3">bar_chart</span>
            <span>Reports</span>
          </a>
        </Link>
        <Link href="/ai-assistant">
          <a className={`flex items-center px-4 py-3 mb-2 rounded-lg ${location === "/ai-assistant" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
            <span className="material-icons mr-3">smart_toy</span>
            <span>AI Assistant</span>
          </a>
        </Link>
        <Link href="/about">
          <a className={`flex items-center px-4 py-3 mb-2 rounded-lg ${location === "/about" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>
            <span className="material-icons mr-3">info</span>
            <span>About</span>
          </a>
        </Link>
      </nav>
      
      <div className="p-4 border-t dark:border-sidebar-border">
        <button 
          onClick={toggleDarkMode}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <span className={`material-icons mr-2 ${isDarkMode ? "hidden" : ""}`}>dark_mode</span>
          <span className={`material-icons mr-2 ${isDarkMode ? "" : "hidden"}`}>light_mode</span>
          <span className={isDarkMode ? "hidden" : ""}>Dark Mode</span>
          <span className={isDarkMode ? "" : "hidden"}>Light Mode</span>
        </button>
      </div>
    </aside>
  );
}
