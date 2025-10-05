import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import joblib
import json
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class AirQualityForecaster:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_columns = [
            'temperature', 'humidity', 'wind_speed', 'pressure',
            'hour', 'day_of_week', 'month', 'season'
        ]
        self.target_columns = ['pm25', 'pm10', 'co2', 'no2', 'so2', 'o3']
        
    def generate_synthetic_data(self, n_samples=10000):
        """Generate synthetic air quality data for training"""
        np.random.seed(42)
        
        # Generate time series
        start_date = datetime(2020, 1, 1)
        dates = [start_date + timedelta(hours=i) for i in range(n_samples)]
        
        data = []
        for i, date in enumerate(dates):
            # Weather features with seasonal patterns
            season = (date.month - 1) // 3  # 0-3 for seasons
            hour = date.hour
            day_of_week = date.weekday()
            month = date.month
            
            # Temperature with seasonal variation
            base_temp = 15 + 10 * np.sin(2 * np.pi * (date.timetuple().tm_yday - 80) / 365)
            temperature = base_temp + np.random.normal(0, 5)
            
            # Humidity
            humidity = 50 + 20 * np.sin(2 * np.pi * date.timetuple().tm_yday / 365) + np.random.normal(0, 10)
            humidity = np.clip(humidity, 20, 90)
            
            # Wind speed
            wind_speed = 5 + 3 * np.random.exponential(1)
            wind_speed = np.clip(wind_speed, 0, 20)
            
            # Pressure
            pressure = 1013 + np.random.normal(0, 15)
            
            # Air quality parameters with realistic patterns
            # PM2.5 - higher in winter, during rush hours, lower wind
            pm25_base = 25 + 15 * (season == 0 or season == 3)  # Higher in winter/fall
            pm25_base += 10 * (7 <= hour <= 9 or 17 <= hour <= 19)  # Rush hours
            pm25_base += max(0, 15 - wind_speed)  # Lower wind = higher pollution
            pm25 = max(0, pm25_base + np.random.normal(0, 8))
            
            # PM10 - correlated with PM2.5 but higher
            pm10 = pm25 * 1.5 + np.random.normal(0, 5)
            pm10 = max(0, pm10)
            
            # CO2 - higher during day, traffic patterns
            co2_base = 400 + 50 * (6 <= hour <= 22)  # Higher during day
            co2_base += 30 * (7 <= hour <= 9 or 17 <= hour <= 19)  # Rush hours
            co2 = co2_base + np.random.normal(0, 20)
            
            # NO2 - traffic related
            no2_base = 20 + 15 * (7 <= hour <= 9 or 17 <= hour <= 19)
            no2_base += 10 * (day_of_week < 5)  # Higher on weekdays
            no2 = max(0, no2_base + np.random.normal(0, 5))
            
            # SO2 - industrial, seasonal
            so2_base = 10 + 5 * (season == 0)  # Higher in winter
            so2 = max(0, so2_base + np.random.normal(0, 3))
            
            # O3 - photochemical, higher in summer, midday
            o3_base = 30 + 20 * (season == 1)  # Higher in summer
            o3_base += 15 * (10 <= hour <= 16)  # Higher midday
            o3 = max(0, o3_base + np.random.normal(0, 8))
            
            data.append({
                'datetime': date,
                'temperature': temperature,
                'humidity': humidity,
                'wind_speed': wind_speed,
                'pressure': pressure,
                'hour': hour,
                'day_of_week': day_of_week,
                'month': month,
                'season': season,
                'pm25': pm25,
                'pm10': pm10,
                'co2': co2,
                'no2': no2,
                'so2': so2,
                'o3': o3
            })
        
        return pd.DataFrame(data)
    
    def prepare_features(self, df):
        """Prepare features for training"""
        # Create lag features
        for col in self.target_columns:
            if col in df.columns:
                df[f'{col}_lag1'] = df[col].shift(1)
                df[f'{col}_lag24'] = df[col].shift(24)  # 24 hours ago
        
        # Create rolling averages
        for col in self.target_columns:
            if col in df.columns:
                df[f'{col}_rolling_3h'] = df[col].rolling(window=3, min_periods=1).mean()
                df[f'{col}_rolling_24h'] = df[col].rolling(window=24, min_periods=1).mean()
        
        return df
    
    def train_models(self, df):
        """Train forecasting models for each pollutant"""
        df = self.prepare_features(df)
        
        # Get all feature columns (including lag and rolling features)
        feature_cols = [col for col in df.columns if col not in self.target_columns + ['datetime']]
        
        for target in self.target_columns:
            if target not in df.columns:
                continue
                
            print(f"Training model for {target}...")
            
            # Prepare data
            X = df[feature_cols].fillna(method='ffill').fillna(0)
            y = df[target].fillna(method='ffill')
            
            # Remove rows with NaN targets
            mask = ~y.isna()
            X = X[mask]
            y = y[mask]
            
            if len(X) == 0:
                continue
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, shuffle=False
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train Random Forest
            rf_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=15,
                random_state=42,
                n_jobs=-1
            )
            rf_model.fit(X_train_scaled, y_train)
            
            # Train Gradient Boosting
            gb_model = GradientBoostingRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
            gb_model.fit(X_train_scaled, y_train)
            
            # Evaluate models
            rf_pred = rf_model.predict(X_test_scaled)
            gb_pred = gb_model.predict(X_test_scaled)
            
            rf_mae = mean_absolute_error(y_test, rf_pred)
            gb_mae = mean_absolute_error(y_test, gb_pred)
            
            # Choose best model
            if rf_mae < gb_mae:
                best_model = rf_model
                model_type = 'RandomForest'
            else:
                best_model = gb_model
                model_type = 'GradientBoosting'
            
            print(f"{target} - Best model: {model_type}, MAE: {min(rf_mae, gb_mae):.2f}")
            
            # Store model and scaler
            self.models[target] = best_model
            self.scalers[target] = scaler
    
    def predict_forecast(self, current_data, hours_ahead=24):
        """Generate forecast for specified hours ahead"""
        forecasts = {}
        
        # Prepare current data
        df = pd.DataFrame([current_data])
        df = self.prepare_features(df)
        
        # Get feature columns
        feature_cols = [col for col in df.columns if col not in self.target_columns + ['datetime']]
        
        for target in self.target_columns:
            if target not in self.models:
                continue
            
            predictions = []
            current_features = df[feature_cols].fillna(0).iloc[0].values
            
            for hour in range(hours_ahead):
                # Scale features
                scaled_features = self.scalers[target].transform([current_features])
                
                # Predict
                pred = self.models[target].predict(scaled_features)[0]
                pred = max(0, pred)  # Ensure non-negative
                predictions.append(pred)
                
                # Update features for next prediction (simplified)
                # In practice, you'd update weather features based on weather forecast
                current_features = current_features.copy()
                if len(current_features) > len(self.feature_columns):
                    # Update lag features
                    current_features[-len(self.target_columns):] = pred
            
            forecasts[target] = predictions
        
        return forecasts
    
    def calculate_aqi(self, pollutant_values):
        """Calculate AQI from pollutant concentrations"""
        # Simplified AQI calculation (US EPA standard)
        aqi_breakpoints = {
            'pm25': [(0, 12, 0, 50), (12.1, 35.4, 51, 100), (35.5, 55.4, 101, 150), 
                     (55.5, 150.4, 151, 200), (150.5, 250.4, 201, 300), (250.5, 500, 301, 500)],
            'pm10': [(0, 54, 0, 50), (55, 154, 51, 100), (155, 254, 101, 150), 
                     (255, 354, 151, 200), (355, 424, 201, 300), (425, 604, 301, 500)],
            'co2': [(0, 400, 0, 50), (401, 1000, 51, 100), (1001, 2000, 101, 150), 
                    (2001, 5000, 151, 200), (5001, 10000, 201, 300), (10001, 40000, 301, 500)],
            'no2': [(0, 53, 0, 50), (54, 100, 51, 100), (101, 360, 101, 150), 
                    (361, 649, 151, 200), (650, 1249, 201, 300), (1250, 2049, 301, 500)],
            'so2': [(0, 35, 0, 50), (36, 75, 51, 100), (76, 185, 101, 150), 
                    (186, 304, 151, 200), (305, 604, 201, 300), (605, 1004, 301, 500)],
            'o3': [(0, 54, 0, 50), (55, 70, 51, 100), (71, 85, 101, 150), 
                   (86, 105, 151, 200), (106, 200, 201, 300), (201, 400, 301, 500)]
        }
        
        max_aqi = 0
        
        for pollutant, concentration in pollutant_values.items():
            if pollutant not in aqi_breakpoints:
                continue
            
            for bp_low, bp_high, aqi_low, aqi_high in aqi_breakpoints[pollutant]:
                if bp_low <= concentration <= bp_high:
                    aqi = ((aqi_high - aqi_low) / (bp_high - bp_low)) * (concentration - bp_low) + aqi_low
                    max_aqi = max(max_aqi, aqi)
                    break
        
        return min(500, max(0, int(max_aqi)))
    
    def save_models(self, path='ai_model/models'):
        """Save trained models"""
        import os
        os.makedirs(path, exist_ok=True)
        
        for target in self.models:
            joblib.dump(self.models[target], f'{path}/{target}_model.pkl')
            joblib.dump(self.scalers[target], f'{path}/{target}_scaler.pkl')
        
        print(f"Models saved to {path}")
    
    def load_models(self, path='ai_model/models'):
        """Load trained models"""
        import os
        
        for target in self.target_columns:
            model_path = f'{path}/{target}_model.pkl'
            scaler_path = f'{path}/{target}_scaler.pkl'
            
            if os.path.exists(model_path) and os.path.exists(scaler_path):
                self.models[target] = joblib.load(model_path)
                self.scalers[target] = joblib.load(scaler_path)
        
        print(f"Models loaded from {path}")

if __name__ == "__main__":
    # Initialize forecaster
    forecaster = AirQualityForecaster()
    
    # Generate training data
    print("Generating synthetic training data...")
    df = forecaster.generate_synthetic_data(n_samples=8760)  # 1 year of hourly data
    
    # Train models
    print("Training forecasting models...")
    forecaster.train_models(df)
    
    # Save models
    forecaster.save_models()
    
    # Test prediction
    current_conditions = {
        'temperature': 20,
        'humidity': 60,
        'wind_speed': 5,
        'pressure': 1013,
        'hour': 14,
        'day_of_week': 1,
        'month': 6,
        'season': 1
    }
    
    print("\nGenerating 24-hour forecast...")
    forecasts = forecaster.predict_forecast(current_conditions, hours_ahead=24)
    
    for pollutant, predictions in forecasts.items():
        print(f"{pollutant.upper()}: {predictions[:6]}")  # Show first 6 hours
    
    print("\nAI forecasting model training completed!")