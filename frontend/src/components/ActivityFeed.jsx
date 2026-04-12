import { useState, useEffect, useRef } from 'react'

const ActivityFeed = ({ metrics, lanes }) => {
  const [activities, setActivities] = useState([])
  const feedRef = useRef(null)
  const previousMetrics = useRef(null)

  useEffect(() => {
    // Track metric changes and generate activity messages
    if (previousMetrics.current) {
      const prev = previousMetrics.current

      // Auto-scaling events
      const activeLanesChanged = metrics.activeLanes !== prev.activeLanes
      if (activeLanesChanged) {
        if (metrics.activeLanes > prev.activeLanes) {
          addActivity('scale-up', `⚡ Auto-scaled UP: Opened replica (load > 70%)`)
        } else {
          addActivity('scale-down', `📉 Auto-scaled DOWN: Closed replica (idle)`)
        }
      }

      // Cache hit rate milestones
      if (metrics.cacheHitRate >= 50 && prev.cacheHitRate < 50) {
        addActivity('milestone', `✨ Cache hit rate reached 50%!`)
      }
      if (metrics.cacheHitRate >= 75 && prev.cacheHitRate < 75) {
        addActivity('milestone', `🎯 Excellent! 75% cache hit rate!`)
      }
      if (metrics.cacheHitRate >= 90 && prev.cacheHitRate < 90) {
        addActivity('milestone', `🏆 Outstanding! 90% cache hit rate!`)
      }

      // Throughput milestones
      if (metrics.totalRequests > prev.totalRequests) {
        const newRequests = metrics.totalRequests - prev.totalRequests
        if (newRequests >= 10) {
          addActivity('batch', `🎯 Batch completed: ${newRequests} requests`)
        }
      }
    }

    previousMetrics.current = metrics
  }, [metrics])

  const addActivity = (type, message) => {
    const newActivity = {
      id: Date.now() + Math.random(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    }

    setActivities(prev => [newActivity, ...prev].slice(0, 20)) // Keep last 20

    // Auto-scroll to top
    if (feedRef.current) {
      feedRef.current.scrollTop = 0
    }
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'cache-hit': return '✅'
      case 'scale-up': return '⚡'
      case 'scale-down': return '📉'
      case 'batch': return '🎯'
      case 'milestone': return '✨'
      default: return '📊'
    }
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <span className="text-redhat-red">📈</span> Real-Time Activity
        </h2>
        <button
          onClick={() => setActivities([])}
          className="text-xs text-redhat-text-secondary hover:text-redhat-text-primary transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-redhat-red">
            {metrics.throughput.toFixed(1)}
          </div>
          <div className="text-xs text-redhat-text-secondary mt-1">Tokens/sec</div>
        </div>
        <div className="glass rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-400">
            {metrics.cacheHitRate.toFixed(0)}%
          </div>
          <div className="text-xs text-redhat-text-secondary mt-1">Cache Hits</div>
        </div>
        <div className="glass rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">
            {metrics.avgLatency.toFixed(2)}s
          </div>
          <div className="text-xs text-redhat-text-secondary mt-1">Avg Latency</div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="space-y-2">
        <div className="text-sm text-redhat-text-secondary mb-2">Recent Activity:</div>
        <div
          ref={feedRef}
          className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        >
          {activities.length === 0 ? (
            <div className="text-center py-8 text-redhat-text-secondary text-sm">
              No activity yet. Send a prompt to get started!
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="glass rounded-lg px-3 py-2 flex items-start gap-2 animate-fadeIn"
              >
                <span className="text-lg flex-shrink-0">{getActivityIcon(activity.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-200">{activity.message}</div>
                  <div className="text-xs text-redhat-text-secondary mt-1">{activity.timestamp}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-6 pt-4 border-t border-redhat-grid-line">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-redhat-text-secondary">Total Requests:</span>
            <span className="ml-2 font-semibold text-white">{metrics.totalRequests}</span>
          </div>
          <div>
            <span className="text-redhat-text-secondary">Total Tokens:</span>
            <span className="ml-2 font-semibold text-white">{metrics.totalTokens.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-redhat-text-secondary">Active Replicas:</span>
            <span className="ml-2 font-semibold text-green-400">{metrics.activeLanes}/{metrics.totalLanes}</span>
          </div>
          <div>
            <span className="text-redhat-text-secondary">Efficiency:</span>
            <span className="ml-2 font-semibold text-blue-400">
              {metrics.cacheHitRate >= 75 ? 'Excellent' : metrics.cacheHitRate >= 50 ? 'Good' : 'Building...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityFeed
