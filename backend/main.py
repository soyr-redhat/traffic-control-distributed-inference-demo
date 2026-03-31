from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import asyncio
import time
import random
import uuid
import os
from dotenv import load_dotenv

from models import (
    VehicleType, LaneStatus, GameMode,
    SpawnRequest, GameModeRequest, Vehicle, Lane, Metrics
)
from traffic_manager import TrafficManager

load_dotenv()

app = FastAPI(title="AI Highway - Traffic Control API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
traffic_manager = TrafficManager()
active_connections: List[WebSocket] = []
current_game_mode: GameMode = None

@app.get("/")
async def root():
    return {
        "service": "AI Highway Traffic Control",
        "status": "running",
        "pillar": "LLMs at Scale (LLM-D)"
    }

@app.post("/api/spawn")
async def spawn_vehicle(request: SpawnRequest):
    """Manually spawn a vehicle (inference request)"""
    vehicle = traffic_manager.spawn_vehicle(request.vehicleType)
    await broadcast_update()
    return {"success": True, "vehicleId": vehicle.id}

@app.post("/api/game-mode")
async def set_game_mode(request: GameModeRequest):
    """Set or clear game mode"""
    global current_game_mode
    current_game_mode = request.mode

    if request.mode:
        asyncio.create_task(run_game_mode(request.mode))

    return {"success": True, "mode": request.mode}

@app.get("/api/metrics")
async def get_metrics():
    """Get current performance metrics"""
    return traffic_manager.get_metrics()

@app.get("/api/lanes")
async def get_lanes():
    """Get lane status"""
    return traffic_manager.get_lanes()

@app.websocket("/ws/traffic")
async def websocket_traffic(websocket: WebSocket):
    """WebSocket for real-time traffic updates"""
    await websocket.accept()
    active_connections.append(websocket)

    try:
        # Send initial state
        await websocket.send_json({
            "type": "metrics",
            "metrics": traffic_manager.get_metrics().model_dump()
        })
        await websocket.send_json({
            "type": "lanes",
            "lanes": [lane.model_dump() for lane in traffic_manager.get_lanes()]
        })

        # Keep connection alive
        while True:
            await asyncio.sleep(1)
            # Client can send messages if needed
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
            except asyncio.TimeoutError:
                pass

    except WebSocketDisconnect:
        active_connections.remove(websocket)

async def broadcast_update():
    """Broadcast updates to all connected clients"""
    if not active_connections:
        return

    metrics = traffic_manager.get_metrics()
    lanes = traffic_manager.get_lanes()
    vehicles = list(traffic_manager.vehicles.values())

    message_metrics = {
        "type": "metrics",
        "metrics": metrics.model_dump()
    }
    message_lanes = {
        "type": "lanes",
        "lanes": [lane.model_dump() for lane in lanes]
    }
    message_vehicles = {
        "type": "vehicles",
        "vehicles": [v.model_dump() for v in vehicles]
    }

    # Send to all connections
    for connection in active_connections[:]:
        try:
            await connection.send_json(message_metrics)
            await connection.send_json(message_lanes)
            await connection.send_json(message_vehicles)
        except:
            active_connections.remove(connection)

async def run_game_mode(mode: GameMode):
    """Execute game mode logic"""
    if mode == GameMode.MORNING:
        # Gradual increase
        for i in range(10, 80, 10):
            traffic_manager.set_auto_spawn_rate(i)
            await asyncio.sleep(5)

    elif mode == GameMode.BLACK_FRIDAY:
        # Maximum stress - Black Friday sale simulation
        print("🛍️ BLACK FRIDAY MODE: Simulating massive traffic spike!")
        traffic_manager.set_auto_spawn_rate(100)
        await asyncio.sleep(30)
        traffic_manager.set_auto_spawn_rate(40)

    elif mode == GameMode.CONVOY:
        # Similar prompts (cache test)
        for _ in range(20):
            traffic_manager.spawn_vehicle(VehicleType.CAR, use_similar_prompt=True)
            await asyncio.sleep(0.5)

    elif mode == GameMode.NIGHT:
        # Scale to zero
        traffic_manager.set_auto_spawn_rate(5)
        await asyncio.sleep(20)
        traffic_manager.set_auto_spawn_rate(0)

    elif mode == GameMode.CONSTRUCTION:
        # Simulate lane closure
        await traffic_manager.close_lane("replica-2")
        await asyncio.sleep(15)
        await traffic_manager.open_lane("replica-2")

    elif mode == GameMode.SPEED:
        # Maximize throughput
        traffic_manager.set_auto_spawn_rate(90)

async def metrics_updater():
    """Background task to update metrics"""
    while True:
        await asyncio.sleep(0.1)  # Update 10 times per second for smooth movement
        traffic_manager.update_metrics()
        await broadcast_update()

@app.on_event("startup")
async def startup_event():
    """Start background tasks"""
    asyncio.create_task(metrics_updater())
    asyncio.create_task(traffic_manager.run())

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
