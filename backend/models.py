from pydantic import BaseModel
from typing import Dict, Any

class SignalData(BaseModel):
    id: str
    name: str
    lat: float
    lon: float
    vehicle_count: int
    current: str
    predicted: str
    green_duration: int
    red_duration: int
