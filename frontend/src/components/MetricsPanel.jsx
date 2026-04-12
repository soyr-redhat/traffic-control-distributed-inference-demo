const MetricsPanel = ({ metrics, lanes }) => {
  const metricsData = [
    {
      label: 'Throughput',
      value: `${metrics.throughput.toFixed(1)} req/s`,
      icon: '📊',
      color: 'text-blue-400'
    },
    {
      label: 'Avg Latency',
      value: `${metrics.avgLatency.toFixed(2)}s`,
      icon: '⏱️',
      color: 'text-green-400'
    },
    {
      label: 'Cache Hit Rate',
      value: `${metrics.cacheHitRate.toFixed(0)}%`,
      icon: '🎯',
      color: 'text-purple-400'
    },
    {
      label: 'Active Lanes',
      value: `${metrics.activeLanes}/${metrics.totalLanes}`,
      icon: '🚀',
      color: 'text-orange-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Metrics Cards */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
          <span className="text-redhat-red">📈</span> Performance Metrics
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {metricsData.map((metric) => (
            <div key={metric.label} className="bg-redhat-dark-elevated/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{metric.icon}</span>
                <span className="text-xs text-redhat-text-secondary">{metric.label}</span>
              </div>
              <div className={`text-2xl font-bold ${metric.color}`}>
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lane Status */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
          <span className="text-redhat-red">🛣️</span> Lane Status
        </h2>
        <div className="space-y-3">
          {lanes.map((lane, index) => (
            <div key={lane.id} className="bg-redhat-dark-elevated/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    lane.status === 'active' ? 'bg-green-500' :
                    lane.status === 'scaling' ? 'bg-yellow-500 animate-pulse' :
                    'bg-redhat-dark-bg0'
                  }`} />
                  <span className="font-semibold">
                    {index === 3 ? 'HOV (Cache)' : `Lane ${index + 1}`}
                  </span>
                </div>
                <div className="text-sm text-redhat-text-secondary">
                  {lane.status === 'active' ? `${lane.requestsPerSec} req/s` :
                   lane.status === 'scaling' ? 'Scaling...' : 'Closed'}
                </div>
              </div>

              {/* Load bar */}
              {lane.status === 'active' && (
                <div className="w-full bg-redhat-dark-surface rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      lane.load > 80 ? 'bg-red-500' :
                      lane.load > 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${lane.load}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MetricsPanel
