import { useState, useEffect } from 'react'
import ChatInput from './components/ChatInput'
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

  // WebSocket connection
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
      await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType: 'car', customPrompt: prompt })
      })
    } catch (err) {
      console.error('Failed:', err)
    }
  }

  const handleBatch = async (prompt, count) => {
    try {
      for (let i = 0; i < count; i++) {
        await fetch('/api/spawn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleType: 'car', customPrompt: prompt })
        })
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (err) {
      console.error('Failed:', err)
    }
  }

  const handleStressTest = async () => {
    try {
      const vehicleTypes = ['sport', 'car', 'truck', 'bus', 'ambulance']
      for (let i = 0; i < 50; i++) {
        fetch('/api/spawn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleType: vehicleTypes[i % vehicleTypes.length] })
        }).catch(console.error)
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    } catch (err) {
      console.error('Failed:', err)
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
      console.error('Failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col relative">
      {/* Grid Background */}
      <div className="grid-background" />

      {/* Header */}
      <header className="relative bg-black/50 backdrop-blur-lg border-b border-redhat-red/30 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-redhat-red flex items-center justify-center">
                <span className="text-2xl">🚦</span>
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white">
                  LLM Traffic Control
                </h1>
                <p className="text-gray-400 text-sm">
                  Real-time distributed inference monitoring
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setInfoTopic('llmd')
                setInfoModalOpen(true)
              }}
              className="glass hover:bg-white/10 transition-all rounded-lg px-4 py-2 text-sm"
            >
              <span className="mr-2">ℹ️</span> About LLM-D
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Metrics */}
        <div className="w-72 border-r border-white/10 bg-black/30 backdrop-blur-sm p-4 space-y-4 overflow-y-auto flex-shrink-0">
          {/* Metrics */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Metrics</h3>
              <button
                onClick={() => {
                  setInfoTopic('metrics')
                  setInfoModalOpen(true)
                }}
                className="text-gray-400 hover:text-white text-xs"
              >
                ℹ️
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-lg p-2.5 text-center">
                <div className="text-xl font-bold text-redhat-red">
                  {metrics.throughput.toFixed(1)}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">tok/s</div>
              </div>
              <div className="glass rounded-lg p-2.5 text-center">
                <div className="text-xl font-bold text-green-400">
                  {metrics.cacheHitRate.toFixed(0)}%
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Cache</div>
              </div>
              <div className="glass rounded-lg p-2.5 text-center">
                <div className="text-xl font-bold text-blue-400">
                  {metrics.avgLatency.toFixed(2)}s
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Latency</div>
              </div>
              <div className="glass rounded-lg p-2.5 text-center">
                <div className="text-xl font-bold text-purple-400">
                  {metrics.activeLanes}/{metrics.totalLanes}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Active</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-400">Requests:</span>
                <span className="text-white font-semibold">{metrics.totalRequests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tokens:</span>
                <span className="text-white font-semibold">{metrics.totalTokens.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recentActivities.length === 0 ? (
                <div className="text-xs text-gray-500 text-center py-4">
                  Waiting for activity...
                </div>
              ) : (
                recentActivities.map(activity => (
                  <div key={activity.id} className="glass rounded-lg px-2.5 py-2 text-xs animate-fadeIn">
                    <div className="text-gray-200">{activity.message}</div>
                    <div className="text-gray-500 mt-0.5">{activity.timestamp}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Help Links */}
          <div className="pt-3 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-2">Learn More</div>
            <div className="space-y-1.5">
              <button
                onClick={() => { setInfoTopic('router'); setInfoModalOpen(true); }}
                className="w-full text-left glass hover:bg-white/10 rounded-lg px-2.5 py-2 text-xs transition-all"
              >
                🧠 How Routing Works
              </button>
              <button
                onClick={() => { setInfoTopic('caching'); setInfoModalOpen(true); }}
                className="w-full text-left glass hover:bg-white/10 rounded-lg px-2.5 py-2 text-xs transition-all"
              >
                ⚡ Prefix Caching
              </button>
            </div>
          </div>
        </div>

        {/* Center - Network Visualization & Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Network Visualization */}
          <div className="flex-1 p-4 min-h-0">
            <NetworkVisual lanes={lanes} lastActivity={lastActivity} />
          </div>

          {/* Chat Input - Bottom Center */}
          <div className="p-4 pt-0">
            <ChatInput
              onSendPrompt={handleSendPrompt}
              onBatch={handleBatch}
              onStressTest={handleStressTest}
              onCacheTest={handleCacheTest}
            />
          </div>
        </div>
      </div>

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
