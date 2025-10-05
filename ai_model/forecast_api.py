from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime, timedelta
import numpy as np
from air_quality_forecaster import AirQualityForecaster
import os

app = Flask(__name__)
CORS(app)

# Initialize forecaster
forecaster = AirQualityForecaster()

# Load pre-trained models if they exist
if os.path.exists('models'):
    try:
        forecaster.load_models()
        print("Pre-trained models loaded successfully")
    except Exception as e:
        print(f"Error loading models: {e}")
        print("Training new models...")
        # Generate and train on synthetic data
        df = forecaster.generate_synthetic_data(n_samples=8760)
        forecaster.train_models(df)
        forecaster.save_models()
else:
    print("No pre-trained models found. Training new models...")
    # Generate and train on synthetic data
    df = forecaster.generate_synthetic_data(n_samples=8760)
    forecaster.train_models(df)
    forecaster.save_models()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

@app.route('/forecast', methods=['POST'])
def get_forecast():
    """Generate air quality forecast"""
    try:
        data = request.get_json()
        
        # Extract current conditions
        current_conditions = {
            'temperature': data.get('temperature', 20),
            'humidity': data.get('humidity', 60),
            'wind_speed': data.get('wind_speed', 5),
            'pressure': data.get('pressure', 1013),
            'hour': data.get('hour', datetime.now().hour),
            'day_of_week': data.get('day_of_week', datetime.now().weekday()),
            'month': data.get('month', datetime.now().month),
            'season': data.get('season', (datetime.now().month - 1) // 3)
        }
        
        hours_ahead = data.get('hours_ahead', 24)
        
        # Generate forecast
        forecasts = forecaster.predict_forecast(current_conditions, hours_ahead)
        
        # Format response
        response = {
            'timestamp': datetime.now().isoformat(),
            'location': data.get('location', 'Unknown'),
            'current_conditions': current_conditions,
            'forecasts': {},
            'hourly_aqi': [],
            'daily_summary': []
        }
        
        # Process forecasts
        for pollutant, predictions in forecasts.items():
            response['forecasts'][pollutant] = predictions
        
        # Calculate hourly AQI
        for hour in range(min(hours_ahead, 24)):
            pollutant_values = {}
            for pollutant in forecasts:
                if hour < len(forecasts[pollutant]):
                    pollutant_values[pollutant] = forecasts[pollutant][hour]
            
            aqi = forecaster.calculate_aqi(pollutant_values)
            
            forecast_time = datetime.now() + timedelta(hours=hour)
            response['hourly_aqi'].append({
                'hour': hour,
                'time': forecast_time.isoformat(),
                'aqi': aqi,
                'level': get_aqi_level(aqi),
                'pollutants': pollutant_values
            })
        
        # Generate daily summary (next 3 days)
        for day in range(3):
            start_hour = day * 24
            end_hour = min((day + 1) * 24, hours_ahead)
            
            if start_hour >= hours_ahead:
                break
            
            daily_aqi_values = []
            daily_pollutants = {pollutant: [] for pollutant in forecasts}
            
            for hour in range(start_hour, end_hour):
                pollutant_values = {}
                for pollutant in forecasts:
                    if hour < len(forecasts[pollutant]):
                        value = forecasts[pollutant][hour]
                        pollutant_values[pollutant] = value
                        daily_pollutants[pollutant].append(value)
                
                if pollutant_values:
                    aqi = forecaster.calculate_aqi(pollutant_values)
                    daily_aqi_values.append(aqi)
            
            if daily_aqi_values:
                avg_aqi = int(np.mean(daily_aqi_values))
                max_aqi = int(np.max(daily_aqi_values))
                
                forecast_date = datetime.now() + timedelta(days=day)
                
                response['daily_summary'].append({
                    'day': day,
                    'date': forecast_date.strftime('%Y-%m-%d'),
                    'day_name': forecast_date.strftime('%A'),
                    'avg_aqi': avg_aqi,
                    'max_aqi': max_aqi,
                    'level': get_aqi_level(avg_aqi),
                    'dominant_pollutant': get_dominant_pollutant(daily_pollutants),
                    'recommendation': get_health_recommendation(avg_aqi)
                })
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/train', methods=['POST'])
def retrain_models():
    """Retrain models with new data"""
    try:
        data = request.get_json()
        
        # Generate new training data or use provided data
        if 'training_data' in data:
            # Use provided training data
            import pandas as pd
            df = pd.DataFrame(data['training_data'])
        else:
            # Generate synthetic data
            n_samples = data.get('n_samples', 8760)
            df = forecaster.generate_synthetic_data(n_samples)
        
        # Retrain models
        forecaster.train_models(df)
        forecaster.save_models()
        
        return jsonify({
            "status": "success",
            "message": "Models retrained successfully",
            "timestamp": datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_aqi_level(aqi):
    """Get AQI level description"""
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"

def get_dominant_pollutant(daily_pollutants):
    """Get the dominant pollutant for the day"""
    max_pollutant = "pm25"
    max_avg = 0
    
    for pollutant, values in daily_pollutants.items():
        if values:
            avg_value = np.mean(values)
            # Normalize by typical ranges to compare
            if pollutant == 'pm25' and avg_value / 35 > max_avg:
                max_avg = avg_value / 35
                max_pollutant = pollutant
            elif pollutant == 'pm10' and avg_value / 50 > max_avg:
                max_avg = avg_value / 50
                max_pollutant = pollutant
            elif pollutant == 'co2' and avg_value / 1000 > max_avg:
                max_avg = avg_value / 1000
                max_pollutant = pollutant
    
    return max_pollutant.upper()

def get_health_recommendation(aqi):
    """Get health recommendation based on AQI"""
    if aqi <= 50:
        return "Air quality is good. Ideal for outdoor activities."
    elif aqi <= 100:
        return "Air quality is moderate. Sensitive individuals should consider limiting prolonged outdoor exertion."
    elif aqi <= 150:
        return "Unhealthy for sensitive groups. People with respiratory conditions should limit outdoor activity."
    elif aqi <= 200:
        return "Unhealthy air quality. Everyone should reduce prolonged outdoor exertion."
    elif aqi <= 300:
        return "Very unhealthy air quality. Avoid outdoor activities. Stay indoors with air purifiers."
    else:
        return "Hazardous air quality. Avoid all outdoor activities. Emergency conditions."

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)