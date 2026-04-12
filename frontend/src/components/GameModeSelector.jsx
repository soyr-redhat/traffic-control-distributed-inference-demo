const GameModeSelector = ({ currentMode, onModeChange }) => {
  const gameModes = [
    {
      id: 'morning',
      name: 'Morning Commute',
      icon: '🌅',
      description: 'Gradual traffic increase',
      color: 'from-orange-500 to-yellow-500'
    },
    {
      id: 'black_friday',
      name: 'Black Friday Rush',
      icon: '🛍️',
      description: 'Maximum stress test',
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'convoy',
      name: 'Road Trip Convoy',
      icon: '🚗',
      description: 'Test cache-aware routing',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'night',
      name: 'Late Night',
      icon: '🌙',
      description: 'Demonstrate scale-to-zero',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'construction',
      name: 'Construction Zone',
      icon: '🏗️',
      description: 'Replica failure handling',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'speed',
      name: 'Speed Demon',
      icon: '⚡',
      description: 'Throughput competition',
      color: 'from-green-500 to-emerald-500'
    }
  ]

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
        <span className="text-redhat-red">🎯</span> Game Modes
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {gameModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              relative overflow-hidden rounded-xl p-4 transition-all
              ${currentMode === mode.id
                ? 'ring-2 ring-redhat-red scale-105'
                : 'glass hover:bg-white/10'
              }
            `}
          >
            {/* Background gradient */}
            {currentMode === mode.id && (
              <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-20`} />
            )}

            <div className="relative z-10">
              <div className="text-3xl mb-2">{mode.icon}</div>
              <div className="text-sm font-semibold mb-1">{mode.name}</div>
              <div className="text-xs text-redhat-text-secondary">{mode.description}</div>
            </div>
          </button>
        ))}
      </div>

      {currentMode && (
        <div className="mt-4 glass rounded-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold">
              Active Mode: {gameModes.find(m => m.id === currentMode)?.name}
            </span>
          </div>
          <button
            onClick={() => onModeChange(null)}
            className="text-xs text-redhat-text-secondary hover:text-white transition-colors"
          >
            Stop Mode
          </button>
        </div>
      )}
    </div>
  )
}

export default GameModeSelector
