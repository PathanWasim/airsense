# AI Air Quality Forecasting Model

This directory contains the Python-based AI forecasting system for air quality prediction using machine learning models.

## Features

- **Machine Learning Models**: Random Forest and Gradient Boosting for robust predictions
- **Multi-pollutant Forecasting**: Predicts PM2.5, PM10, CO2, NO2, SO2, and O3 levels
- **Time Series Features**: Incorporates lag features and rolling averages
- **AQI Calculation**: Converts pollutant concentrations to Air Quality Index
- **REST API**: Flask-based API for integration with the main application
- **Synthetic Data Generation**: Creates realistic training data with seasonal patterns

## Setup

1. **Install Python dependencies**:
```bash
cd ai_model
pip install -r requirements.txt
```

2. **Train the models**:
```bash
python air_quality_forecaster.py
```

3. **Start the forecast API**:
```bash
python forecast_api.py
```

The API will be available at `http://localhost:5002`

## API Endpoints

### GET /health
Health check endpoint

### POST /forecast
Generate air quality forecast

**Request body**:
```json
{
  "temperature": 20,
  "humidity": 60,
  "wind_speed": 5,
  "pressure": 1013,
  "location": "Downtown",
  "hours_ahead": 24
}
```

**Response**:
```json
{
  "timestamp": "2025-01-05T...",
  "location": "Downtown",
  "forecasts": {
    "pm25": [25.3, 27.1, ...],
    "pm10": [35.2, 38.4, ...],
    "co2": [420, 435, ...]
  },
  "hourly_aqi": [
    {
      "hour": 0,
      "aqi": 65,
      "level": "Moderate",
      "pollutants": {...}
    }
  ],
  "daily_summary": [
    {
      "day": 0,
      "avg_aqi": 72,
      "level": "Moderate",
      "recommendation": "..."
    }
  ]
}
```

### POST /train
Retrain models with new data

## Model Architecture

### Features Used
- **Weather Data**: Temperature, humidity, wind speed, pressure
- **Temporal Features**: Hour of day, day of week, month, season
- **Lag Features**: Previous 1-hour and 24-hour values
- **Rolling Averages**: 3-hour and 24-hour moving averages

### Models
- **Random Forest Regressor**: Ensemble method for robust predictions
- **Gradient Boosting Regressor**: Sequential learning for complex patterns
- **Automatic Model Selection**: Chooses best performing model per pollutant

### Data Patterns
The synthetic data generator creates realistic patterns:
- **Seasonal Variations**: Higher pollution in winter
- **Daily Cycles**: Rush hour peaks, lower nighttime levels
- **Weather Dependencies**: Wind speed affects dispersion
- **Weekend Effects**: Lower weekday pollution for some pollutants

## Integration with Main App

Update your Node.js server to call the Python API:

```javascript
// In server/routes.ts
app.get('/api/ai-forecast', async (req, res) => {
  try {
    const response = await fetch('http://localhost:5002/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        temperature: req.query.temp || 20,
        humidity: req.query.humidity || 60,
        wind_speed: req.query.wind || 5,
        location: req.query.location || 'Unknown',
        hours_ahead: 24
      })
    });
    
    const forecast = await response.json();
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Forecast service unavailable' });
  }
});
```

## Production Deployment

For production deployment:

1. **Use Docker**:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5002
CMD ["python", "forecast_api.py"]
```

2. **Environment Variables**:
```bash
export PORT=5002
export FLASK_ENV=production
```

3. **Model Persistence**: Models are automatically saved to `models/` directory

## Model Performance

The models are trained on synthetic data with realistic patterns and achieve:
- **Mean Absolute Error**: Varies by pollutant (typically 10-20% of mean values)
- **R² Score**: Generally > 0.7 for most pollutants
- **Real-time Prediction**: < 100ms response time

## Future Enhancements

- **Deep Learning**: LSTM networks for better time series modeling
- **External Data**: Weather API integration for real forecasts
- **Real Training Data**: Replace synthetic data with actual measurements
- **Ensemble Methods**: Combine multiple model types
- **Uncertainty Quantification**: Prediction intervals and confidence scores