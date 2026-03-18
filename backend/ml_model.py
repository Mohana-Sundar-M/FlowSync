import datetime
import random
import math
import pickle
import os
import pandas as pd

class TrafficSimulator:
    """
    V9: True Machine Learning Engine
    Loads the compiled RandomForestRegressor trained on 30 days of historical data.
    """
    
    def __init__(self):
        self.model = None
        self._load_model()
        
    def _load_model(self):
        model_path = os.path.join(os.path.dirname(__file__), "ml", "traffic_model.pkl")
        if os.path.exists(model_path):
            try:
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                print("FlowSync AI Model Loaded Successfully")
            except Exception as e:
                print(f"Failed to load AI model: {str(e)}")
        else:
            print("AI Model not found. Did you run train_model.py?")
        
    def _get_historical_baseline(self, node_id: str, current_time) -> int:
        """
        Retrieves the average volume for this node at this hour on a normal day.
        """
        # Very rough estimation of standard traffic for baselining without needing true DB query
        hour = current_time.hour
        time_multiplier = 0.2
        if 8 <= hour <= 10: time_multiplier = 0.8
        elif 17 <= hour <= 19: time_multiplier = 0.9
        elif 11 <= hour <= 16: time_multiplier = 0.5
            
        seed_offset = hash(node_id) % 20 / 100.0
        expected_multiplier = time_multiplier + seed_offset
        base_historical = 180 * min(1.0, expected_multiplier)
        return int(max(5, base_historical))
        
    def calculate_signal_timings(self, current_traffic, forecast_traffic):
        """
        V8 Dynamic Flow Algorithm:
        No more static 45s or 90s buckets. 
        Calculates a unique, dynamic green light duration based purely on raw volume.
        Base green is 30s. Every 3 cars adds 1 second of green time.
        Caps at 120s for extreme gridlock prevention.
        """
        # Average the current and forecasted volume
        avg_volume = (current_traffic + forecast_traffic) / 2
        
        # Base 30 seconds + 1 second per 3 cars
        calculated_green = 30 + (avg_volume / 3.0)
        
        # Clamp between 30 (min) and 120 (max)
        green_duration = int(max(30, min(120, calculated_green)))
        
        # Red duration is basically the inverse logic for the cross-street.
        # If this street needs a lot of green, the cross-street must wait on red.
        red_duration = green_duration
        
        # Determine the severity bucket just for UI coloring labels
        if avg_volume < 40:
            return "LOW", "MEDIUM", green_duration, red_duration
        elif avg_volume < 85:
            return "MEDIUM", "HIGH", green_duration, red_duration
        else:
            return "HIGH", "VERY HIGH", green_duration, red_duration

    def generate_current_traffic(self, node_id: str) -> dict:
        now = datetime.datetime.now()
        
        # Live System Features
        features = {
            'node_id_hash': hash(str(node_id)) % 10000,
            'day_of_week': now.weekday(),
            'hour': now.hour,
            'minute': now.minute,
            'is_raining': 1 if random.random() < 0.05 else 0, # Live weather proxy
            'is_holiday': 1 if now.weekday() >= 5 else 0 # basic holiday logic
        }
        
        # 3% chance the real-world has a severe anomaly right now
        is_anomaly = random.random() < 0.03
        
        historical_vol = self._get_historical_baseline(node_id, now)
        
        if self.model:
            # V9 True Inference
            df_inf = pd.DataFrame([features])
            
            # Model predicts both [current_vol, future_10m_vol]
            predictions = self.model.predict(df_inf)[0]
            total_vol = int(predictions[0])
            future_vol = int(predictions[1])
            
            # V11: Split into directional axes for High Level ML coordination
            # We use a deterministic directional bias per node
            bias = (abs(hash(str(node_id))) % 40 + 30) / 100.0 # 0.3 to 0.7
            ns_vol = int(total_vol * bias)
            ew_vol = int(total_vol * (1.0 - bias))
            
            # Inject live physical anomaly if detected
            if is_anomaly:
                ns_vol = int(ns_vol * random.uniform(1.8, 2.5))
                ew_vol = int(ew_vol * 1.1)
                total_vol = ns_vol + ew_vol
                future_vol = int(total_vol * 1.1)
                
            ns_vol = max(2, ns_vol)
            ew_vol = max(2, ew_vol)
            total_vol = ns_vol + ew_vol
            
        else:
            # Fallback dumb math
            total_vol = historical_vol
            bias = (abs(hash(str(node_id))) % 40 + 30) / 100.0
            ns_vol = int(total_vol * bias)
            ew_vol = int(total_vol * (1.0 - bias))
            
            if is_anomaly: 
                ns_vol = int(ns_vol * random.uniform(2.0, 3.0))
                
            total_vol = ns_vol + ew_vol
            future_vol = int(total_vol * (1.1 if is_anomaly else 0.95))
        
        return {
            "vehicle_count": total_vol,
            "ns_vehicle_count": ns_vol,
            "ew_vehicle_count": ew_vol,
            "forecast_10m": future_vol,
            "historical_baseline": historical_vol,
            "is_anomaly": is_anomaly
        }
        
    def classify_level(self, volume: int) -> str:
        if volume <= 40: return "LOW"
        if volume <= 100: return "MEDIUM"
        if volume <= 160: return "HIGH"
        return "VERY HIGH"

simulator = TrafficSimulator()
