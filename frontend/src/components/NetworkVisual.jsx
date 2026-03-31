import { useState, useEffect } from 'react'

const AnimatedParticle = ({ progress, color }) => (
  <div
    className="absolute w-4 h-4 rounded-full transition-all duration-100 animate-pulse"
    style={{
      left: `${progress}%`,
      top: '50%',
      transform: 'translate(-50%, -50%)',
      background: `radial-gradient(circle, ${color}, ${color}88)`,
      boxShadow: `0 0 20px ${color}, 0 0 40px ${color}66`,
      opacity: 1 - (progress / 100) * 0.3
    }}
  />
)

const ConnectionLine = ({ x1, y1, x2, y2, isActive, isCacheHit }) => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (isActive) {
      const color = isCacheHit ? '#10b981' : '#ef4444'
      const newParticle = {
        id: Date.now() + Math.random(),
        progress: 0,
        color
      }
      setParticles(prev => [...prev, newParticle])
    }
  }, [isActive, isCacheHit])

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

  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

  return (
    <div
      className="absolute origin-left pointer-events-none"
      style={{
        left: `${x1}%`,
        top: `${y1}%`,
        width: `${length}%`,
        transform: `rotate(${angle}deg)`,
        height: '4px'
      }}
    >
      {/* Glowing line */}
      <div className={`absolute inset-0 transition-all duration-500 ${
        isActive ? 'opacity-70' : 'opacity-20'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-redhat-red/50 to-transparent" />
        <div className="absolute inset-0 bg-redhat-red/20 blur-sm" />
      </div>

      {/* Animated particles */}
      {particles.map(particle => (
        <AnimatedParticle
          key={particle.id}
          progress={particle.progress}
          color={particle.color}
        />
      ))}
    </div>
  )
}

const ReplicaNode = ({ replica, position, isActive, isCacheHit }) => {
  const getGradient = () => {
    if (replica.status !== 'active') return 'from-gray-700 to-gray-800'
    if (replica.load < 40) return 'from-emerald-500 to-green-600'
    if (replica.load < 70) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-600'
  }

  const getGlow = () => {
    if (replica.status !== 'active') return 'shadow-lg shadow-gray-900/50'
    if (replica.load < 40) return 'shadow-xl shadow-green-500/50'
    if (replica.load < 70) return 'shadow-xl shadow-yellow-500/50'
    return 'shadow-xl shadow-red-500/50'
  }

  return (
    <div
      className="absolute transition-all duration-500"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Outer glow ring */}
      {isActive && (
        <div className="absolute inset-0 w-40 h-40 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div className="absolute inset-0 rounded-full bg-redhat-red/30 animate-ping" />
        </div>
      )}

      {/* Cache hit glow */}
      {isCacheHit && (
        <div className="absolute inset-0 w-40 h-40 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div className="absolute inset-0 rounded-full bg-green-400/40 animate-pulse" />
        </div>
      )}

      {/* Node */}
      <div
        className={`
          relative w-36 h-36 rounded-full
          bg-gradient-to-br ${getGradient()}
          border-4 border-white/20
          flex flex-col items-center justify-center
          transition-all duration-500
          ${getGlow()}
          ${isActive ? 'scale-110' : 'scale-100'}
        `}
      >
        {/* Inner content */}
        <div className="absolute inset-4 rounded-full bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="text-4xl mb-1">{replica.status === 'active' ? '⚡' : '⚫'}</div>
          <div className="text-xs font-bold text-white tracking-wide">{replica.replicaName}</div>
          {isCacheHit && <div className="text-2xl mt-1 animate-bounce">💚</div>}
        </div>

        {/* Queue indicator */}
        {replica.currentVehicles > 0 && (
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-redhat-red border-2 border-white flex items-center justify-center text-xs font-bold shadow-lg">
            {replica.currentVehicles}
          </div>
        )}
      </div>

      {/* Load bar */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32">
        <div className="h-2 bg-gray-900/50 rounded-full overflow-hidden border border-white/10">
          <div
            className={`h-full transition-all duration-300 ${
              replica.load < 40 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
              replica.load < 70 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
              'bg-gradient-to-r from-red-500 to-pink-500'
            }`}
            style={{ width: `${replica.load}%` }}
          />
        </div>
        <div className="text-center text-xs text-white/60 mt-1 font-semibold">
          {replica.load.toFixed(0)}% load
        </div>
      </div>
    </div>
  )
}

const NetworkVisual = ({ lanes, lastActivity }) => {
  const [activeConnections, setActiveConnections] = useState({})
  const [cacheHits, setCacheHits] = useState({})

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

  const replicaPositions = {
    'replica-1': { x: 20, y: 75 },
    'replica-2': { x: 50, y: 85 },
    'replica-3': { x: 80, y: 75 }
  }

  const routerPos = { x: 50, y: 20 }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-2xl overflow-hidden border border-white/10">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-redhat-red/10 via-transparent to-blue-500/10 animate-pulse" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }} />

      {/* Connection lines */}
      <div className="absolute inset-0">
        {Object.entries(replicaPositions).map(([replicaId, pos]) => {
          const lane = lanes.find(l => l.id === replicaId)
          if (!lane || lane.status !== 'active') return null

          return (
            <ConnectionLine
              key={replicaId}
              x1={routerPos.x}
              y1={routerPos.y}
              x2={pos.x}
              y2={pos.y}
              isActive={activeConnections[replicaId]}
              isCacheHit={cacheHits[replicaId]}
            />
          )
        })}
      </div>

      {/* Router node */}
      <div
        className="absolute z-10"
        style={{
          left: `${routerPos.x}%`,
          top: `${routerPos.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        {/* Outer pulse ring */}
        <div className="absolute inset-0 w-44 h-44 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div className="absolute inset-0 rounded-full bg-redhat-red/20 animate-ping" style={{ animationDuration: '3s' }} />
        </div>

        {/* Router */}
        <div className="relative w-44 h-44 rounded-full bg-gradient-to-br from-redhat-red via-pink-600 to-purple-600 shadow-2xl shadow-redhat-red/50 border-4 border-white/30">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
          <div className="absolute inset-4 rounded-full bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="text-5xl mb-2 animate-pulse">🧠</div>
            <div className="text-sm font-bold text-white tracking-wider">SMART ROUTER</div>
            <div className="text-xs text-white/80 mt-1">LLM-D</div>
          </div>
        </div>
      </div>

      {/* Replica nodes */}
      {lanes.map((lane) => (
        <ReplicaNode
          key={lane.id}
          replica={lane}
          position={replicaPositions[lane.id]}
          isActive={activeConnections[lane.id]}
          isCacheHit={cacheHits[lane.id]}
        />
      ))}

      {/* Routing info overlay */}
      {lastActivity && (
        <div className="absolute top-6 right-6 glass rounded-xl px-5 py-3 border border-white/10 max-w-xs backdrop-blur-xl animate-fadeIn shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{lastActivity.cached ? '💚' : '🔀'}</div>
            <div>
              <div className="font-bold text-white mb-1">
                {lastActivity.cached ? 'Cache Hit!' : 'New Route'}
              </div>
              <div className="text-xs text-gray-300">
                → {lastActivity.replicaName}
              </div>
              {lastActivity.ttft && (
                <div className="text-xs text-gray-400 mt-1">
                  TTFT: <span className={lastActivity.cached ? 'text-green-400 font-semibold' : 'text-white'}>
                    {lastActivity.ttft.toFixed(3)}s
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-6 left-6 glass rounded-xl px-4 py-3 border border-white/10 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
            <span className="text-white/90 font-medium">Cache Hit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
            <span className="text-white/90 font-medium">New Request</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetworkVisual
