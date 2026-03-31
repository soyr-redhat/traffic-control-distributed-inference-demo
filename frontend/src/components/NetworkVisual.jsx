import { useState, useEffect } from 'react'

const AnimatedPath = ({ isActive, isCacheHit }) => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (isActive) {
      // Add new particle when request is routed
      const newParticle = {
        id: Date.now() + Math.random(),
        progress: 0,
        color: isCacheHit ? '#10b981' : '#ef4444'
      }
      setParticles(prev => [...prev, newParticle])
    }
  }, [isActive, isCacheHit])

  useEffect(() => {
    // Animate particles
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, progress: p.progress + 2 }))
          .filter(p => p.progress < 100)
      )
    }, 20)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full transition-all"
          style={{
            backgroundColor: particle.color,
            left: `${particle.progress}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 10px ${particle.color}`,
            opacity: 1 - (particle.progress / 100) * 0.5
          }}
        />
      ))}
    </>
  )
}

const ReplicaNode = ({ replica, position, isActive, isCacheHit }) => {
  const getStatusColor = () => {
    if (replica.status !== 'active') return 'bg-gray-700 border-gray-600'
    if (replica.load < 40) return 'bg-green-500/20 border-green-500'
    if (replica.load < 70) return 'bg-yellow-500/20 border-yellow-500'
    return 'bg-red-500/20 border-red-500'
  }

  const getStatusEmoji = () => {
    if (replica.status !== 'active') return '⚫'
    if (replica.load < 40) return '🟢'
    if (replica.load < 70) return '🟡'
    return '🔴'
  }

  return (
    <div
      className={`absolute transition-all duration-300`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div
        className={`
          w-32 h-32 rounded-full border-4 transition-all duration-300
          flex flex-col items-center justify-center
          ${getStatusColor()}
          ${isActive ? 'scale-110 ring-4 ring-redhat-red/50' : 'scale-100'}
          ${isCacheHit ? 'ring-4 ring-green-400/50' : ''}
        `}
      >
        <div className="text-3xl mb-1">{getStatusEmoji()}</div>
        <div className="text-xs font-semibold text-white">{replica.replicaName}</div>
        <div className="text-xs text-gray-400 mt-1">Q: {replica.currentVehicles}</div>
        {isCacheHit && <div className="text-lg mt-1">💚</div>}
      </div>

      {/* Load bar underneath */}
      <div className="mt-2 w-32">
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              replica.load < 40 ? 'bg-green-500' :
              replica.load < 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${replica.load}%` }}
          />
        </div>
      </div>
    </div>
  )
}

const NetworkVisual = ({ lanes, lastActivity }) => {
  const [activeReplicas, setActiveReplicas] = useState({})
  const [cacheHits, setCacheHits] = useState({})

  useEffect(() => {
    if (lastActivity?.replicaId) {
      // Highlight active replica
      setActiveReplicas(prev => ({ ...prev, [lastActivity.replicaId]: true }))

      if (lastActivity.cached) {
        setCacheHits(prev => ({ ...prev, [lastActivity.replicaId]: true }))
      }

      // Clear after animation
      setTimeout(() => {
        setActiveReplicas(prev => {
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

  // Position replicas in a circle around the router
  const replicaPositions = {
    'replica-1': { x: '25%', y: '70%' },
    'replica-2': { x: '50%', y: '85%' },
    'replica-3': { x: '75%', y: '70%' }
  }

  const routerPosition = { x: '50%', y: '25%' }

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl overflow-hidden">
      {/* Connection lines (web) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EE0000" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#EE0000" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Lines from router to each replica */}
        {Object.entries(replicaPositions).map(([replicaId, pos]) => {
          const lane = lanes.find(l => l.id === replicaId)
          if (!lane || lane.status !== 'active') return null

          const x1 = parseFloat(routerPosition.x)
          const y1 = parseFloat(routerPosition.y)
          const x2 = parseFloat(pos.x)
          const y2 = parseFloat(pos.y)

          return (
            <line
              key={replicaId}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="url(#lineGradient)"
              strokeWidth="2"
              className={`transition-all ${activeReplicas[replicaId] ? 'opacity-100' : 'opacity-30'}`}
            />
          )
        })}
      </svg>

      {/* Animated particles traveling along paths */}
      {Object.entries(replicaPositions).map(([replicaId, pos]) => {
        const lane = lanes.find(l => l.id === replicaId)
        if (!lane || lane.status !== 'active') return null

        const x1 = parseFloat(routerPosition.x)
        const y1 = parseFloat(routerPosition.y)
        const x2 = parseFloat(pos.x)
        const y2 = parseFloat(pos.y)

        return (
          <div
            key={`path-${replicaId}`}
            className="absolute pointer-events-none"
            style={{
              left: `${x1}%`,
              top: `${y1}%`,
              width: `${Math.abs(x2 - x1)}%`,
              height: `${Math.abs(y2 - y1)}%`,
              transform: `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`
            }}
          >
            <AnimatedPath
              isActive={activeReplicas[replicaId]}
              isCacheHit={cacheHits[replicaId]}
            />
          </div>
        )
      })}

      {/* Router (center top) */}
      <div
        className="absolute"
        style={{
          left: routerPosition.x,
          top: routerPosition.y,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="relative">
          {/* Pulsing ring when active */}
          {Object.keys(activeReplicas).length > 0 && (
            <div className="absolute inset-0 w-40 h-40 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
              <div className="absolute inset-0 bg-redhat-red rounded-full opacity-20 animate-ping" />
            </div>
          )}

          <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-redhat-red to-pink-600 flex flex-col items-center justify-center shadow-2xl border-4 border-red-300">
            <div className="text-4xl mb-2">🧠</div>
            <div className="text-sm font-bold text-white">Smart Router</div>
            <div className="text-xs text-white/80">LLM-D</div>
          </div>
        </div>
      </div>

      {/* Replica nodes */}
      {lanes.map((lane) => (
        <ReplicaNode
          key={lane.id}
          replica={lane}
          position={replicaPositions[lane.id]}
          isActive={activeReplicas[lane.id]}
          isCacheHit={cacheHits[lane.id]}
        />
      ))}

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

      {/* Routing info */}
      {lastActivity && (
        <div className="absolute top-4 right-4 glass rounded-lg px-4 py-2 text-xs max-w-xs animate-fadeIn">
          <div className="font-semibold text-redhat-red mb-1">Latest Routing:</div>
          <div className="text-gray-300">
            {lastActivity.cached ? (
              <span className="text-green-400">✅ Cache hit! </span>
            ) : (
              <span>🔀 Load balanced </span>
            )}
            → {lastActivity.replicaName}
          </div>
          {lastActivity.ttft && (
            <div className="text-gray-400 mt-1">
              TTFT: {lastActivity.ttft.toFixed(3)}s
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NetworkVisual
