import { useState, useEffect } from 'react'

const AnimatedParticle = ({ progress, isCacheHit }) => {
  const color = isCacheHit ? '#10b981' : '#ef4444'

  return (
    <div
      className="absolute w-3 h-3 rounded-full"
      style={{
        left: `${progress}%`,
        top: '0',
        background: color,
        boxShadow: `0 0 10px ${color}`,
        opacity: 1 - (progress / 100) * 0.5
      }}
    />
  )
}

const ConnectionLine = ({ from, to, isActive, isCacheHit }) => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (isActive) {
      const newParticle = {
        id: Date.now() + Math.random(),
        progress: 0
      }
      setParticles(prev => [...prev, newParticle])
    }
  }, [isActive])

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, progress: p.progress + 3 }))
          .filter(p => p.progress < 100)
      )
    }, 30)

    return () => clearInterval(interval)
  }, [])

  // Calculate line angle and length
  const dx = to.x - from.x
  const dy = to.y - from.y
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  return (
    <div
      className="absolute origin-left"
      style={{
        left: `${from.x}px`,
        top: `${from.y}px`,
        width: `${length}px`,
        height: '2px',
        transform: `rotate(${angle}deg)`,
        transformOrigin: '0 0'
      }}
    >
      <div className={`absolute inset-0 bg-redhat-red transition-opacity duration-500 ${
        isActive ? 'opacity-100' : 'opacity-30'
      }`} style={{
        boxShadow: isActive ? '0 0 10px #EE0000' : 'none'
      }} />

      {particles.map(particle => (
        <AnimatedParticle
          key={particle.id}
          progress={particle.progress}
          isCacheHit={isCacheHit}
        />
      ))}
    </div>
  )
}

const ReplicaNode = ({ replica, x, y, isActive, isCacheHit }) => {
  const getStatusColor = () => {
    if (replica.status !== 'active') return 'bg-redhat-dark-surface border-redhat-grid-line'
    if (replica.load < 40) return 'bg-green-500/20 border-green-500'
    if (replica.load < 70) return 'bg-yellow-500/20 border-yellow-500'
    return 'bg-red-500/20 border-red-500'
  }

  const getLoadColor = () => {
    if (replica.load < 40) return 'bg-green-500'
    if (replica.load < 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {isActive && (
        <div className="absolute inset-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-0 rounded-full bg-redhat-red/30 animate-ping" />
        </div>
      )}

      <div
        className={`
          w-28 h-28 rounded-full border-4
          flex flex-col items-center justify-center
          transition-all duration-300
          ${getStatusColor()}
          ${isActive ? 'scale-110' : 'scale-100'}
        `}
      >
        <div className="text-2xl mb-1">{replica.status === 'active' ? '⚡' : '⚫'}</div>
        <div className="text-xs font-bold text-white">{replica.replicaName}</div>
        <div className="text-xs text-redhat-text-secondary mt-1">Q: {replica.currentVehicles}</div>
        {isCacheHit && <div className="text-lg mt-1">💚</div>}
      </div>

      {replica.currentVehicles > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-redhat-red border-2 border-white flex items-center justify-center text-xs font-bold">
          {replica.currentVehicles}
        </div>
      )}

      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-28">
        <div className="h-2 bg-redhat-dark-bg rounded-full overflow-hidden border border-redhat-grid-line">
          <div
            className={`h-full transition-all duration-300 ${getLoadColor()}`}
            style={{ width: `${replica.load}%` }}
          />
        </div>
      </div>
    </div>
  )
}

const NetworkVisual = ({ lanes, lastActivity }) => {
  const [activeConnections, setActiveConnections] = useState({})
  const [cacheHits, setCacheHits] = useState({})
  const [dimensions, setDimensions] = useState({ width: 1000, height: 600 })

  useEffect(() => {
    if (lastActivity?.replicaId) {
      setActiveConnections(prev => ({ ...prev, [lastActivity.replicaId]: true }))

      if (lastActivity.cached) {
        setCacheHits(prev => ({ ...prev, [lastActivity.replicaId]: true }))
      }

      setTimeout(() => {
        setActiveConnections(prev => {
          const next = { ...prev }
          delete next[lastActivity.replicaId]
          return next
        })
        setCacheHits(prev => {
          const next = { ...prev }
          delete next[lastActivity.replicaId]
          return next
        })
      }, 2000)
    }
  }, [lastActivity])

  // Fixed pixel positions
  const routerPos = { x: dimensions.width / 2, y: dimensions.height * 0.25 }
  const replicaPositions = {
    'replica-1': { x: dimensions.width * 0.25, y: dimensions.height * 0.75 },
    'replica-2': { x: dimensions.width * 0.5, y: dimensions.height * 0.85 },
    'replica-3': { x: dimensions.width * 0.75, y: dimensions.height * 0.75 }
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden border border-white/10">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />

      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        {Object.entries(replicaPositions).map(([replicaId, pos]) => {
          const lane = lanes.find(l => l.id === replicaId)
          if (!lane || lane.status !== 'active') return null

          return (
            <ConnectionLine
              key={replicaId}
              from={routerPos}
              to={pos}
              isActive={activeConnections[replicaId]}
              isCacheHit={cacheHits[replicaId]}
            />
          )
        })}
      </svg>

      {/* Router node */}
      <div
        className="absolute z-10"
        style={{
          left: `${routerPos.x}px`,
          top: `${routerPos.y}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="w-36 h-36 rounded-full bg-gradient-to-br from-redhat-red to-pink-600 shadow-2xl border-4 border-white/30 flex flex-col items-center justify-center">
          <div className="text-4xl mb-2">🧠</div>
          <div className="text-sm font-bold text-white">Smart Router</div>
          <div className="text-xs text-white/80">LLM-D</div>
        </div>
      </div>

      {/* Replica nodes */}
      {lanes.map((lane) => (
        <ReplicaNode
          key={lane.id}
          replica={lane}
          x={replicaPositions[lane.id].x}
          y={replicaPositions[lane.id].y}
          isActive={activeConnections[lane.id]}
          isCacheHit={cacheHits[lane.id]}
        />
      ))}

      {/* Activity overlay */}
      {lastActivity && (
        <div className="absolute top-4 right-4 glass rounded-xl px-4 py-3 max-w-xs animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{lastActivity.cached ? '💚' : '🔀'}</div>
            <div>
              <div className="font-bold text-white mb-1">
                {lastActivity.cached ? 'Cache Hit!' : 'New Route'}
              </div>
              <div className="text-xs text-redhat-text-secondary">
                → {lastActivity.replicaName}
              </div>
              {lastActivity.ttft && (
                <div className="text-xs text-redhat-text-secondary mt-1">
                  TTFT: {lastActivity.ttft.toFixed(3)}s
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass rounded-lg px-4 py-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Cache Hit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>New Request</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetworkVisual
