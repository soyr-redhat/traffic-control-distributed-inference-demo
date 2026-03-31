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
    { id: 'replica-1', replicaName: 'NODE_01', status: 'active', load: 0, requestsPerSec: 0, currentVehicles: 0 },
    { id: 'replica-2', replicaName: 'NODE_02', status: 'active', load: 0, requestsPerSec: 0, currentVehicles: 0 },
    { id: 'replica-3', replicaName: 'NODE_03', status: 'closed', load: 0, requestsPerSec: 0, currentVehicles: 0 }
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
            ? `[CACHE_HIT] → ${data.activity.replicaName} [${data.activity.ttft?.toFixed(3)}s]`
            : `[ROUTE] → ${data.activity.replicaName}`,
          timestamp: new Date().toLocaleTimeString()
        }
        setRecentActivities(prev => [newActivity, ...prev].slice(0, 8))
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
    <div className="min-h-screen bg-cyber-bg flex flex-col font-mono text-cyber-cyan">
      {/* Terminal Header */}
      <header className="border-b-2 border-cyber-cyan bg-cyber-bg-light relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl neon-text-magenta">⬡</div>
              <div>
                <h1 className="text-xl font-display font-bold neon-text tracking-wider">
                  LLM_TRAFFIC_CONTROL
                </h1>
                <p className="text-xs text-cyber-cyan opacity-70 font-tech mt-0.5">
                  DISTRIBUTED_INFERENCE_MONITOR_v2.1
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setInfoTopic('llmd')
                setInfoModalOpen(true)
              }}
              className="cyber-button text-xs"
            >
              [INFO]
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 container mx-auto px-6 py-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-4 stagger-1">
            {/* Prompt Input */}
            <div className="cyber-glass rounded p-4">
              <div className="flex items-center justify-between mb-3 border-b border-cyber-cyan pb-2">
                <h3 className="text-xs font-display font-bold tracking-wider">
                  [INPUT]
                </h3>
                <button
                  onClick={() => {
                    setInfoTopic('router')
                    setInfoModalOpen(true)
                  }}
                  className="text-cyber-cyan hover:text-cyber-magenta transition-colors text-xs"
                >
                  ?
                </button>
              </div>
              <PromptInput
                onSendPrompt={handleSendPrompt}
                onBatch={handleBatch}
                onStressTest={handleStressTest}
                onCacheTest={handleCacheTest}
              />
            </div>

            {/* Metrics */}
            <div className="cyber-glass rounded p-4">
              <div className="flex items-center justify-between mb-3 border-b border-cyber-cyan pb-2">
                <h3 className="text-xs font-display font-bold tracking-wider">
                  [METRICS]
                </h3>
                <button
                  onClick={() => {
                    setInfoTopic('metrics')
                    setInfoModalOpen(true)
                  }}
                  className="text-cyber-cyan hover:text-cyber-magenta transition-colors text-xs"
                >
                  ?
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 font-tech text-xs">
                <div className="border border-cyber-cyan p-2 bg-cyber-bg">
                  <div className="text-cyber-cyan opacity-60">THROUGHPUT</div>
                  <div className="text-lg neon-text mt-1">{metrics.throughput.toFixed(1)}</div>
                  <div className="text-cyber-cyan opacity-60">tok/s</div>
                </div>
                <div className="border border-cyber-green p-2 bg-cyber-bg">
                  <div className="text-cyber-cyan opacity-60">CACHE</div>
                  <div className="text-lg neon-text-green mt-1">{metrics.cacheHitRate.toFixed(0)}%</div>
                  <div className="text-cyber-cyan opacity-60">hit_rate</div>
                </div>
                <div className="border border-cyber-cyan p-2 bg-cyber-bg">
                  <div className="text-cyber-cyan opacity-60">LATENCY</div>
                  <div className="text-lg neon-text mt-1">{metrics.avgLatency.toFixed(2)}s</div>
                  <div className="text-cyber-cyan opacity-60">avg</div>
                </div>
                <div className="border border-cyber-magenta p-2 bg-cyber-bg">
                  <div className="text-cyber-cyan opacity-60">NODES</div>
                  <div className="text-lg neon-text-magenta mt-1">{metrics.activeLanes}/{metrics.totalLanes}</div>
                  <div className="text-cyber-cyan opacity-60">active</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-cyber-cyan text-xs font-tech space-y-1">
                <div className="flex justify-between">
                  <span className="text-cyber-cyan opacity-60">REQUESTS:</span>
                  <span className="neon-text">{metrics.totalRequests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyber-cyan opacity-60">TOKENS:</span>
                  <span className="neon-text">{metrics.totalTokens.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="cyber-glass rounded p-4 flex-1">
              <div className="flex items-center justify-between mb-3 border-b border-cyber-cyan pb-2">
                <h3 className="text-xs font-display font-bold tracking-wider">
                  [ACTIVITY_LOG]
                </h3>
              </div>
              <div className="space-y-1 text-xs font-tech max-h-64 overflow-y-auto">
                {recentActivities.length === 0 ? (
                  <div className="text-cyber-cyan opacity-40 py-4 text-center">
                    &gt; WAITING_FOR_DATA...
                  </div>
                ) : (
                  recentActivities.map(activity => (
                    <div key={activity.id} className="border-l-2 border-cyber-cyan pl-2 py-1 animate-fadeIn bg-cyber-bg-light">
                      <div className="text-cyber-cyan">{activity.message}</div>
                      <div className="text-cyber-cyan opacity-40 text-xs">{activity.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Network */}
          <div className="lg:col-span-3 stagger-2">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-display font-bold tracking-wider neon-text">
                  [NETWORK_TOPOLOGY]
                </h3>
                <button
                  onClick={() => {
                    setInfoTopic('caching')
                    setInfoModalOpen(true)
                  }}
                  className="cyber-button text-xs"
                >
                  [HELP]
                </button>
              </div>
              <div className="flex-1">
                <NetworkVisual lanes={lanes} lastActivity={lastActivity} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-cyber-cyan bg-cyber-bg-light py-3 font-tech text-xs">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="text-cyber-cyan opacity-70">
            POWERED_BY: <span className="neon-text">LLM-D</span> + vLLM | STATUS: <span className="neon-text-green">ONLINE</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setInfoTopic('router')
                setInfoModalOpen(true)
              }}
              className="text-cyber-cyan hover:text-cyber-magenta transition-colors"
            >
              [HOW_IT_WORKS]
            </button>
            <button
              onClick={() => {
                setInfoTopic('caching')
                setInfoModalOpen(true)
              }}
              className="text-cyber-cyan hover:text-cyber-magenta transition-colors"
            >
              [CACHING]
            </button>
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
