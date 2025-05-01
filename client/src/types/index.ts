// Air Quality Data Types
export interface AQIData {
  value: number;
  unit: string;
  level: string;
  percentage: number;
}

export interface AQIParameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  level: string;
  percentage: number;
}

export interface SensorLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  level: string;
}

export interface ForecastItem {
  id: string;
  time: string;
  displayTime: string;
  aqi: number;
  level: string;
  relativeTime?: string;
}

export interface DayForecast {
  day: string;
  weather: string;
  weatherIcon: string;
  temperature: number;
  aqi: number;
  level: string;
}

export interface Anomaly {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  relativeTime: string;
  priority: "high" | "medium" | "low" | "resolved";
  zone: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  message: string;
  timestamp: number;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  icon: string;
  fileType: string;
}

// Firebase Data Structure
export interface FirebaseAQIData {
  parameters: {
    [key: string]: {
      value: number;
      unit: string;
    }
  };
  lastUpdated: number;
  locations: {
    [key: string]: {
      name: string;
      lat: number;
      lng: number;
      aqi: number;
    }
  };
  forecast: {
    hourly: {
      [key: string]: {
        time: string;
        aqi: number;
      }
    };
    daily: {
      [key: string]: {
        day: string;
        weather: string;
        temperature: number;
        aqi: number;
      }
    };
  };
  anomalies: {
    [key: string]: {
      title: string;
      description: string;
      timestamp: number;
      priority: string;
      zone: string;
    }
  };
  reports: {
    [key: string]: {
      title: string;
      description: string;
      date: string;
      type: string;
      fileType: string;
    }
  };
  anomalyAudit: {
    [parameter: string]: {
      lastAlert: number;
      count: number;
      currentStatus: string;
    }
  };
}
