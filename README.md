# AI Highway - LLM-D Traffic Control Demo

An interactive highway traffic simulation demonstrating distributed LLM inference with LLM-D.

## Concept

Watch AI inference requests flow like vehicles on a highway. LLM-D intelligently routes traffic across multiple vLLM replicas, auto-scales lanes under load, and optimizes with cache-aware routing.

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

- **Frontend**: React + PixiJS (WebGL) + Tailwind CSS
- **Backend**: FastAPI + LLM-D integration
- **Inference**: vLLM replicas (Mistral-Small-24B-Instruct)
- **Deployment**: OpenShift with auto-scaling

## Architecture

```
User → Frontend (Highway Visualization)
         ↓
    Backend (Traffic Controller)
         ↓
    LLM-D Router (Smart Routing)
         ↓
    vLLM Replicas (Highway Lanes)
```

## Game Modes

1. 🌅 **Morning Commute** - Gradual traffic increase
2. 🚨 **Rush Hour Chaos** - Maximum stress test
3. 🚗 **Road Trip Convoy** - Test cache-aware routing
4. 🌙 **Late Night** - Demonstrate scale-to-zero
5. 🏗️ **Construction Zone** - Replica failure handling
6. ⚡ **Speed Demon** - Throughput competition

## Installation

See individual frontend and backend READMEs for setup instructions.
