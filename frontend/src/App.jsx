import { useState, useEffect } from 'react'
import PromptInput from './components/PromptInput'
import NetworkVisual from './components/NetworkVisual'
import InfoModal from './components/InfoModal'

function App() {
  const [metrics, setMetrics] = useState({
    throughput: 0,
    avgLatency: 0,
    cacheHitRate: 0,
    activeLanes: 0,
    totalLanes: 3,
    totalRequests: 0,
    totalTokens: 0
  })
  const [lanes, setLanes] = useState([
    { id: 'replica-1', replicaName: 'Replica 1', status: 'active', load: 0, requestsPerSec: 0, currentVehicles: 0 },
    { id: 'replica-2', replicaName: 'Replica 2', status: 'active', load: 0, requestsPerSec: 0, currentVehicles: 0 },
    { id: 'replica-3', replicaName: 'Replica 3', status: 'closed', load: 0, requestsPerSec: 0, currentVehicles: 0 }
  ])
  const [lastActivity, setLastActivity] = useState(null)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [infoTopic, setInfoTopic] = useState('router')
  const [recentActivities, setRecentActivities] = useState([])

  // WebSocket connection for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/traffic`

    const ws = new WebSocket(wsUrl)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'metrics') {
        setMetrics(data.metrics)
      } else if (data.type === 'lanes') {
        setLanes(data.lanes)
      } else if (data.type === 'activity') {
        setLastActivity(data.activity)

        const newActivity = {
          id: Date.now(),
          message: data.activity.cached
            ? `✅ Cache hit → ${data.activity.replicaName} (${data.activity.ttft?.toFixed(3)}s)`
            : `🔀 Routed → ${data.activity.replicaName}`,
          timestamp: new Date().toLocaleTimeString()
        }
        setRecentActivities(prev => [newActivity, ...prev].slice(0, 5))
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => ws.close()
  }, [])

  const handleSendPrompt = async (prompt) => {
    try {
      const response = await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleType: 'car',
          customPrompt: prompt
        })
      })

      if (!response.ok) throw new Error('Failed to send prompt')
    } catch (err) {
      console.error('Failed to send prompt:', err)
    }
  }

  const handleBatch = async (prompt, count) => {
    try {
      for (let i = 0; i < count; i++) {
        await fetch('/api/spawn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleType: 'car',
            customPrompt: prompt
          })
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (err) {
      console.error('Failed to send batch:', err)
    }
  }

  const handleStressTest = async () => {
    try {
      const vehicleTypes = ['sport', 'car', 'truck', 'bus', 'ambulance']

      for (let i = 0; i < 50; i++) {
        const vehicleType = vehicleTypes[i % vehicleTypes.length]
        fetch('/api/spawn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleType })
        }).catch(err => console.error('Spawn failed:', err))

        await new Promise(resolve => setTimeout(resolve, 50))
      }
    } catch (err) {
      console.error('Failed to run stress test:', err)
    }
  }

  const handleCacheTest = async () => {
    try {
      const promptA = 'Explain quantum computing in simple terms.'
      const promptB = 'What is artificial intelligence?'

      await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType: 'car', customPrompt: promptA })
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType: 'car', customPrompt: promptB })
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType: 'car', customPrompt: promptA })
      })
    } catch (err) {
      console.error('Failed to run cache test:', err)
    }
  }

  const showInfo = (topic) => {
    setInfoTopic(topic)
    setInfoModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col">
      {/* Header with gradient */}
      <header className="relative bg-gradient-to-r from-black via-gray-900 to-black border-b border-redhat-red/30 shadow-2xl backdrop-blur-xl flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-redhat-red/10 via-transparent to-redhat-red/10" />
        <div className="relative container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-redhat-red to-pink-600 flex items-center justify-center shadow-lg shadow-redhat-red/50">
                <span className="text-2xl">🚦</span>
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  LLM Traffic Control
                </h1>
                <p className="text-gray-400 text-xs mt-0.5">
                  Real-time distributed inference visualization
                </p>
              </div>
            </div>
            <button
              onClick={() => showInfo('llmd')}
              className="glass hover:bg-white/10 transition-all rounded-xl px-4 py-2 text-sm border border-white/10 shadow-lg backdrop-blur-xl"
            >
              <span className="mr-2">ℹ️</span> About LLM-D
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Left Sidebar - Controls & Metrics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Prompt Input */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-gray-900/90 to-gray-950/90">
              <div className="absolute inset-0 bg-gradient-to-br from-redhat-red/5 via-transparent to-blue-500/5" />
              <div className="relative p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-xl">✍️</span> Send Prompt
                  </h3>
                  <button
                    onClick={() => showInfo('router')}
                    className="text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    ℹ️
                  </button>
                </div>
                <PromptInput
                  onSendPrompt={handleSendPrompt}
                  onBatch={handleBatch}
                  onStressTest={handleStressTest}
                  onCacheTest={handleCacheTest}
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-gray-900/90 to-gray-950/90">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-purple-500/5" />
              <div className="relative p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="text-xl">📊</span> Metrics
                  </h3>
                  <button
                    onClick={() => showInfo('metrics')}
                    className="text-gray-400 hover:text-white text-xs transition-colors"
                  >
                    ℹ️
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-red-900/20 to-red-950/20 p-3 text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                      {metrics.throughput.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">tok/s</div>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-green-900/20 to-emerald-950/20 p-3 text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                      {metrics.cacheHitRate.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Cache</div>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-blue-900/20 to-blue-950/20 p-3 text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                      {metrics.avgLatency.toFixed(2)}s
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Latency</div>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-purple-900/20 to-purple-950/20 p-3 text-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                      {metrics.activeLanes}/{metrics.totalLanes}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Active</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Total Requests:</span>
                    <span className="text-white font-semibold">{metrics.totalRequests}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Total Tokens:</span>
                    <span className="text-white font-semibold">{metrics.totalTokens.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl bg-gradient-to-br from-gray-900/90 to-gray-950/90 flex-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
              <div className="relative p-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <span className="text-xl">📡</span> Recent Activity
                </h3>
                <div className="space-y-2">
                  {recentActivities.length === 0 ? (
                    <div className="text-xs text-gray-500 text-center py-8">
                      Waiting for activity...
                    </div>
                  ) : (
                    recentActivities.map(activity => (
                      <div key={activity.id} className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-3 text-xs backdrop-blur-sm animate-fadeIn">
                        <div className="text-gray-200">{activity.message}</div>
                        <div className="text-gray-500 text-xs mt-1">{activity.timestamp}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right - Network Visualization */}
          <div className="lg:col-span-3">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-950/50 backdrop-blur-xl" />
              <div className="relative h-full flex flex-col p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🕸️</span> Request Flow Network
                  </h3>
                  <button
                    onClick={() => showInfo('caching')}
                    className="text-gray-400 hover:text-white text-sm transition-colors glass rounded-lg px-3 py-1.5 border border-white/10"
                  >
                    ℹ️ Learn More
                  </button>
                </div>
                <div className="flex-1">
                  <NetworkVisual lanes={lanes} lastActivity={lastActivity} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 border-t border-white/10 bg-black/50 backdrop-blur-xl flex-shrink-0">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-500">
              Powered by <span className="text-redhat-red font-semibold">LLM-D</span> + vLLM • Real distributed inference
            </div>
            <div className="flex gap-4 text-gray-400">
              <button onClick={() => showInfo('router')} className="hover:text-white transition-colors">
                How It Works
              </button>
              <button onClick={() => showInfo('caching')} className="hover:text-white transition-colors">
                Prefix Caching
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Info Modal */}
      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        topic={infoTopic}
      />
    </div>
  )
}

export default App
