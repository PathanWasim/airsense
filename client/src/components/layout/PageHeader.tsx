import { useState } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  selectedLocation: string;
  onLocationChange?: (location: string) => void;
  onRefresh?: () => void;
  locations?: string[];
}

export default function PageHeader({
  title,
  description,
  selectedLocation,
  onLocationChange,
  onRefresh,
  locations = ["City Center", "Industrial Zone", "Residential Area", "Commercial District"],
}: PageHeaderProps) {
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  const handleLocationSelect = (location: string) => {
    if (onLocationChange) {
      onLocationChange(location);
    }
    setIsLocationDropdownOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
      <div className="flex items-center mt-4 md:mt-0 space-x-2">
        <div className="relative">
          <button 
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
            onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
          >
            <span className="flex items-center">
              <span className="material-icons text-sm mr-1">place</span>
              <span>{selectedLocation}</span>
              <span className="material-icons text-sm ml-1">arrow_drop_down</span>
            </span>
          </button>
          
          {isLocationDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {locations.map((location) => (
                  <button
                    key={location}
                    className={`${
                      location === selectedLocation
                        ? "bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-200"
                    } group flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600`}
                    onClick={() => handleLocationSelect(location)}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button 
          className="flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
          onClick={onRefresh}
        >
          <span className="material-icons text-sm mr-1">refresh</span>
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
}
