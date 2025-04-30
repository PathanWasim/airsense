import { useState, useEffect } from 'react';

export function useDarkMode() {
  // Check if user has previously set a preference
  const savedDarkMode = localStorage.getItem('darkMode');
  
  // Initialize state based on user preference or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (savedDarkMode) {
      return savedDarkMode === 'enabled';
    }
    // Check for system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply dark mode to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return {
    isDarkMode,
    toggleDarkMode
  };
}
