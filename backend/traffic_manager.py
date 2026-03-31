import asyncio
import time
import random
import uuid
import os
from typing import Dict, List, Optional
from openai import AsyncOpenAI
from collections import deque

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

        # Real metrics tracking
        self.latency_window = deque(maxlen=100)  # Last 100 requests
        self.replica_queue_depth = {"replica-1": 0, "replica-2": 0, "replica-3": 0}
        self.replica_total_requests = {"replica-1": 0, "replica-2": 0, "replica-3": 0}

        # Prefix cache tracking for smart routing
        self.prompt_to_replica = {}  # Map similar prompts to replicas for cache hits

        # Track start time for throughput calculations
        self.start_time = time.time()

        # Initialize vLLM clients
        self.vllm_clients = self._init_vllm_clients()

        # Initialize lanes
        self._init_lanes()

    def _init_vllm_clients(self) -> Dict[str, AsyncOpenAI]:
        """Initialize vLLM client connections - 3 separate vLLM instances"""
        clients = {}

        # Three separate vLLM endpoints on different ports
        replica_urls = {
            "replica-1": os.getenv("VLLM_REPLICA_1_URL", "http://localhost:8001/v1"),
            "replica-2": os.getenv("VLLM_REPLICA_2_URL", "http://localhost:8002/v1"),
            "replica-3": os.getenv("VLLM_REPLICA_3_URL", "http://localhost:8003/v1"),
        }

        for replica_id, url in replica_urls.items():
            clients[replica_id] = AsyncOpenAI(
                api_key="EMPTY",
                base_url=url,
                timeout=30.0
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

        # Check if this will be a cache hit
        is_cached = prompt in self.prompt_to_replica

        # Assign to lane (smart load balancing + cache-aware routing)
        lane_id = self._select_lane(vehicle_type, prompt)

        # Create vehicle
        vehicle = Vehicle(
            id=vehicle_id,
            type=vehicle_type,
            laneId=lane_id,
            position=0.0,
            speed=self._get_vehicle_speed(vehicle_type),
            promptTokens=len(prompt.split()),
            generatedTokens=0,
            cached=is_cached
        )

        self.vehicles[vehicle_id] = vehicle

        # Increment lane vehicle count and queue depth
        if lane_id in self.lanes:
            self.lanes[lane_id].currentVehicles += 1
            self.replica_queue_depth[lane_id] += 1

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

    def _select_lane(self, vehicle_type: VehicleType, prompt: str = "") -> str:
        """Select lane for vehicle (smart load balancing + cache-aware routing)"""
        active_lanes = [lid for lid, lane in self.lanes.items() if lane.status == LaneStatus.ACTIVE]

        if not active_lanes:
            return "replica-1"  # Fallback

        # CACHE-AWARE ROUTING: Check if similar prompt was sent before
        # Route to the same replica for prefix cache hits
        if prompt and prompt in self.prompt_to_replica:
            cached_replica = self.prompt_to_replica[prompt]
            if cached_replica in active_lanes:
                # Cache hit! Route to same replica
                return cached_replica

        # LOAD BALANCING: Find least loaded lane based on queue depth
        selected_lane = min(active_lanes, key=lambda lid: self.replica_queue_depth.get(lid, 0))

        # Remember this prompt -> replica mapping for future cache hits
        if prompt:
            self.prompt_to_replica[prompt] = selected_lane

        return selected_lane

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
        """Run actual vLLM inference and collect real metrics"""
        lane_id = vehicle.laneId
        start_time = time.time()

        try:
            client = self.vllm_clients.get(lane_id)
            if not client:
                print(f"No client for lane {lane_id}")
                return

            # Stream tokens from vLLM
            stream = await client.chat.completions.create(
                model=os.getenv("MODEL_NAME", "Qwen/Qwen2.5-0.5B-Instruct"),
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                stream=True,
                temperature=0.7
            )

            token_count = 0
            first_token_time = None

            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    if first_token_time is None:
                        first_token_time = time.time()

                    token_count += 1
                    vehicle.generatedTokens = token_count
                    # Update position (0.0 to 1.0 based on progress)
                    vehicle.position = min(1.0, token_count / max_tokens)

            # Calculate real metrics
            end_time = time.time()
            total_latency = end_time - start_time
            ttft = (first_token_time - start_time) if first_token_time else total_latency

            # Record metrics
            self.latency_window.append(total_latency)
            self.total_requests += 1
            self.total_tokens += token_count
            self.replica_total_requests[lane_id] += 1

            if vehicle.cached:
                self.cache_hits += 1
                print(f"✅ Cache hit! Vehicle {vehicle.id[:8]} routed to {lane_id} (TTFT: {ttft:.3f}s)")
            else:
                print(f"🚗 Vehicle {vehicle.id[:8]} completed on {lane_id} ({token_count} tokens, {total_latency:.2f}s)")

        except Exception as e:
            print(f"❌ Inference error for vehicle {vehicle.id} on {lane_id}: {e}")
        finally:
            # Decrement queue depth
            if lane_id in self.replica_queue_depth:
                self.replica_queue_depth[lane_id] = max(0, self.replica_queue_depth[lane_id] - 1)

            # Remove vehicle
            if vehicle.id in self.vehicles:
                del self.vehicles[vehicle.id]
            if lane_id in self.lanes:
                self.lanes[lane_id].currentVehicles = max(0, self.lanes[lane_id].currentVehicles - 1)

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
        """Update lane metrics based on real queue depth and request data"""
        for lane_id, lane in self.lanes.items():
            if lane.status == LaneStatus.ACTIVE:
                # Real load based on queue depth (normalize to 0-100)
                queue_depth = self.replica_queue_depth.get(lane_id, 0)
                lane.load = min(100, (queue_depth / 5) * 100)  # 5+ requests = 100% load

                # Calculate requests/sec (moving average)
                total_reqs = self.replica_total_requests.get(lane_id, 0)
                lane.requestsPerSec = total_reqs / max(1, time.time() - getattr(self, 'start_time', time.time()))

        # Auto-scaling logic based on real load
        active_lanes_list = [l for l in self.lanes.values() if l.status == LaneStatus.ACTIVE]
        if not active_lanes_list:
            return

        avg_load = sum(l.load for l in active_lanes_list) / len(active_lanes_list)

        # Scale up if average load > 70%
        if avg_load > 70:
            for lane in self.lanes.values():
                if lane.status == LaneStatus.CLOSED:
                    print(f"📈 Auto-scaling UP: Opening {lane.id} (avg load: {avg_load:.1f}%)")
                    asyncio.create_task(self.open_lane(lane.id))
                    break

        # Scale down if average load < 15% and we have multiple replicas
        elif avg_load < 15 and len(active_lanes_list) > 1:
            print(f"📉 Auto-scaling DOWN: Closing replica (avg load: {avg_load:.1f}%)")
            asyncio.create_task(self.close_lane(active_lanes_list[-1].id))

    def get_metrics(self) -> Metrics:
        """Get current metrics from real inference data"""
        active_lanes = len([l for l in self.lanes.values() if l.status == LaneStatus.ACTIVE])

        # Calculate real average latency from recent requests
        avg_latency = sum(self.latency_window) / len(self.latency_window) if self.latency_window else 0.0

        # Calculate throughput based on requests per lane
        total_throughput = sum(l.requestsPerSec for l in self.lanes.values())

        return Metrics(
            throughput=total_throughput,
            avgLatency=avg_latency,
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
