import {
  users,
  type User,
  type InsertUser,
  type Parameter,
  type Location,
  type Anomaly,
  type Report,
  type Forecast,
  type Subscription,
  type Incident,
  type InsertSubscription,
  type InsertIncident
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getParameters(): Promise<Parameter[]>;
  getLocations(): Promise<Location[]>;
  getAnomalies(): Promise<Anomaly[]>;
  getReports(): Promise<Report[]>;
  getForecasts(): Promise<Forecast[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  createIncident(incident: InsertIncident): Promise<Incident>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private parameters: Parameter[];
  private locations: Location[];
  private anomalies: Anomaly[];
  private reports: Report[];
  private forecasts: Forecast[];
  private subscriptions: Map<number, Subscription>;
  private incidents: Map<number, Incident>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.subscriptions = new Map();
    this.incidents = new Map();
    this.currentId = 1;

    // Initialize with mock data
    this.parameters = [
      { id: 1, name: "PM2.5", value: 35, unit: "μg/m³", timestamp: new Date(), locationId: 1 },
      { id: 2, name: "PM10", value: 50, unit: "μg/m³", timestamp: new Date(), locationId: 1 },
      { id: 3, name: "CO2", value: 400, unit: "ppm", timestamp: new Date(), locationId: 1 },
    ];

    this.locations = [
      { id: 1, name: "Downtown", latitude: "40.7128", longitude: "-74.0060" },
      { id: 2, name: "Central Park", latitude: "40.7829", longitude: "-73.9654" },
    ];

    this.anomalies = [
      { id: 1, title: "High PM2.5 Levels", description: "PM2.5 levels exceeded safe limits", timestamp: new Date(), priority: "high", locationId: 1, zone: "Downtown" },
    ];

    this.reports = [
      { id: 1, title: "Daily Air Quality Report", description: "Comprehensive daily analysis", date: new Date().toISOString().split('T')[0], type: "report", fileType: "PDF" },
    ];

    this.forecasts = [
      { id: 1, locationId: 1, timestamp: new Date(), hourlyData: {}, dailyData: {} },
    ];
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getParameters(): Promise<Parameter[]> {
    return this.parameters;
  }

  async getLocations(): Promise<Location[]> {
    return this.locations;
  }

  async getAnomalies(): Promise<Anomaly[]> {
    return this.anomalies;
  }

  async getReports(): Promise<Report[]> {
    return this.reports;
  }

  async getForecasts(): Promise<Forecast[]> {
    return this.forecasts;
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentId++;
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      phone: insertSubscription.phone || null,
      highPollutionAlerts: insertSubscription.highPollutionAlerts || false,
      dailyForecasts: insertSubscription.dailyForecasts || false,
      anomalyDetections: insertSubscription.anomalyDetections || false,
      createdAt: new Date()
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const id = this.currentId++;
    const incident: Incident = {
      ...insertIncident,
      id,
      timestamp: new Date()
    };
    this.incidents.set(id, incident);
    return incident;
  }
}

export const storage = new MemStorage();
