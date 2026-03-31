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

        // Add to recent activities
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Compact Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-redhat-red/30 flex-shrink-0">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <span className="text-redhat-red">🚦</span> LLM Traffic Control
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">
                Watch requests flow through distributed inference
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => showInfo('llmd')}
                className="glass hover:bg-white/10 transition-all rounded-lg px-3 py-2 text-xs"
              >
                <span className="mr-1">ℹ️</span> About LLM-D
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Single Screen */}
      <div className="flex-1 container mx-auto px-6 py-4 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Left Column - Controls & Metrics */}
          <div className="space-y-4">
            {/* Prompt Input - Compact */}
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="text-redhat-red">✍️</span> Send Prompt
                <button
                  onClick={() => showInfo('router')}
                  className="ml-auto text-gray-400 hover:text-white text-xs"
                >
                  ℹ️
                </button>
              </h3>
              <PromptInput
                onSendPrompt={handleSendPrompt}
                onBatch={handleBatch}
                onStressTest={handleStressTest}
                onCacheTest={handleCacheTest}
              />
            </div>

            {/* Metrics - Compact */}
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="text-redhat-red">📊</span> Metrics
                <button
                  onClick={() => showInfo('metrics')}
                  className="ml-auto text-gray-400 hover:text-white text-xs"
                >
                  ℹ️
                </button>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="glass rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-redhat-red">
                    {metrics.throughput.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-400">tok/s</div>
                </div>
                <div className="glass rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-green-400">
                    {metrics.cacheHitRate.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-400">Cache</div>
                </div>
                <div className="glass rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {metrics.avgLatency.toFixed(2)}s
                  </div>
                  <div className="text-xs text-gray-400">Latency</div>
                </div>
                <div className="glass rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {metrics.activeLanes}/{metrics.totalLanes}
                  </div>
                  <div className="text-xs text-gray-400">Active</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Requests:</span>
                  <span className="text-white font-semibold">{metrics.totalRequests}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Tokens:</span>
                  <span className="text-white font-semibold">{metrics.totalTokens.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity - Compact */}
            <div className="glass rounded-xl p-4 flex-1">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="text-redhat-red">📡</span> Recent Activity
              </h3>
              <div className="space-y-2">
                {recentActivities.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-4">
                    Send a prompt to see activity...
                  </div>
                ) : (
                  recentActivities.map(activity => (
                    <div key={activity.id} className="glass rounded px-2 py-1.5 text-xs animate-fadeIn">
                      <div className="text-gray-200">{activity.message}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{activity.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Network Visualization (spans 2 columns) */}
          <div className="lg:col-span-2">
            <div className="glass rounded-xl p-4 h-full flex flex-col">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="text-redhat-red">🕸️</span> Request Flow Network
                <button
                  onClick={() => showInfo('caching')}
                  className="ml-auto text-gray-400 hover:text-white text-xs"
                >
                  ℹ️ Cache Info
                </button>
              </h3>
              <div className="flex-1">
                <NetworkVisual lanes={lanes} lastActivity={lastActivity} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Footer */}
      <footer className="py-3 border-t border-gray-800 bg-black/30 flex-shrink-0">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-xs">
            <div className="text-gray-500">
              Powered by <span className="text-redhat-red font-semibold">LLM-D</span> + vLLM • Real distributed inference
            </div>
            <div className="flex gap-3 text-gray-400">
              <button onClick={() => showInfo('router')} className="hover:text-white">
                How It Works
              </button>
              <button onClick={() => showInfo('caching')} className="hover:text-white">
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
