import { useState, useEffect } from 'react'
import RaceTrack from './components/RaceTrack'
import RaceControls from './components/RaceControls'
import InfoModal from './components/InfoModal'

function App() {
  const [isRacing, setIsRacing] = useState(false)
  const [leftLane, setLeftLane] = useState({
    status: 'ready',
    progress: 0,
    metrics: {}
  })
  const [rightLane, setRightLane] = useState({
    status: 'ready',
    progress: 0,
    metrics: {}
  })
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [speedup, setSpeedup] = useState(null)

  const handleStartRace = async (prompt) => {
    setIsRacing(true)
    setSpeedup(null)

    // Reset both lanes
    setLeftLane({ status: 'ready', progress: 0, metrics: {} })
    setRightLane({ status: 'ready', progress: 0, metrics: {} })

    await new Promise(resolve => setTimeout(resolve, 500))

    // Start left lane (cold start)
    setLeftLane(prev => ({ ...prev, status: 'running' }))

    try {
      const startTime1 = Date.now()

      // Simulate progress for left lane
      const progressInterval1 = setInterval(() => {
        setLeftLane(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 3, 95)
        }))
      }, 100)

      const response1 = await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType: 'car', customPrompt: prompt })
      })

      clearInterval(progressInterval1)

      const data1 = await response1.json()
      const totalTime1 = (Date.now() - startTime1) / 1000

      setLeftLane({
        status: 'complete',
        progress: 100,
        metrics: {
          ttft: data1.ttft || totalTime1 * 0.3,
          totalTime: totalTime1,
          tokens: data1.tokens || 100,
          tokensPerSec: data1.tokens ? (data1.tokens / totalTime1) : (100 / totalTime1),
          replica: data1.replica || 'Unknown'
        }
      })

      // Wait a bit before starting right lane
      await new Promise(resolve => setTimeout(resolve, 800))

      // Start right lane (cache hit)
      setRightLane(prev => ({ ...prev, status: 'running' }))

      const startTime2 = Date.now()

      // Simulate faster progress for right lane
      const progressInterval2 = setInterval(() => {
        setRightLane(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 8, 95)
        }))
      }, 100)

      const response2 = await fetch('/api/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType: 'car', customPrompt: prompt })
      })

      clearInterval(progressInterval2)

      const data2 = await response2.json()
      const totalTime2 = (Date.now() - startTime2) / 1000

      setRightLane({
        status: 'complete',
        progress: 100,
        metrics: {
          ttft: data2.ttft || totalTime2 * 0.3,
          totalTime: totalTime2,
          tokens: data2.tokens || 100,
          tokensPerSec: data2.tokens ? (data2.tokens / totalTime2) : (100 / totalTime2),
          replica: data2.replica || 'Unknown'
        }
      })

      // Calculate speedup
      if (totalTime1 && totalTime2) {
        setSpeedup((totalTime1 / totalTime2).toFixed(1))
      }

    } catch (err) {
      console.error('Race failed:', err)
      setLeftLane(prev => ({ ...prev, status: 'ready' }))
      setRightLane(prev => ({ ...prev, status: 'ready' }))
    }

    setIsRacing(false)
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
                <span className="text-2xl">🏁</span>
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white">
                  Cache Performance Race
                </h1>
                <p className="text-gray-400 text-sm">
                  See the dramatic speedup from prefix caching
                </p>
              </div>
            </div>
            <button
              onClick={() => setInfoModalOpen(true)}
              className="glass hover:bg-white/10 transition-all rounded-lg px-4 py-2 text-sm"
            >
              <span className="mr-2">ℹ️</span> How It Works
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-6 py-6 flex flex-col overflow-hidden">
        {/* Speedup Banner */}
        {speedup && (
          <div className="mb-4 glass rounded-2xl p-4 border border-green-500/30 animate-fadeIn">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">🎉</span>
              <div className="text-center">
                <div className="text-sm text-gray-400">Performance Improvement</div>
                <div className="text-3xl font-bold text-green-400">{speedup}x faster</div>
              </div>
              <span className="text-3xl">⚡</span>
            </div>
          </div>
        )}

        {/* Race Track */}
        <div className="flex-1 min-h-0 mb-6">
          <RaceTrack leftLane={leftLane} rightLane={rightLane} />
        </div>

        {/* Race Controls */}
        <div>
          <RaceControls onStartRace={handleStartRace} isRacing={isRacing} />
        </div>
      </div>

      {/* Info Modal */}
      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        topic="caching"
      />
    </div>
  )
}

export default App
