from pydantic import BaseModel
from typing import Literal, Optional
from enum import Enum

class VehicleType(str, Enum):
    SPORT = "sport"      # Short prompts
    CAR = "car"          # Medium prompts
    TRUCK = "truck"      # Long prompts
    BUS = "bus"          # Batch requests
    AMBULANCE = "ambulance"  # Priority/streaming

class LaneStatus(str, Enum):
    ACTIVE = "active"
    SCALING = "scaling"
    CLOSED = "closed"

class GameMode(str, Enum):
    MORNING = "morning"
    RUSH = "rush"
    CONVOY = "convoy"
    NIGHT = "night"
    CONSTRUCTION = "construction"
    SPEED = "speed"

class SpawnRequest(BaseModel):
    vehicleType: VehicleType

class GameModeRequest(BaseModel):
    mode: Optional[GameMode] = None

class Vehicle(BaseModel):
    id: str
    type: VehicleType
    laneId: str
    position: float
    speed: float
    promptTokens: int
    generatedTokens: int
    cached: bool = False

class Lane(BaseModel):
    id: str
    replicaName: str
    status: LaneStatus
    load: float  # 0-100
    requestsPerSec: float
    currentVehicles: int

class Metrics(BaseModel):
    throughput: float
    avgLatency: float
    cacheHitRate: float
    activeLanes: int
    totalLanes: int
    totalRequests: int
    totalTokens: int

class InferenceRequest(BaseModel):
    prompt: str
    maxTokens: int
    priority: bool = False
