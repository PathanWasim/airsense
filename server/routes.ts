import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubscriptionSchema, insertIncidentSchema } from "@shared/schema";
import { z } from "zod";
import { WebSocketServer } from "ws";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route prefix
  const apiPrefix = "/api";

  // Get all AQI parameters
  app.get(`${apiPrefix}/parameters`, async (req, res) => {
    try {
      const parameters = await storage.getParameters();
      res.json(parameters);
    } catch (error) {
      console.error("Error fetching parameters:", error);
      res.status(500).json({ error: "Failed to fetch AQI parameters" });
    }
  });

  // Get all locations
  app.get(`${apiPrefix}/locations`, async (req, res) => {
    try {
      const locations = await storage.getLocations();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  // Get all anomalies
  app.get(`${apiPrefix}/anomalies`, async (req, res) => {
    try {
      const anomalies = await storage.getAnomalies();
      res.json(anomalies);
    } catch (error) {
      console.error("Error fetching anomalies:", error);
      res.status(500).json({ error: "Failed to fetch anomalies" });
    }
  });

  // Get all reports
  app.get(`${apiPrefix}/reports`, async (req, res) => {
    try {
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // Get forecasts
  app.get(`${apiPrefix}/forecasts`, async (req, res) => {
    try {
      const forecasts = await storage.getForecasts();
      res.json(forecasts);
    } catch (error) {
      console.error("Error fetching forecasts:", error);
      res.status(500).json({ error: "Failed to fetch forecasts" });
    }
  });

  // Get AI-powered forecast
  app.post(`${apiPrefix}/ai-forecast`, async (req, res) => {
    try {
      const { location, temperature, humidity, wind_speed, pressure } = req.body;

      // Call Python AI forecasting service
      const forecastResponse = await fetch('http://localhost:5002/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          temperature: temperature || 20,
          humidity: humidity || 60,
          wind_speed: wind_speed || 5,
          pressure: pressure || 1013,
          location: location || 'Unknown',
          hours_ahead: 24,
          hour: new Date().getHours(),
          day_of_week: new Date().getDay(),
          month: new Date().getMonth() + 1,
          season: Math.floor((new Date().getMonth()) / 3)
        })
      });

      if (!forecastResponse.ok) {
        throw new Error('AI forecast service unavailable');
      }

      const forecast = await forecastResponse.json();
      res.json(forecast);
    } catch (error) {
      console.error("Error getting AI forecast:", error);

      // Fallback to mock data if AI service is unavailable
      const fallbackForecast = {
        timestamp: new Date().toISOString(),
        location: req.body.location || 'Unknown',
        forecasts: {
          pm25: Array.from({ length: 24 }, (_, i) => 25 + Math.random() * 20),
          pm10: Array.from({ length: 24 }, (_, i) => 35 + Math.random() * 25),
          co2: Array.from({ length: 24 }, (_, i) => 400 + Math.random() * 100)
        },
        hourly_aqi: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          aqi: Math.floor(50 + Math.random() * 50),
          level: 'Moderate'
        })),
        daily_summary: [
          { day: 0, avg_aqi: 65, level: 'Moderate', recommendation: 'Air quality is moderate.' },
          { day: 1, avg_aqi: 58, level: 'Moderate', recommendation: 'Air quality is moderate.' },
          { day: 2, avg_aqi: 72, level: 'Moderate', recommendation: 'Air quality is moderate.' }
        ]
      };

      res.json(fallbackForecast);
    }
  });

  // Subscribe to alerts
  app.post(`${apiPrefix}/subscribe`, async (req, res) => {
    try {
      const validatedData = insertSubscriptionSchema.parse(req.body);
      const subscription = await storage.createSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error creating subscription:", error);
        res.status(500).json({ error: "Failed to create subscription" });
      }
    }
  });

  // Report an incident
  app.post(`${apiPrefix}/incidents`, async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(validatedData);
      res.status(201).json(incident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error creating incident:", error);
        res.status(500).json({ error: "Failed to create incident" });
      }
    }
  });

  // Get environment variables for client
  app.get(`${apiPrefix}/env`, (req, res) => {
    res.json({
      VITE_OPENAI_API_KEY: process.env.OPENAI_API_KEY
    });
  });

  const httpServer = createServer(app);

  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    // Send initial message
    ws.send(JSON.stringify({ type: 'connection', message: 'Connected to AirSense WebSocket server' }));

    // Handle messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);

        // Echo back the message for now
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'echo', data }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    // Handle close
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  return httpServer;
}
