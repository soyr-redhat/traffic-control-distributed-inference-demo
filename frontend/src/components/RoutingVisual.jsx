import { useState, useEffect } from 'react'

const ReplicaCard = ({ replica, isActive, isCacheHit }) => {
  const getStatusColor = () => {
    if (replica.status !== 'active') return 'bg-gray-700'
    if (replica.load < 40) return 'bg-green-500'
    if (replica.load < 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStatusEmoji = () => {
    if (replica.status !== 'active') return '⚫'
    if (replica.load < 40) return '🟢'
    if (replica.load < 70) return '🟡'
    return '🔴'
  }

  return (
    <div className={`
      glass rounded-xl p-4 transition-all duration-300 relative overflow-hidden
      ${isActive ? 'ring-2 ring-redhat-red scale-105' : ''}
      ${isCacheHit ? 'ring-2 ring-green-400' : ''}
    `}>
      {/* Cache hit glow effect */}
      {isCacheHit && (
        <div className="absolute inset-0 bg-green-400 opacity-20 animate-pulse" />
      )}

      <div className="relative z-10">
        {/* Status Indicator */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-sm">{replica.replicaName}</span>
          <div className="flex items-center gap-1">
            <span className="text-lg">{getStatusEmoji()}</span>
            {isCacheHit && <span className="text-lg">💚</span>}
          </div>
        </div>

        {/* Load Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Load</span>
            <span>{replica.load.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStatusColor()} transition-all duration-300`}
              style={{ width: `${replica.load}%` }}
            />
          </div>
        </div>

        {/* Queue Depth */}
        <div className="text-xs text-gray-400 flex items-center justify-between">
          <span>Queue:</span>
          <span className="font-semibold text-white">{replica.currentVehicles}</span>
        </div>

        {/* Status */}
        <div className="mt-2 text-xs">
          {replica.status === 'active' ? (
            <span className="text-green-400">● Active</span>
          ) : replica.status === 'scaling' ? (
            <span className="text-yellow-400">● Scaling...</span>
          ) : (
            <span className="text-gray-500">● Closed</span>
          )}
        </div>

        {/* Cache hit indicator */}
        {isCacheHit && (
          <div className="mt-2 text-xs text-green-400 font-semibold flex items-center gap-1">
            <span>⚡</span>
            <span>Cache Hit!</span>
          </div>
        )}
      </div>
    </div>
  )
}

const RoutingVisual = ({ lanes, lastActivity }) => {
  const [activeReplica, setActiveReplica] = useState(null)
  const [cacheHitReplica, setCacheHitReplica] = useState(null)

  useEffect(() => {
    if (lastActivity?.type === 'route') {
      setActiveReplica(lastActivity.replicaId)
      if (lastActivity.cached) {
        setCacheHitReplica(lastActivity.replicaId)
      }

      // Clear indicators after animation
      setTimeout(() => {
        setActiveReplica(null)
        setCacheHitReplica(null)
      }, 2000)
    }
  }, [lastActivity])

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <span className="text-redhat-red">📊</span> Routing Visualization
        </h2>
        <button
          className="text-gray-400 hover:text-white transition-colors text-sm"
          title="Learn how routing works"
        >
          <span className="text-lg">ℹ️</span>
        </button>
      </div>

      {/* Flow Diagram */}
      <div className="mb-8">
        {/* Your Prompt */}
        <div className="text-center mb-4">
          <div className="inline-block glass rounded-lg px-6 py-3">
            <div className="text-sm text-gray-400 mb-1">YOUR PROMPT</div>
            <div className="font-semibold">✍️ Text Input</div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center mb-4">
          <div className="text-2xl text-gray-600 animate-bounce">↓</div>
        </div>

        {/* Smart Router */}
        <div className="text-center mb-4">
          <div className="inline-block bg-gradient-to-r from-redhat-red to-pink-600 rounded-lg px-6 py-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-white opacity-10 animate-pulse" />
            <div className="relative z-10">
              <div className="text-sm text-white/80 mb-1">SMART ROUTER</div>
              <div className="font-semibold text-white flex items-center gap-2">
                <span>🧠</span>
                <span>Cache-Aware + Load Balancing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center mb-6">
          <div className="text-2xl text-gray-600">↓</div>
        </div>

        {/* Replicas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {lanes.map((lane) => (
            <ReplicaCard
              key={lane.id}
              replica={lane}
              isActive={activeReplica === lane.id}
              isCacheHit={cacheHitReplica === lane.id}
            />
          ))}
        </div>
      </div>

      {/* Routing Decision Explanation */}
      {lastActivity?.type === 'route' && (
        <div className="glass rounded-lg px-4 py-3 border-l-4 border-redhat-red">
          <div className="text-sm">
            <span className="font-semibold text-redhat-red">Routing Decision: </span>
            {lastActivity.cached ? (
              <span>
                <span className="text-green-400">Cache hit!</span> Routed to {lastActivity.replicaName}
                {' '}(TTFT: {lastActivity.ttft?.toFixed(3)}s ⚡)
              </span>
            ) : (
              <span>
                Routed to {lastActivity.replicaName} (lowest queue depth: {lastActivity.queueDepth})
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RoutingVisual
