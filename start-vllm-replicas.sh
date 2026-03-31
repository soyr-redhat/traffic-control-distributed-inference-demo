#!/bin/bash

# Start 3 vLLM replicas on one GPU with Qwen2.5-0.5B-Instruct
# Each uses ~1GB GPU memory, totaling ~3GB

MODEL="Qwen/Qwen2.5-0.5B-Instruct"

echo "🚀 Starting vLLM Replica 1 (Standard) on port 8001..."
vllm serve $MODEL \
  --port 8001 \
  --gpu-memory-utilization 0.25 \
  --max-model-len 512 \
  --dtype auto &

echo "🚀 Starting vLLM Replica 2 (High Capacity) on port 8002..."
vllm serve $MODEL \
  --port 8002 \
  --gpu-memory-utilization 0.3 \
  --max-model-len 1024 \
  --dtype auto &

echo "🚀 Starting vLLM Replica 3 (Cache-Optimized) on port 8003..."
vllm serve $MODEL \
  --port 8003 \
  --gpu-memory-utilization 0.25 \
  --max-model-len 512 \
  --enable-prefix-caching \
  --dtype auto &

echo ""
echo "✅ All replicas starting..."
echo "📊 Check status:"
echo "   - Replica 1: http://localhost:8001/health"
echo "   - Replica 2: http://localhost:8002/health"
echo "   - Replica 3: http://localhost:8003/health"
echo ""
echo "Press Ctrl+C to stop all replicas"

# Wait for all background processes
wait
