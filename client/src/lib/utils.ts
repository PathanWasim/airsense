import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type AQILevel = "good" | "moderate" | "poor" | "unhealthy" | "hazardous";

export function getAQILevel(value: number): AQILevel {
  if (value <= 40) return "good";
  if (value <= 80) return "moderate";
  if (value <= 120) return "poor";
  if (value <= 180) return "unhealthy";
  return "hazardous";
}

export function getAQIColor(level: AQILevel): string {
  switch (level) {
    case "good":
      return "bg-aqi-good text-green-800 dark:text-green-300 dark:bg-green-900/40";
    case "moderate":
      return "bg-aqi-moderate text-yellow-800 dark:text-yellow-300 dark:bg-yellow-900/40";
    case "poor":
      return "bg-aqi-poor text-orange-800 dark:text-orange-300 dark:bg-orange-900/40";
    case "unhealthy":
      return "bg-aqi-unhealthy text-red-800 dark:text-red-300 dark:bg-red-900/40";
    case "hazardous":
      return "bg-aqi-hazardous text-red-100 dark:text-red-200 dark:bg-red-900/60";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  }
}

export function getAQIBarColor(level: AQILevel): string {
  switch (level) {
    case "good":
      return "bg-aqi-good";
    case "moderate":
      return "bg-aqi-moderate";
    case "poor":
      return "bg-aqi-poor";
    case "unhealthy":
      return "bg-aqi-unhealthy";
    case "hazardous":
      return "bg-aqi-hazardous";
    default:
      return "bg-gray-400";
  }
}

export function getAQILevelText(level: AQILevel): string {
  switch (level) {
    case "good":
      return "Good";
    case "moderate":
      return "Moderate";
    case "poor":
      return "Poor";
    case "unhealthy":
      return "Unhealthy";
    case "hazardous":
      return "Hazardous";
    default:
      return "Unknown";
  }
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}
