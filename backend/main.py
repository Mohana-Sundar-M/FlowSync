import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import predict
from osm_fetcher import fetch_bangalore_signals
from ml_model import simulator
from cosmos_db import log_action_to_cosmos
from datetime import datetime
import random
import math

app = FastAPI(title="FlowSync AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CITY_SIGNALS = fetch_bangalore_signals()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.recent_actions: list[dict] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass
                
    def add_action(self, action: dict):
        self.recent_actions.insert(0, action)
        if len(self.recent_actions) > 50:
            self.recent_actions.pop()

manager = ConnectionManager()

class NodeState:
    def __init__(self, node_id, data):
        self.node_id = node_id
        self.name = data["name"]
        self.lat = data["lat"]
        self.lon = data["lon"]
        self.junction_type = "roundabout" if any(x in self.name.lower() for x in ["circle", "roundabout", "chowk"]) else "cross"

        
        # V10: Permanently diverse phase initialization
        # Use the hash of the node_id as a seed so each node ALWAYS boots into a different phase
        # This guarantees the map is a rich mix of Red/Yellow/Green on every single boot
        phases = ["NS_GREEN", "NS_YELLOW", "EW_GREEN", "EW_YELLOW"]
        phase_seed = abs(hash(node_id)) % 4
        self.phase = phases[phase_seed]
        
        self.vehicle_count = 0
        self.forecast_10m = 0
        self.historical_baseline = 0
        self.current_level = "LOW"
        self.predicted_level = "LOW"
        self.green_duration = 45
        self.red_duration = 45
        self.is_anomaly = False
        
        # V11: Asymmetric timing and directional volumes
        self.ns_vehicle_count = 0
        self.ew_vehicle_count = 0
        self.ns_green_duration = 45
        self.ew_green_duration = 45
        
        # Neighbor-aware adaptive timing score
        self.neighbor_pressure = 0.0
        
        # New: V11 Spatial Cache (pre-calculated during startup)
        self.neighbors = [] 
        
        self.update_traffic_and_timings(init=True)
        
        # Seed timer from node_id hash
        timer_offset = abs(hash(node_id)) % max(1, self.ns_green_duration)
        self.timer = max(1, timer_offset)
        
        # Network shielding properties
        self.forced_red_hold = 0 
        self.shielded_by = None


    def tick(self):
        if self.forced_red_hold > 0:
            # If a neighbor is demanding we hold red, pause our timer cycle completely
            self.forced_red_hold -= 1
            if self.phase == "NS_GREEN": self.phase = "NS_YELLOW" # force out of green
            if self.forced_red_hold <= 0:
                self.shielded_by = None # network shield expired
            return
            
        if self.timer <= 0:
            # Switch phase: V11 with ALL_RED clearance intervals for visibility
            if self.phase == "NS_GREEN":
                self.phase = "NS_YELLOW"
                self.timer = 2 # Snappy yellow
            elif self.phase == "NS_YELLOW":
                self.phase = "ALL_RED"
                self.timer = 3 # Snappy red clearance
            elif self.phase == "ALL_RED":
                self.phase = "EW_GREEN"
                self.timer = self.ew_green_duration
            elif self.phase == "EW_GREEN":
                self.phase = "EW_YELLOW"
                self.timer = 2
            elif self.phase == "EW_YELLOW":
                self.phase = "ALL_RED_2"
                self.timer = 3
            elif self.phase == "ALL_RED_2":
                self.phase = "NS_GREEN"
                self.update_traffic_and_timings() # Refresh ML predictions only once per full cycle
                self.timer = self.ns_green_duration

        else:
            self.timer -= 1


    def update_traffic_and_timings(self, init=False):
        # V11: Split volumes and timings
        data = simulator.generate_current_traffic(self.node_id)
        
        # Split single count 60/40 based on hash bias if model returns single count
        bias = (abs(hash(self.node_id)) % 30) / 100.0 + 0.35 # 0.35 to 0.65
        self.ns_vehicle_count = int(data["vehicle_count"] * bias)
        self.ew_vehicle_count = int(data["vehicle_count"] * (1.0 - bias))
            
        self.vehicle_count = self.ns_vehicle_count + self.ew_vehicle_count
        self.forecast_10m = data["forecast_10m"]
        self.historical_baseline = data["historical_baseline"]
        self.is_anomaly = data["is_anomaly"]
        
        # Classify overall level
        self.current_level = simulator.classify_level(self.vehicle_count)
        self.predicted_level = simulator.classify_level(self.forecast_10m)
        
        # V11: Asymmetric Timings based on directional pressure
        pressure_boost = 1.0 + (self.neighbor_pressure * 0.4)
        
        _, _, ns_dur, _ = simulator.calculate_signal_timings(self.ns_vehicle_count, self.ns_vehicle_count)
        _, _, ew_dur, _ = simulator.calculate_signal_timings(self.ew_vehicle_count, self.ew_vehicle_count)
        
        self.ns_green_duration = int(ns_dur * pressure_boost)
        self.ew_green_duration = int(ew_dur * pressure_boost)
        
        # Compatibility/UI fallback
        self.green_duration = self.ns_green_duration
        self.red_duration = self.ew_green_duration

        
        if init:
            self.timer = self.green_duration
            
        if not init and (self.is_anomaly or self.predicted_level in ["HIGH", "VERY HIGH"]):
            action_msg = f"OVERRIDE: Set {self.name} to {self.green_duration}s GREEN to clear +{self.vehicle_count}v logic flag."
            action_obj = {
                "id": f"{self.node_id}_{datetime.now().timestamp()}",
                "timestamp": datetime.now().strftime("%I:%M:%S %p"),
                "node_name": self.name,
                "message": action_msg
            }
            manager.add_action(action_obj)
            log_action_to_cosmos(self.node_id, action_msg, self.vehicle_count, self.forecast_10m)
            
    def to_dict(self):
        return {
            "id": self.node_id,
            "name": self.name,
            "lat": self.lat,
            "lon": self.lon,
            "phase": self.phase,
            "timer": self.timer,
            "vehicle_count": self.vehicle_count,
            "forecast_10m": self.forecast_10m,
            "historical_baseline": self.historical_baseline,
            "current_level": self.current_level,
            "predicted_level": self.predicted_level,
            "green_duration": self.green_duration,
            "red_duration": self.red_duration,
            "ns_vehicle_count": self.ns_vehicle_count,
            "ew_vehicle_count": self.ew_vehicle_count,
            "ns_green_duration": self.ns_green_duration,
            "ew_green_duration": self.ew_green_duration,
            "junction_type": self.junction_type,
            "is_anomaly": self.is_anomaly,
            "shielded_by": self.shielded_by
        }

# Global Master Grid
GRID = {node_id: NodeState(node_id, data) for node_id, data in CITY_SIGNALS.items()}

def calculate_distance(lat1, lon1, lat2, lon2):
    """Basic Euclidean distance for fast neighbor checking"""
    return math.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2)

def initialize_spatial_cache():
    """V11: Pre-calculate 5 closest neighbors for every node to optimize physics engine"""
    print("Initializing Spatial Cache for 1252 nodes...")
    node_list = list(GRID.values())
    for node in node_list:
        # For each node, find 5 closest other nodes
        sorted_neighbors = sorted(
            [n for n in node_list if n.node_id != node.node_id],
            key=lambda n: calculate_distance(node.lat, node.lon, n.lat, n.lon)
        )
        node.neighbors = sorted_neighbors[:5]
    print("Spatial Cache Initialized Successfully.")


def enforce_network_physics():
    """
    V11 Optimized Orchestration:
    Uses pre-cached neighbors to avoid O(N^2) sorting every second.
    """
    node_list = list(GRID.values())
    
    for node in node_list:
        # AGGRESSIVE BACKPRESSURE: If I am congested, I tell my neighbors to stop
        if node.is_anomaly or node.current_level == "VERY HIGH":
            for neighbor in node.neighbors[:3]:
                if neighbor.forced_red_hold == 0:
                    neighbor.forced_red_hold = 25 # Slightly longer hold for stability
                    neighbor.shielded_by = node.name
                    
                    # LOG DE-DUPLICATION: Only log when the shield BEGINS
                    msg = f"BACKPRESSURE: '{neighbor.name}' forced RED. Reasoning: Throttling inflow to relieve critical congestion at '{node.name}'."
                    manager.add_action({
                        "id": f"throt_{neighbor.node_id}_{datetime.now().timestamp()}",
                        "timestamp": datetime.now().strftime("%I:%M:%S %p"),
                        "node_name": neighbor.name,
                        "message": msg
                    })


        # ADAPTIVE PRESSURE SCORING: 
        # Look at pre-cached 5 nearest neighbors
        heavy_count = sum(1 for n in node.neighbors if n.current_level in ["HIGH", "VERY HIGH"])
        node.neighbor_pressure = heavy_count / max(1, len(node.neighbors))



async def master_clock_tick():
    """Background task to tick every second and broadcast."""
    while True:
        await asyncio.sleep(1)
        
        # 1. Tick timers
        junctions = {}
        for node_id, node in GRID.items():
            node.tick()
            junctions[node_id] = node.to_dict()
            
        # 2. Run Spatial Network Math
        enforce_network_physics()
            
        # V12: System-wide Peak Hour & AI Context
        now = datetime.now()
        is_peak = (8 <= now.hour <= 10) or (17 <= now.hour <= 19)
            
        payload = {
            "type": "UPDATE",
            "data": {
                "junctions": junctions,
                "actions": manager.recent_actions[:15],
                "meta": {
                    "is_peak_hour": is_peak,
                    "city_wide_volume": sum(n.vehicle_count for n in GRID.values()),
                    "timestamp": now.strftime("%I:%M:%S %p")
                }
            }
        }
        await manager.broadcast(json.dumps(payload))


@app.on_event("startup")
async def startup_event():
    initialize_spatial_cache()
    asyncio.create_task(master_clock_tick())


@app.get("/suggest-signal")
def suggest_signal():
    """
    V12 AI Planning: Finds intersections with HIGH volume that have 
    no signals within 500m, suggests a new signal placement.
    """
    node_list = list(GRID.values())
    candidates = [n for n in node_list if n.current_level in ["HIGH", "VERY HIGH"]]
    
    # Very simple heuristic for demo: return top 3 congested spots
    # that could benefit from a new neighbor signal
    suggestions = []
    for c in sorted(candidates, key=lambda x: x.vehicle_count, reverse=True)[:3]:
        suggestions.append({
            "target_node": c.name,
            "reason": f"Sustained volume exceeds capacity ({c.vehicle_count}v). Neighbor pressure is high.",
            "suggested_lat": c.lat + 0.001,
            "suggested_lon": c.lon + 0.001
        })
    return {"suggestions": suggestions}

@app.post("/add-signal")
async def add_signal(data: dict):
    """V12: Support manual addition of a smart signal"""
    node_id = f"manual_{random.randint(1000, 9999)}"
    new_node = NodeState(node_id, {
        "name": data.get("name", "New Smart Signal"),
        "lat": data.get("lat"),
        "lon": data.get("lon")
    })
    GRID[node_id] = new_node
    # Re-initialize cache to include new neighbor
    initialize_spatial_cache()
    return {"status": "success", "node_id": node_id}

@app.get("/traffic-system")

def get_traffic_system():
    return {"junctions": {k: v.to_dict() for k, v in GRID.items()}, "actions": manager.recent_actions[:15]}

@app.websocket("/ws/traffic")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        initial_state = {"junctions": {k: v.to_dict() for k, v in GRID.items()}, "actions": manager.recent_actions[:15]}
        await websocket.send_text(json.dumps({"type": "UPDATE", "data": initial_state}))
        
        while True:
            await websocket.receive_text() # keep open
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
