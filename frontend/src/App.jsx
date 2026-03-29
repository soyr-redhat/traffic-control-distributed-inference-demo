import { useState, useEffect } from 'react'
import Highway from './components/Highway'
import ControlPanel from './components/ControlPanel'
import MetricsPanel from './components/MetricsPanel'
import GameModeSelector from './components/GameModeSelector'

function App() {
  const [trafficIntensity, setTrafficIntensity] = useState(50)
  const [gameMode, setGameMode] = useState(null)
  const [metrics, setMetrics] = useState({
    throughput: 0,
    avgLatency: 0,
    cacheHitRate: 0,
    activeLanes: 0,
    totalLanes: 3
  })
  const [lanes, setLanes] = useState([
    { id: 'replica-1', status: 'active', load: 0, requestsPerSec: 0 },
    { id: 'replica-2', status: 'active', load: 0, requestsPerSec: 0 },
    { id: 'replica-3', status: 'closed', load: 0, requestsPerSec: 0 }
  ])

  // WebSocket connection for real-time updates
  useEffect(() => {
    // Use relative WebSocket URL (nginx will proxy it)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/traffic`

    const ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'metrics') {
        setMetrics(data.metrics)
      } else if (data.type === 'lanes') {
        setLanes(data.lanes)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => ws.close()
  }, [])

  const handleSpawnVehicle = (type) => {
    fetch('/api/spawn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicleType: type })
    }).catch(err => console.error('Failed to spawn vehicle:', err))
  }

  const handleGameModeChange = (mode) => {
    setGameMode(mode)
    fetch('/api/game-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    }).catch(err => console.error('Failed to set game mode:', err))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-redhat-red/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                <span className="text-redhat-red">🚦</span> AI Highway
              </h1>
              <p className="text-gray-400 text-sm font-text mt-1">
                LLM-D Distributed Inference Traffic Control
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-400">Pillar 4</div>
                <div className="text-sm font-semibold text-redhat-red">LLMs at Scale</div>
              </div>
              <div className="w-12 h-12 bg-redhat-red rounded-lg flex items-center justify-center">
                <span className="text-2xl">🚗</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Game Mode Selector */}
        <GameModeSelector
          currentMode={gameMode}
          onModeChange={handleGameModeChange}
        />

        {/* Control Panel */}
        <ControlPanel
          trafficIntensity={trafficIntensity}
          onIntensityChange={setTrafficIntensity}
          onSpawnVehicle={handleSpawnVehicle}
        />

        {/* Highway Visualization */}
        <div className="glass rounded-2xl p-6">
          <Highway
            lanes={lanes}
            trafficIntensity={trafficIntensity}
            gameMode={gameMode}
          />
        </div>

        {/* Metrics Panel */}
        <MetricsPanel metrics={metrics} lanes={lanes} />
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
          <p>Powered by <span className="text-redhat-red font-semibold">LLM-D</span> + vLLM on OpenShift</p>
          <p className="mt-1">Built with PixiJS, React, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  )
}

export default App
