# AI Highway - Distributed Inference Traffic Simulator

An interactive "Black Friday" traffic simulation demonstrating **real** distributed LLM inference across multiple vLLM replicas.

## Concept

Watch real AI inference requests flow like vehicles on a highway. The system runs **3 separate vLLM instances** (Qwen2.5-0.5B-Instruct) on a single GPU, with intelligent routing, auto-scaling, and cache-aware optimization.

### What Makes This Demo Special

✅ **Real distributed inference** - Actually runs 3 vLLM replicas, not simulated  
✅ **Real metrics** - Latency, throughput, and cache hit rates from actual inference  
✅ **Smart routing** - Cache-aware routing sends similar prompts to the same replica  
✅ **Auto-scaling** - Lanes open/close based on real queue depth  
✅ **Tiny model** - Uses Qwen2.5-0.5B (~3GB total) so 3 replicas fit on one GPU

## Visual Experience

- **Top-down highway view** with realistic vehicle models
- **Multiple lanes** representing vLLM replicas
- **Smart routing** visualized as traffic control
- **Auto-scaling** shown as lanes opening/closing
- **Cache-aware routing** displayed as HOV/fast lanes

## Vehicle Types (Request Types)

| Vehicle | Request Size | Visual |
|---------|-------------|--------|
| Sport Car | Short prompts (1-50 tokens) | Small, fast, blue |
| Sedan | Medium prompts (50-200 tokens) | Standard, green |
| Truck | Long prompts (200-500 tokens) | Large, slow, orange |
| Bus | Batch requests | Long vehicle, purple |
| Ambulance | Priority/streaming | Flashing lights, red |

## Features

- **Interactive Traffic Spawner**: Click to spawn different vehicle types
- **Rush Hour Mode**: Stress test the system with traffic floods
- **Scale-to-Zero**: Watch lanes close when traffic is low
- **Cache Visualization**: See similar requests route to fast lanes
- **Performance Metrics**: Real-time throughput, latency, cache hit rate
- **Leaderboard**: Compete for highest throughput and efficiency

## Tech Stack

- **Frontend**: React + PixiJS (WebGL) + Tailwind CSS + WebSockets
- **Backend**: FastAPI + AsyncIO + Smart Router
- **Inference**: 3x vLLM (Qwen2.5-0.5B-Instruct)
- **Deployment**: OpenShift / Docker Compose
- **GPU**: Single GPU shared across all replicas (~3GB total)

## Architecture

```
User → Frontend (PixiJS Highway Visualization)
         ↓ WebSocket
    Backend (Traffic Manager + Smart Router)
         ↓ Load Balancing + Cache-Aware Routing
    ┌────────────────┬────────────────┬────────────────┐
    │  vLLM Replica 1│  vLLM Replica 2│  vLLM Replica 3│
    │   :8001        │   :8002        │   :8003        │
    │  Standard      │  High Capacity │  Cache-Opt     │
    │  (512 tokens)  │  (1024 tokens) │  (Prefix Cache)│
    └────────────────┴────────────────┴────────────────┘
              All running on same GPU!
```

### Routing Strategy

1. **Cache-Aware**: Similar prompts → same replica for cache hits
2. **Load Balancing**: New prompts → least loaded replica
3. **Auto-Scaling**: High load → open replica 3, Low load → close replicas

## What You'll See

### Real Metrics (Not Simulated!)

- **Latency**: Actual end-to-end inference time per request
- **Throughput**: Real tokens/second across all replicas
- **Cache Hit Rate**: Percentage of requests hitting prefix cache
- **Queue Depth**: Active requests per replica
- **Auto-Scaling**: Replicas opening/closing based on load

### Visible Behaviors

✅ **Similar prompts → same lane** (cache-aware routing)  
✅ **Lanes fill unevenly** (load balancing in action)  
✅ **Lane 3 opens during spikes** (auto-scaling)  
✅ **Cached requests are faster** (HOV lane / replica 3)  
✅ **Real latency variance** (network + inference + queue time)

## Game Modes

1. 🌅 **Morning Commute** - Gradual traffic increase (test auto-scaling)
2. 🚨 **Black Friday Rush** - Maximum stress test (all replicas maxed)
3. 🚗 **Road Trip Convoy** - Repeated prompts (demonstrate cache hits)
4. 🌙 **Late Night** - Scale-to-zero demonstration
5. 🏗️ **Construction Zone** - Replica failure handling
6. ⚡ **Speed Demon** - Compete for highest throughput

## Quick Start

### Local Development

**1. Start 3 vLLM Replicas**

```bash
# Option A: Using the helper script
./start-vllm-replicas.sh

# Option B: Using Docker Compose
docker compose -f docker-compose-vllm.yml up

# Option C: Manual startup
vllm serve Qwen/Qwen2.5-0.5B-Instruct --port 8001 --gpu-memory-utilization 0.25 --max-model-len 512 &
vllm serve Qwen/Qwen2.5-0.5B-Instruct --port 8002 --gpu-memory-utilization 0.3 --max-model-len 1024 &
vllm serve Qwen/Qwen2.5-0.5B-Instruct --port 8003 --gpu-memory-utilization 0.25 --enable-prefix-caching &
```

**2. Start Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

**3. Start Frontend**

```bash
cd frontend
npm install
npm run dev
```

**4. Open Demo**

Navigate to `http://localhost:5173` and watch real inference traffic!

### OpenShift Deployment

```bash
# Apply all resources
kubectl apply -f deployment/

# Wait for vLLM replicas to be ready (takes 2-3 minutes)
kubectl wait --for=condition=ready pod -l component=inference --timeout=300s

# Get the route URL
kubectl get route traffic-control
```

## Resource Requirements

- **GPU Memory**: ~3GB total (1GB per replica)
- **RAM**: ~4GB
- **Storage**: ~2GB (model cache)

Perfect for demos on a single GPU!
