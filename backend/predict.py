def calculate_signal_timings(current_level: str, predicted_level: str) -> tuple[int, int]:
    """
    Computes precise Green and Red light durations based on severity.
    Returns: (green_duration_seconds, red_duration_seconds)
    """
    # Baseline normal traffic (Medium)
    green = 45 
    red = 45
    
    if predicted_level == "VERY HIGH":
        # Massive congestion ahead, maximize flow
        green = 90
        red = 30
    elif predicted_level == "HIGH":
        green = 60
        red = 30
    elif predicted_level == "LOW":
        # Low traffic, clear other intersecting lanes
        green = 20
        red = 45
        
    return green, red

def predict_traffic(current_level: str) -> str:
    """Predicts next state based on current load trajectory."""
    if current_level == "HIGH":
        return "VERY HIGH"
    elif current_level == "MEDIUM":
        return "HIGH"
    elif current_level == "LOW":
        return "MEDIUM"
    return "UNKNOWN"
