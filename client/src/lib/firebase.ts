import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, DataSnapshot, set, update } from "firebase/database";
import { FirebaseAQIData } from "@/types";

// Firebase configuration 
const firebaseConfig = {
  apiKey: "AIzaSyDW-HrDIzPr3IBl5mp5-HocT440px65LP4",
  authDomain: "airsense-9c60e.firebaseapp.com",
  databaseURL: "https://airsense-9c60e-default-rtdb.firebaseio.com",
  projectId: "airsense-9c60e",
  storageBucket: "airsense-9c60e.firebasestorage.app",
  messagingSenderId: "518053970342",
  appId: "1:518053970342:web:1fec621c6581bd6f898f67",
  measurementId: "G-6HT7SMHLHB"
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
      loc1: { name: 'Downtown', lat: 34.0522, lng: -118.2437, aqi: 63 },
      loc2: { name: 'Westside', lat: 34.0211, lng: -118.4814, aqi: 42 },
      loc3: { name: 'Eastside', lat: 34.0505, lng: -118.0836, aqi: 75 },
      loc4: { name: 'North Valley', lat: 34.2364, lng: -118.5305, aqi: 38 },
      loc5: { name: 'South Bay', lat: 33.8847, lng: -118.4109, aqi: 51 }
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
      anom1: { 
        title: 'Sudden PM2.5 Spike', 
        description: 'Unexpected increase in PM2.5 levels detected in Downtown area. Possible causes include traffic congestion or construction activity.',
        timestamp: now - 1800000, 
        priority: 'high',
        zone: 'Downtown'
      },
      anom2: { 
        title: 'CO₂ Threshold Warning', 
        description: 'CO₂ levels trending upward in Westside industrial zone. Approaching regulatory threshold limits.',
        timestamp: now - 3600000, 
        priority: 'medium',
        zone: 'Westside'
      },
      anom3: { 
        title: 'Sensor Malfunction', 
        description: 'Temperature sensor at North Valley station reporting inconsistent values. Scheduled for maintenance.',
        timestamp: now - 86400000, 
        priority: 'low',
        zone: 'North Valley'
      },
      anom4: { 
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
    }
  };
  
  try {
    await writeData('/', sampleData);
    console.log('Sample data successfully populated in Firebase!');
    return Promise.resolve();
  } catch (error) {
    console.error('Error populating sample data:', error);
    return Promise.reject(error);
  }
}

export { database };
