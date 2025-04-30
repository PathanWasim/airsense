import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// AQI parameters
export const parameters = pgTable("parameters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: integer("value").notNull(),
  unit: text("unit").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  locationId: integer("location_id").notNull(),
});

// Locations
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
});

// Anomalies
export const anomalies = pgTable("anomalies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  priority: text("priority").notNull(), // high, medium, low, resolved
  locationId: integer("location_id").notNull(),
  zone: text("zone").notNull(),
});

// Reports
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  type: text("type").notNull(), // report, data, anomaly
  fileType: text("file_type").notNull(), // PDF, CSV, etc.
});

// Forecasts
export const forecasts = pgTable("forecasts", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  hourlyData: json("hourly_data").notNull(),
  dailyData: json("daily_data").notNull(),
});

// Alert Subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  phone: text("phone"),
  highPollutionAlerts: boolean("high_pollution_alerts").default(false),
  dailyForecasts: boolean("daily_forecasts").default(false),
  anomalyDetections: boolean("anomaly_detections").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reported Incidents
export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  incidentType: text("incident_type").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertParameterSchema = createInsertSchema(parameters).omit({
  id: true,
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
});

export const insertAnomalySchema = createInsertSchema(anomalies).omit({
  id: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
});

export const insertForecastSchema = createInsertSchema(forecasts).omit({
  id: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  timestamp: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertParameter = z.infer<typeof insertParameterSchema>;
export type Parameter = typeof parameters.$inferSelect;

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;

export type InsertAnomaly = z.infer<typeof insertAnomalySchema>;
export type Anomaly = typeof anomalies.$inferSelect;

export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export type InsertForecast = z.infer<typeof insertForecastSchema>;
export type Forecast = typeof forecasts.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertIncident = z.infer<typeof insertIncidentSchema>;
export type Incident = typeof incidents.$inferSelect;
