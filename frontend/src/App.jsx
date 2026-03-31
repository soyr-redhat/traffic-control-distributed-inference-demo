import { useState, useEffect } from 'react'
import PromptInput from './components/PromptInput'
import RoutingVisual from './components/RoutingVisual'
import ActivityFeed from './components/ActivityFeed'
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
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => ws.close()
  }, [])

  const handleSendPrompt = async (prompt) => {
    try {
      // Send as a single car request
      const response = await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleType: 'car',
          customPrompt: prompt
        })
      })

      if (!response.ok) throw new Error('Failed to send prompt')

      const result = await response.json()
      console.log('Prompt sent:', result)
    } catch (err) {
      console.error('Failed to send prompt:', err)
    }
  }

  const handleBatch = async (prompt, count) => {
    try {
      // Send multiple identical requests to demonstrate cache hits
      for (let i = 0; i < count; i++) {
        await fetch('/api/spawn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            vehicleType: 'car',
            customPrompt: prompt
          })
        })
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      console.log(`Batch of ${count} sent`)
    } catch (err) {
      console.error('Failed to send batch:', err)
    }
  }

  const handleStressTest = async () => {
    try {
      // Send diverse requests to trigger auto-scaling
      const vehicleTypes = ['sport', 'car', 'truck', 'bus', 'ambulance']

      for (let i = 0; i < 50; i++) {
        const vehicleType = vehicleTypes[i % vehicleTypes.length]
        fetch('/api/spawn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleType })
        }).catch(err => console.error('Spawn failed:', err))

        // Don't await - send all at once for stress test
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      console.log('Stress test initiated')
    } catch (err) {
      console.error('Failed to run stress test:', err)
    }
  }

  const handleCacheTest = async () => {
    try {
      // Send: A, B, A again to demonstrate cache hit
      const promptA = 'Explain quantum computing in simple terms.'
      const promptB = 'What is artificial intelligence?'

      // Send A
      await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleType: 'car',
          customPrompt: promptA
        })
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Send B
      await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleType: 'car',
          customPrompt: promptB
        })
      })

      await new Promise(resolve => setTimeout(resolve, 1000))

      // Send A again - should be cache hit!
      await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleType: 'car',
          customPrompt: promptA
        })
      })

      console.log('Cache test completed')
    } catch (err) {
      console.error('Failed to run cache test:', err)
    }
  }

  const showInfo = (topic) => {
    setInfoTopic(topic)
    setInfoModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-redhat-red/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                <span className="text-redhat-red">🚦</span> LLM Traffic Control Center
              </h1>
              <p className="text-gray-400 text-sm font-text mt-1">
                Watch your prompts flow through distributed inference
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => showInfo('llmd')}
                className="glass hover:bg-white/10 transition-all rounded-lg px-4 py-2 text-sm"
              >
                <span className="text-lg mr-2">ℹ️</span>
                What is LLM-D?
              </button>
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
        {/* Prompt Input */}
        <PromptInput
          onSendPrompt={handleSendPrompt}
          onBatch={handleBatch}
          onStressTest={handleStressTest}
          onCacheTest={handleCacheTest}
        />

        {/* Routing Visualization */}
        <RoutingVisual
          lanes={lanes}
          lastActivity={lastActivity}
        />

        {/* Activity Feed */}
        <ActivityFeed
          metrics={metrics}
          lanes={lanes}
        />
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="text-gray-500 text-sm">
              <p>Powered by <span className="text-redhat-red font-semibold">LLM-D</span> + vLLM on OpenShift</p>
              <p className="mt-1">Real distributed inference with {metrics.totalLanes} replicas</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => showInfo('router')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                How Routing Works
              </button>
              <button
                onClick={() => showInfo('metrics')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Understanding Metrics
              </button>
              <button
                onClick={() => showInfo('caching')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
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
