import asyncio
import time
import random
import uuid
import os
from typing import Dict, List, Optional
from openai import AsyncOpenAI

from models import (
    VehicleType, LaneStatus, Vehicle, Lane, Metrics
)

class TrafficManager:
    def __init__(self):
        self.vehicles: Dict[str, Vehicle] = {}
        self.lanes: Dict[str, Lane] = {}
        self.auto_spawn_rate = 50  # 0-100
        self.metrics_history = []
        self.total_requests = 0
        self.total_tokens = 0
        self.cache_hits = 0
        self.similar_prompts_cache = {}

        # Initialize vLLM clients
        self.vllm_clients = self._init_vllm_clients()

        # Initialize lanes
        self._init_lanes()

    def _init_vllm_clients(self) -> Dict[str, AsyncOpenAI]:
        """Initialize vLLM client connections"""
        clients = {}

        # For now, use single vllm-server endpoint for all replicas
        # In production with LLM-D, each would be a separate replica
        base_url = os.getenv("VLLM_REPLICA_1_URL", "http://vllm-server:8000/v1")

        for i in range(1, 4):
            replica_url = os.getenv(f"VLLM_REPLICA_{i}_URL", base_url)
            clients[f"replica-{i}"] = AsyncOpenAI(
                api_key="EMPTY",
                base_url=replica_url
            )

        return clients

    def _init_lanes(self):
        """Initialize highway lanes"""
        self.lanes = {
            "replica-1": Lane(
                id="replica-1",
                replicaName="Replica 1",
                status=LaneStatus.ACTIVE,
                load=0,
                requestsPerSec=0,
                currentVehicles=0
            ),
            "replica-2": Lane(
                id="replica-2",
                replicaName="Replica 2",
                status=LaneStatus.ACTIVE,
                load=0,
                requestsPerSec=0,
                currentVehicles=0
            ),
            "replica-3": Lane(
                id="replica-3",
                replicaName="Replica 3",
                status=LaneStatus.CLOSED,  # Start with one closed
                load=0,
                requestsPerSec=0,
                currentVehicles=0
            ),
        }

    def spawn_vehicle(self, vehicle_type: VehicleType, use_similar_prompt: bool = False) -> Vehicle:
        """Spawn a new vehicle (inference request)"""
        vehicle_id = str(uuid.uuid4())

        # Generate prompt based on vehicle type
        prompt, max_tokens = self._generate_prompt(vehicle_type, use_similar_prompt)

        # Assign to lane (load balancing)
        lane_id = self._select_lane(vehicle_type)

        # Create vehicle
        vehicle = Vehicle(
            id=vehicle_id,
            type=vehicle_type,
            laneId=lane_id,
            position=0.0,
            speed=self._get_vehicle_speed(vehicle_type),
            promptTokens=len(prompt.split()),
            generatedTokens=0,
            cached=use_similar_prompt and prompt in self.similar_prompts_cache
        )

        self.vehicles[vehicle_id] = vehicle

        # Increment lane vehicle count
        if lane_id in self.lanes:
            self.lanes[lane_id].currentVehicles += 1

        # Start inference task
        asyncio.create_task(self._run_inference(vehicle, prompt, max_tokens))

        return vehicle

    def _generate_prompt(self, vehicle_type: VehicleType, use_similar: bool) -> tuple[str, int]:
        """Generate prompt and max_tokens based on vehicle type"""
        prompts = {
            VehicleType.SPORT: ("What is 2+2?", 10),
            VehicleType.CAR: ("Explain quantum computing in simple terms.", 100),
            VehicleType.TRUCK: ("Write a detailed essay about the history of computing.", 500),
            VehicleType.BUS: ("Generate 10 product descriptions for smartwatches.", 200),
            VehicleType.AMBULANCE: ("URGENT: Summarize this medical report immediately.", 50)
        }

        base_prompt, max_tokens = prompts.get(vehicle_type, prompts[VehicleType.CAR])

        if use_similar:
            # Use cached prompt for cache-aware routing demo
            if vehicle_type not in self.similar_prompts_cache:
                self.similar_prompts_cache[vehicle_type] = base_prompt
            return self.similar_prompts_cache[vehicle_type], max_tokens

        return base_prompt, max_tokens

    def _select_lane(self, vehicle_type: VehicleType) -> str:
        """Select lane for vehicle (load balancing)"""
        # Simple round-robin for active lanes
        active_lanes = [lid for lid, lane in self.lanes.items() if lane.status == LaneStatus.ACTIVE]

        if not active_lanes:
            return "replica-1"  # Fallback

        # Find least loaded lane
        return min(active_lanes, key=lambda lid: self.lanes[lid].load)

    def _get_vehicle_speed(self, vehicle_type: VehicleType) -> float:
        """Get vehicle speed multiplier"""
        speeds = {
            VehicleType.SPORT: 5.0,
            VehicleType.CAR: 3.0,
            VehicleType.TRUCK: 1.5,
            VehicleType.BUS: 2.0,
            VehicleType.AMBULANCE: 7.0
        }
        return speeds.get(vehicle_type, 3.0)

    async def _run_inference(self, vehicle: Vehicle, prompt: str, max_tokens: int):
        """Run actual vLLM inference"""
        try:
            client = self.vllm_clients.get(vehicle.laneId)
            if not client:
                return

            start_time = time.time()

            # Stream tokens
            stream = await client.chat.completions.create(
                model=os.getenv("MODEL_NAME", "mistralai/Mistral-7B-Instruct-v0.3"),
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                stream=True,
                temperature=0.7
            )

            token_count = 0
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    token_count += 1
                    vehicle.generatedTokens = token_count
                    # Update position (0.0 to 1.0 based on progress)
                    vehicle.position = min(1.0, token_count / max_tokens)

            # Update metrics
            latency = time.time() - start_time
            self.total_requests += 1
            self.total_tokens += token_count

            if vehicle.cached:
                self.cache_hits += 1

        except Exception as e:
            print(f"Inference error for vehicle {vehicle.id}: {e}")
        finally:
            # Remove vehicle
            if vehicle.id in self.vehicles:
                del self.vehicles[vehicle.id]
            if vehicle.laneId in self.lanes:
                self.lanes[vehicle.laneId].currentVehicles = max(0, self.lanes[vehicle.laneId].currentVehicles - 1)

    def set_auto_spawn_rate(self, rate: int):
        """Set automatic vehicle spawn rate (0-100)"""
        self.auto_spawn_rate = max(0, min(100, rate))

    async def close_lane(self, lane_id: str):
        """Close a lane (simulate replica shutdown)"""
        if lane_id in self.lanes:
            self.lanes[lane_id].status = LaneStatus.CLOSED
            self.lanes[lane_id].load = 0

    async def open_lane(self, lane_id: str):
        """Open a lane (simulate replica startup)"""
        if lane_id in self.lanes:
            self.lanes[lane_id].status = LaneStatus.SCALING
            await asyncio.sleep(3)  # Simulate startup time
            self.lanes[lane_id].status = LaneStatus.ACTIVE

    def update_metrics(self):
        """Update lane metrics"""
        for lane in self.lanes.values():
            if lane.status == LaneStatus.ACTIVE:
                # Simulate load based on current vehicles
                lane.load = min(100, (lane.currentVehicles / 10) * 100)
                lane.requestsPerSec = lane.currentVehicles * random.uniform(0.8, 1.2)

        # Auto-scaling logic
        avg_load = sum(l.load for l in self.lanes.values() if l.status == LaneStatus.ACTIVE) / max(1, len([l for l in self.lanes.values() if l.status == LaneStatus.ACTIVE]))

        if avg_load > 80:
            # Open a closed lane
            for lane in self.lanes.values():
                if lane.status == LaneStatus.CLOSED:
                    asyncio.create_task(self.open_lane(lane.id))
                    break

        elif avg_load < 20:
            # Close an active lane (scale to zero)
            active_lanes = [l for l in self.lanes.values() if l.status == LaneStatus.ACTIVE]
            if len(active_lanes) > 1:
                asyncio.create_task(self.close_lane(active_lanes[-1].id))

    def get_metrics(self) -> Metrics:
        """Get current metrics"""
        active_lanes = len([l for l in self.lanes.values() if l.status == LaneStatus.ACTIVE])

        return Metrics(
            throughput=sum(l.requestsPerSec for l in self.lanes.values()),
            avgLatency=random.uniform(0.5, 2.0),  # TODO: Calculate from actual requests
            cacheHitRate=(self.cache_hits / max(1, self.total_requests)) * 100,
            activeLanes=active_lanes,
            totalLanes=len(self.lanes),
            totalRequests=self.total_requests,
            totalTokens=self.total_tokens
        )

    def get_lanes(self) -> List[Lane]:
        """Get all lanes"""
        return list(self.lanes.values())

    async def run(self):
        """Main traffic simulation loop"""
        while True:
            await asyncio.sleep(max(0.5, 3 - (self.auto_spawn_rate / 50)))

            # Auto-spawn vehicles
            if self.auto_spawn_rate > 0:
                # Spawn based on rate
                if random.random() < (self.auto_spawn_rate / 100):
                    vehicle_type = random.choice(list(VehicleType))
                    self.spawn_vehicle(vehicle_type)
