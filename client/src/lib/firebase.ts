import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, DataSnapshot } from "firebase/database";

// Firebase configuration from environment variables
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

export { database };
