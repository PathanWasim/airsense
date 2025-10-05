import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, DataSnapshot, set, update, push, get } from "firebase/database";
import { FirebaseAQIData } from "@/types";

// Firebase configuration 
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || "airsense-9c60e.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || process.env.FIREBASE_DATABASE_URL || "https://airsense-9c60e-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "airsense-9c60e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || "airsense-9c60e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || "518053970342",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || "1:518053970342:web:1fec621c6581bd6f898f67",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID || "G-6HT7SMHLHB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


// Subscribe to data at a specific path
export function subscribeToData<T>(
  path: string,
  callback: (data: T | null) => void
): () => void {
  const dataRef = ref(database, path);

  const unsubscribe = onValue(dataRef, (snapshot: DataSnapshot) => {
    const data = snapshot.val() as T | null;
    callback(data);
  }, (error) => {
    console.error("Error subscribing to data:", error);
    callback(null);
  });

  return unsubscribe;
}


// Thresholds for automatic anomaly detection
export const THRESHOLDS = {
  pm25: 100, // μg/m³
  co2: 1000,  // ppm
  co: 30,     // ppm
  temperature: 35, // °C
  humidity: 85, // %
};

// Function to check for anomalies in live data
export const checkForAnomalies = async (liveData: any) => {
  if (!liveData) return;

  console.log("Checking for anomalies with thresholds:", THRESHOLDS);
  console.log("Current values:", {
    pm25: liveData.pm25.value,
    co2: liveData.co2.value,
    co: liveData.co.value,
    temperature: liveData.temperature.value,
    humidity: liveData.humidity.value
  });

  const anomalies = [];

  // Check PM2.5
  if (liveData.pm25.value > THRESHOLDS.pm25) {
    console.log(`PM2.5 anomaly detected: ${liveData.pm25.value} > ${THRESHOLDS.pm25}`);
    anomalies.push({
      title: 'High PM2.5 Level',
      priority: 'high',
      zone: 'Downtown',
      timestamp: new Date().toISOString(),
      description: `PM2.5 level (${liveData.pm25.value} μg/m³) has exceeded the threshold of ${THRESHOLDS.pm25} μg/m³.`,
    });
  }

  // Check CO2
  if (liveData.co2.value > THRESHOLDS.co2) {
    console.log(`CO2 anomaly detected: ${liveData.co2.value} > ${THRESHOLDS.co2}`);
    anomalies.push({

      timestamp: new Date().toISOString(),
      title: 'High CO2 Level',
      priority: 'high',
      zone: 'Downtown',
      description: `CO₂ level (${liveData.co2.value} ppm) has exceeded the threshold of ${THRESHOLDS.co2} ppm.`,
    });
  }

  // Check CO
  if (liveData.co.value > THRESHOLDS.co) {
    console.log(`CO anomaly detected: ${liveData.co.value} > ${THRESHOLDS.co}`);
    anomalies.push({

      timestamp: new Date().toISOString(),
      title: 'High CO Level',
      priority: 'high',
      zone: 'Downtown',
      description: `CO level (${liveData.co.value} ppm) has exceeded the threshold of ${THRESHOLDS.co} ppm.`,
    });
  }

  // Check Temperature
  if (liveData.temperature.value > THRESHOLDS.temperature) {
    console.log(`Temperature anomaly detected: ${liveData.temperature.value} > ${THRESHOLDS.temperature}`);
    anomalies.push({

      timestamp: new Date().toISOString(),
      title: 'High Temparature',
      priority: 'high',
      zone: 'Downtown',
      description: `Temperature (${liveData.temperature.value}°C) has exceeded the threshold of ${THRESHOLDS.temperature}°C.`,
    });
  }

  // Check Humidity
  if (liveData.humidity.value > THRESHOLDS.humidity) {
    console.log(`Humidity anomaly detected: ${liveData.humidity.value} > ${THRESHOLDS.humidity}`);
    anomalies.push({

      timestamp: new Date().toISOString(),
      title: 'High Humidity',
      priority: 'high',
      zone: 'Downtown',
      description: `Humidity (${liveData.humidity.value}%) has exceeded the threshold of ${THRESHOLDS.humidity}%.`,
    });
  }

  // If anomalies detected, add them to Firebase
  for (const anomaly of anomalies) {
    await addAnomaly(anomaly);
  }

  return anomalies.length > 0 ? anomalies : null;
};

// Function to add a new anomaly and maintain maximum of 10 anomalies (removing oldest)
export const addAnomaly = async (anomaly: any) => {
  try {
    const anomaliesRef = ref(database, 'anomalies');
    const snapshot = await get(anomaliesRef);
    const existingAnomalies = snapshot.val() || [];

    // Add new anomaly at the beginning
    const newAnomalies = [anomaly, ...existingAnomalies];

    // Keep only the 10 most recent anomalies
    if (newAnomalies.length > 10) {
      newAnomalies.length = 10;
    }

    console.log("Updated anomalies:", newAnomalies);

    // Update Firebase
    await set(anomaliesRef, newAnomalies);
    return true;
  } catch (error) {
    console.error("Error adding anomaly:", error);
    return false;
  }
};





// Write data to Firebase at a specific path
export function writeData(path: string, data: any): Promise<void> {
  const dataRef = ref(database, path);
  return set(dataRef, data);
}

// Update data at a specific path
export function updateData(path: string, data: any): Promise<void> {
  const dataRef = ref(database, path);
  return update(dataRef, data);
}

export const storage = {
  async getAnomalies() {
    return new Promise((resolve, reject) => {
      const anomaliesRef = ref(database, 'anomalies');
      onValue(anomaliesRef, (snapshot) => {
        resolve(snapshot.val());
      }, (error) => {
        reject(error);
      });
    });
  },

  async createAnomaly(id: string, data: any): Promise<void> {
    return writeData(`/anomalies/${id}`, data);
  },

  async removeAnomaly(id: string): Promise<void> {
    return writeData(`/anomalies/${id}`, null);
  }
};

// Generate sample AQI data for Firebase
export async function populateSampleData(): Promise<void> {
  const now = Date.now();

  const sampleData: FirebaseAQIData = {
    parameters: {
      pm25: { value: 35, unit: 'μg/m³' },
      pm10: { value: 42, unit: 'μg/m³' },
      co: { value: 1.2, unit: 'ppm' },
      co2: { value: 750, unit: 'ppm' },
      temperature: { value: 24, unit: '°C' },
      humidity: { value: 65, unit: '%' },
      no2: { value: 21, unit: 'ppb' },
      so2: { value: 8, unit: 'ppb' },
      o3: { value: 48, unit: 'ppb' }
    },
    lastUpdated: now,
    locations: {
      sensor1: { name: 'City Center', lat: 51.5074, lng: -0.1278, aqi: 85 },
      sensor2: { name: 'Industrial Zone', lat: 51.4934, lng: -0.1563, aqi: 120 },
      sensor3: { name: 'Residential Area', lat: 51.5226, lng: -0.1058, aqi: 45 }
    },
    forecast: {
      hourly: {
        '0': { time: new Date(now).toISOString(), aqi: 63 },
        '1': { time: new Date(now + 3600000).toISOString(), aqi: 58 },
        '2': { time: new Date(now + 7200000).toISOString(), aqi: 52 },
        '3': { time: new Date(now + 10800000).toISOString(), aqi: 47 },
        '4': { time: new Date(now + 14400000).toISOString(), aqi: 43 },
        '5': { time: new Date(now + 18000000).toISOString(), aqi: 41 },
        '6': { time: new Date(now + 21600000).toISOString(), aqi: 45 }
      },
      daily: {
        '0': { day: 'Today', weather: 'Sunny', temperature: 26, aqi: 63 },
        '1': { day: 'Tomorrow', weather: 'Cloudy', temperature: 24, aqi: 51 },
        '2': { day: 'Wednesday', weather: 'Rainy', temperature: 22, aqi: 38 },
        '3': { day: 'Thursday', weather: 'Cloudy', temperature: 23, aqi: 45 },
        '4': { day: 'Friday', weather: 'Sunny', temperature: 27, aqi: 58 }
      }
    },
    anomalies: {
      0: {
        title: 'Sudden PM2.5 Spike',
        description: 'Unexpected increase in PM2.5 levels detected in Downtown area. Possible causes include traffic congestion or construction activity.',
        timestamp: now - 1800000,
        priority: 'high',
        zone: 'Downtown'
      },
      1: {
        title: 'CO₂ Threshold Warning',
        description: 'CO₂ levels trending upward in Westside industrial zone. Approaching regulatory threshold limits.',
        timestamp: now - 3600000,
        priority: 'medium',
        zone: 'Westside'
      },
      2: {
        title: 'Sensor Malfunction',
        description: 'Temperature sensor at North Valley station reporting inconsistent values. Scheduled for maintenance.',
        timestamp: now - 86400000,
        priority: 'low',
        zone: 'North Valley'
      },
      3: {
        title: 'Calibration Complete',
        description: 'All sensors in Eastside monitoring station have been successfully calibrated.',
        timestamp: now - 172800000,
        priority: 'resolved',
        zone: 'Eastside'
      }
    },
    reports: {
      rep1: {
        title: 'Monthly Air Quality Summary',
        description: 'Comprehensive summary of air quality trends for the past month.',
        date: new Date(now - 604800000).toISOString().split('T')[0],
        type: 'Monthly Report',
        fileType: 'PDF'
      },
      rep2: {
        title: 'Annual Compliance Report',
        description: 'Detailed analysis of compliance with regulatory standards.',
        date: new Date(now - 2592000000).toISOString().split('T')[0],
        type: 'Annual Report',
        fileType: 'XLSX'
      },
      rep3: {
        title: 'PM2.5 Incident Analysis',
        description: 'Investigation report on recent PM2.5 exceedance incidents.',
        date: new Date(now - 1209600000).toISOString().split('T')[0],
        type: 'Incident Report',
        fileType: 'PDF'
      }
    },
    anomalyAudit: {
      auditId: {
        lastAlert: now,
        count: 0,
        currentStatus: 'active'
      },
      timestamp: {
        lastAlert: now,
        count: 0,
        currentStatus: 'active'
      },
      description: {
        lastAlert: now,
        count: 0,
        currentStatus: 'active'
      }
    }
  };

  const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const sensorLocations = [
    { id: "sensor1", name: "Main Entrance", lat: 37.7749, lng: -122.4194, aqi: randomNum(30, 150) },
    { id: "sensor2", name: "Production Zone", lat: 37.7848, lng: -122.4294, aqi: randomNum(30, 150) },
    { id: "sensor3", name: "Office Area", lat: 37.7649, lng: -122.4094, aqi: randomNum(30, 150) },
    { id: "sensor4", name: "Warehouse", lat: 37.7549, lng: -122.4494, aqi: randomNum(30, 150) },
    { id: "sensor5", name: "Outdoor", lat: 37.7949, lng: -122.3994, aqi: randomNum(30, 150) }
  ];





  try {
    await writeData('/', sampleData);
    await set(ref(database, 'sensorLocations'), sensorLocations);
    console.log('Sample data successfully populated in Firebase!');
    return Promise.resolve();
  } catch (error) {
    console.error('Error populating sample data:', error);
    return Promise.reject(error);
  }
}


export const getAqiCategory = (aqi: number): { label: string, className: string } => {
  if (aqi <= 50) {
    return { label: "Good", className: "aqi-badge-good" };
  } else if (aqi <= 100) {
    return { label: "Moderate", className: "aqi-badge-moderate" };
  } else if (aqi <= 150) {
    return { label: "Unhealthy for Sensitive Groups", className: "aqi-badge-unhealthy" };
  } else if (aqi <= 200) {
    return { label: "Unhealthy", className: "aqi-badge-unhealthy" };
  } else if (aqi <= 300) {
    return { label: "Very Unhealthy", className: "aqi-badge-very-unhealthy" };
  } else {
    return { label: "Hazardous", className: "aqi-badge-hazardous" };
  }
};

export { database };
