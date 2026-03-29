# AI Highway - Deployment Guide

## Prerequisites

- OpenShift cluster with GPU nodes
- `oc` CLI configured and authenticated
- vLLM server running (see main README for setup)

## Quick Start

### 1. Deploy to OpenShift

```bash
# From the 4_traffic_control directory
oc apply -k deployment/
```

This will:
- Create `traffic-control` namespace
- Deploy backend API server
- Deploy frontend web app
- Create route for external access

### 2. Get the Route URL

```bash
oc get route traffic-control -n traffic-control -o jsonpath='{.spec.host}'
```

### 3. Access the Demo

Open the route URL in your browser. You should see the AI Highway traffic control interface.

## Local Development

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env to point to your vLLM server
# VLLM_REPLICA_1_URL=http://localhost:8000/v1

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

## Docker Compose (Local Testing)

```bash
# From the 4_traffic_control directory
docker compose up --build
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Building Images

### Backend

```bash
cd backend
podman build -t traffic-control-backend:latest -f Containerfile .
```

### Frontend

```bash
cd frontend
podman build -t traffic-control-frontend:latest -f Containerfile .
```

## Configuration

### Environment Variables

**Backend** (`.env`):
```bash
VLLM_REPLICA_1_URL=http://vllm-server:8000/v1
VLLM_REPLICA_2_URL=http://vllm-server:8000/v1
VLLM_REPLICA_3_URL=http://vllm-server:8000/v1
MODEL_NAME=RedHatAI/Mistral-Small-24B-Instruct-2501-quantized.w4a16
```

**Frontend** (`.env`):
```bash
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## Connecting to vLLM Server

The demo connects to your existing `vllm-server` deployment in the `user-sbowerma` namespace.

Update the ConfigMap in `deployment/kustomization.yaml` to point to your vLLM server:

```yaml
configMapGenerator:
  - name: traffic-control-config
    literals:
      - VLLM_REPLICA_1_URL=http://vllm-server.user-sbowerma.svc.cluster.local:8000/v1
```

## Troubleshooting

### Backend won't start

Check vLLM server connectivity:
```bash
oc logs -n traffic-control deployment/traffic-control-backend
```

### Frontend shows connection errors

Check backend service:
```bash
oc get svc -n traffic-control
oc get pods -n traffic-control
```

### WebSocket connection fails

Ensure the route supports WebSocket connections. Check route configuration:
```bash
oc get route traffic-control -n traffic-control -o yaml
```

## Next Steps

- Integrate with LLM-D for true distributed routing
- Add multiple vLLM replicas
- Implement horizontal pod autoscaling
- Add Prometheus metrics
