import random

def get_current_traffic():
    """
    Generate simulated real-time data with anomalies
    Vehicle count: random (10-100) or spike (100-200) on incident
    """
    
    # 5% chance of an anomaly (e.g., accident ahead)
    is_anomaly = random.random() < 0.05
    
    if is_anomaly:
        count = random.randint(110, 180)
        level = "HIGH"  # Force HIGH due to anomaly
    else:
        count = random.randint(10, 100)
        if count <= 30:
            level = "LOW"
        elif count <= 70:
            level = "MEDIUM"
        else:
            level = "HIGH"
            
    return count, level
