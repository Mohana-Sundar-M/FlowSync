import csv
import random
from datetime import datetime, timedelta
import os
import sys

# Add parent dir to path so we can import fetch_bangalore_signals
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from osm_fetcher import fetch_bangalore_signals

def generate_csv():
    # Fetch real node IDs from the OSM fetcher
    signals = fetch_bangalore_signals()
    node_ids = list(signals.keys())
    
    start_date = datetime.now() - timedelta(days=30)
    
    csv_file = os.path.join(os.path.dirname(__file__), "traffic_history.csv")
    
    print(f"Generating 30 days of synthetic historical training data for {len(node_ids)} Bangalore junctions...")
    print(f"Target dataset: {csv_file}")
    
    with open(csv_file, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Features & Targets
        writer.writerow(["node_id", "day_of_week", "hour", "minute", "is_raining", "is_holiday", "volume_count", "volume_10m"])
        
        # Super simplified generation: 4 samples per hour (every 15 mins) for 30 days
        for day_offset in range(30):
            current_date = start_date + timedelta(days=day_offset)
            is_holiday = 1 if current_date.weekday() >= 5 else 0 # Weekends as holidays for simplicity
            
            for hour in range(24):
                # Random rain chance for this hour
                is_raining = 1 if random.random() < 0.05 else 0
                
                for minute in [0, 15, 30, 45]:
                    day_of_week = current_date.weekday()
                    
                    # Base time math
                    time_multiplier = 0.2
                    if 8 <= hour <= 10: # Morning Rush
                        time_multiplier = 0.8 if not is_holiday else 0.4
                    elif 17 <= hour <= 19: # Evening Rush
                        time_multiplier = 0.9 if not is_holiday else 0.5
                    elif 11 <= hour <= 16:
                        time_multiplier = 0.5
                        
                    if is_raining:
                        time_multiplier *= 0.8 # Rain slows overall flow/capacity
                        
                    for node_id in node_ids:
                        node_offset = hash(node_id) % 20 / 100.0
                        
                        # Generate Current Volume
                        base_vol = 180 * min(1.0, time_multiplier + node_offset)
                        vol = int(max(5, base_vol * random.uniform(0.85, 1.15)))
                        
                        # Generate Fake Future Volume (+10m prediction target)
                        # We simulate "knowing the future" in our training set
                        vol_10m = int(max(5, vol * random.uniform(0.9, 1.1)))
                        
                        writer.writerow([node_id, day_of_week, hour, minute, is_raining, is_holiday, vol, vol_10m])

    print("Training dataset generated successfully!")

if __name__ == "__main__":
    generate_csv()
