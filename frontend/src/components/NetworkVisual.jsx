import { useState, useEffect } from 'react'

const CyberParticle = ({ progress, isCacheHit }) => {
  const color = isCacheHit ? '#00ff41' : '#00ffff'

  return (
    <div
      className="absolute w-2 h-2 transition-all duration-100"
      style={{
        left: `${progress}%`,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        background: color,
        boxShadow: `
          0 0 5px ${color},
          0 0 10px ${color},
          0 0 20px ${color}
        `,
        opacity: 1 - (progress / 100) * 0.4,
      }}
    >
      <div
        className="absolute inset-0 rounded-full animate-ping"
        style={{ background: color }}
      />
    </div>
  )
}

const ConnectionLine = ({ x1, y1, x2, y2, isActive, isCacheHit }) => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (isActive) {
      const newParticle = {
        id: Date.now() + Math.random(),
        progress: 0,
      }
      setParticles(prev => [...prev, newParticle])
    }
  }, [isActive])

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({ ...p, progress: p.progress + 4 }))
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
        height: '2px',
      }}
    >
      {/* Glowing cyber line */}
      <div className={`absolute inset-0 transition-all duration-500 ${
        isActive ? 'opacity-100' : 'opacity-30'
      }`}>
        <div
          className="absolute inset-0"
          style={{
            background: isActive
              ? 'linear-gradient(90deg, #00ffff, #ff00ff, #00ffff)'
              : '#00ffff',
            boxShadow: isActive
              ? '0 0 10px #00ffff, 0 0 20px #00ffff'
              : '0 0 5px #00ffff',
          }}
        />
      </div>

      {/* Particles */}
      {particles.map(particle => (
        <CyberParticle
          key={particle.id}
          progress={particle.progress}
          isCacheHit={isCacheHit}
        />
      ))}
    </div>
  )
}

const ReplicaNode = ({ replica, position, isActive, isCacheHit }) => {
  const getStatusColor = () => {
    if (replica.status !== 'active') return '#4a5568'
    if (replica.load < 40) return '#00ff41'
    if (replica.load < 70) return '#ffff00'
    return '#ff00ff'
  }

  const statusColor = getStatusColor()

  return (
    <div
      className="absolute transition-all duration-500 font-mono"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Pulse ring on activity */}
      {isActive && (
        <div className="absolute inset-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div
            className="absolute inset-0 rounded border-2 animate-ping"
            style={{
              borderColor: statusColor,
              boxShadow: `0 0 20px ${statusColor}`,
            }}
          />
        </div>
      )}

      {/* Node container */}
      <div
        className={`
          relative w-28 h-28
          flex flex-col items-center justify-center
          transition-all duration-500
          terminal-border
          ${isActive ? 'scale-110' : 'scale-100'}
        `}
        style={{
          background: 'rgba(10, 14, 39, 0.9)',
          borderColor: statusColor,
          boxShadow: `
            0 0 20px ${statusColor},
            inset 0 0 20px rgba(0, 255, 255, 0.1)
          `,
        }}
      >
        {/* Corner brackets */}
        <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2" style={{ borderColor: statusColor }} />
        <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2" style={{ borderColor: statusColor }} />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2" style={{ borderColor: statusColor }} />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2" style={{ borderColor: statusColor }} />

        {/* Node content */}
        <div className="text-center z-10">
          <div
            className="text-2xl mb-1 font-display font-bold neon-text"
            style={{
              color: statusColor,
              textShadow: `0 0 10px ${statusColor}`,
            }}
          >
            {replica.status === 'active' ? 'ONLINE' : 'OFFLINE'}
          </div>
          <div className="text-xs text-cyber-cyan font-tech tracking-wider">
            {replica.replicaName}
          </div>
          {isCacheHit && (
            <div className="text-cyber-green text-lg mt-1 neon-text-green animate-pulseNeon">
              ✓ CACHED
            </div>
          )}
        </div>

        {/* Queue badge */}
        {replica.currentVehicles > 0 && (
          <div
            className="absolute -top-3 -right-3 w-7 h-7 flex items-center justify-center text-xs font-bold font-display terminal-border"
            style={{
              background: '#0a0e27',
              borderColor: '#ff00ff',
              color: '#ff00ff',
              boxShadow: '0 0 10px #ff00ff',
            }}
          >
            {replica.currentVehicles}
          </div>
        )}
      </div>

      {/* Load indicator */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-28">
        <div className="flex items-center justify-between text-xs text-cyber-cyan mb-1 font-tech">
          <span>LOAD</span>
          <span>{replica.load.toFixed(0)}%</span>
        </div>
        <div
          className="h-2 bg-cyber-bg border border-cyber-cyan"
          style={{ boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.2)' }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${replica.load}%`,
              background: statusColor,
              boxShadow: `0 0 10px ${statusColor}`,
            }}
          />
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
    'replica-3': { x: 80, y: 75 },
  }

  const routerPos = { x: 50, y: 20 }

  return (
    <div className="relative w-full h-full bg-cyber-bg rounded-lg overflow-hidden terminal-border grid-bg">
      {/* Hexagon overlay */}
      <div className="absolute inset-0 hex-bg opacity-50" />

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
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Outer pulse */}
        <div className="absolute inset-0 w-36 h-36 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
          <div className="absolute inset-0 border-2 border-cyber-cyan rounded animate-pulseNeon" />
        </div>

        {/* Router */}
        <div className="relative w-36 h-36 flex flex-col items-center justify-center terminal-border bg-cyber-bg-light">
          {/* Corner brackets */}
          <div className="absolute -top-3 -left-3 w-6 h-6 border-l-2 border-t-2 border-cyber-magenta" />
          <div className="absolute -top-3 -right-3 w-6 h-6 border-r-2 border-t-2 border-cyber-magenta" />
          <div className="absolute -bottom-3 -left-3 w-6 h-6 border-l-2 border-b-2 border-cyber-magenta" />
          <div className="absolute -bottom-3 -right-3 w-6 h-6 border-r-2 border-b-2 border-cyber-magenta" />

          <div className="text-4xl mb-2 neon-text-magenta">⬡</div>
          <div className="text-xs font-display font-bold neon-text-magenta tracking-wider">
            ROUTER
          </div>
          <div className="text-xs text-cyber-cyan font-tech mt-1">LLM-D</div>
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

      {/* Activity overlay */}
      {lastActivity && (
        <div className="absolute top-4 right-4 cyber-glass rounded px-4 py-3 max-w-xs animate-fadeIn font-tech text-xs">
          <div className="flex items-start gap-3">
            <div className="text-xl">
              {lastActivity.cached ? (
                <span className="neon-text-green">✓</span>
              ) : (
                <span className="neon-text">→</span>
              )}
            </div>
            <div>
              <div className="font-bold text-cyber-cyan mb-1">
                {lastActivity.cached ? 'CACHE_HIT' : 'ROUTE'}
              </div>
              <div className="text-cyber-cyan opacity-80">
                TARGET: {lastActivity.replicaName}
              </div>
              {lastActivity.ttft && (
                <div className={lastActivity.cached ? 'text-cyber-green' : 'text-cyber-cyan'}>
                  TTFT: {lastActivity.ttft.toFixed(3)}s
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 cyber-glass rounded px-4 py-2 text-xs font-tech">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyber-green" style={{ boxShadow: '0 0 10px #00ff41' }} />
            <span className="text-cyber-cyan">CACHED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyber-cyan" style={{ boxShadow: '0 0 10px #00ffff' }} />
            <span className="text-cyber-cyan">NEW</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NetworkVisual
