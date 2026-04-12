import { useState, useEffect } from 'react'

const RaceLane = ({ title, status, progress, metrics, color }) => {
  const getStatusIcon = () => {
    if (status === 'ready') return '⏸️'
    if (status === 'running') return '🏃'
    if (status === 'complete') return '🏁'
    return '⏸️'
  }

  const getStatusText = () => {
    if (status === 'ready') return 'Ready'
    if (status === 'running') return 'Processing...'
    if (status === 'complete') return 'Complete!'
    return 'Ready'
  }

  return (
    <div className="glass rounded-2xl p-6 flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-redhat-text-secondary">
          <span>{getStatusIcon()}</span>
          <span>{getStatusText()}</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="flex-1 flex items-center mb-6">
        <div className="w-full">
          <div className="relative h-20 bg-redhat-dark-bg rounded-xl overflow-hidden border border-redhat-grid-line">
            {/* Progress Bar */}
            <div
              className={`absolute inset-y-0 left-0 ${color.replace('bg-', 'bg-').replace('500', '500/30')} transition-all duration-300`}
              style={{ width: `${progress}%` }}
            />

            {/* Racing Icon */}
            {status === 'running' && (
              <div
                className="absolute inset-y-0 flex items-center transition-all duration-300"
                style={{ left: `${Math.min(progress, 95)}%` }}
              >
                <div className="text-4xl animate-bounce">🏎️</div>
              </div>
            )}

            {/* Finish Flag */}
            {status === 'complete' && (
              <div className="absolute inset-y-0 right-4 flex items-center">
                <div className="text-4xl">🏁</div>
              </div>
            )}
          </div>

          {/* Progress Percentage */}
          <div className="text-right text-xs text-redhat-text-secondary mt-2">
            {progress.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-lg p-3 text-center">
          <div className="text-sm text-redhat-text-secondary mb-1">TTFT</div>
          <div className={`text-2xl font-bold ${metrics.ttft ? '' : 'text-redhat-text-tertiary'}`}>
            {metrics.ttft ? `${metrics.ttft.toFixed(3)}s` : '—'}
          </div>
        </div>
        <div className="glass rounded-lg p-3 text-center">
          <div className="text-sm text-redhat-text-secondary mb-1">Total Time</div>
          <div className={`text-2xl font-bold ${metrics.totalTime ? '' : 'text-redhat-text-tertiary'}`}>
            {metrics.totalTime ? `${metrics.totalTime.toFixed(2)}s` : '—'}
          </div>
        </div>
        <div className="glass rounded-lg p-3 text-center">
          <div className="text-sm text-redhat-text-secondary mb-1">Tokens</div>
          <div className={`text-2xl font-bold ${metrics.tokens ? '' : 'text-redhat-text-tertiary'}`}>
            {metrics.tokens || '—'}
          </div>
        </div>
        <div className="glass rounded-lg p-3 text-center">
          <div className="text-sm text-redhat-text-secondary mb-1">Tok/s</div>
          <div className={`text-2xl font-bold ${metrics.tokensPerSec ? '' : 'text-redhat-text-tertiary'}`}>
            {metrics.tokensPerSec ? metrics.tokensPerSec.toFixed(1) : '—'}
          </div>
        </div>
      </div>

      {/* Replica Info */}
      {metrics.replica && (
        <div className="mt-4 text-xs text-redhat-text-secondary text-center">
          Replica: {metrics.replica}
        </div>
      )}
    </div>
  )
}

const RaceTrack = ({ leftLane, rightLane }) => {
  return (
    <div className="grid grid-cols-2 gap-6 h-full">
      <RaceLane
        title="🧊 Cold Start"
        status={leftLane.status}
        progress={leftLane.progress}
        metrics={leftLane.metrics}
        color="bg-blue-500"
      />
      <RaceLane
        title="⚡ Cache Hit"
        status={rightLane.status}
        progress={rightLane.progress}
        metrics={rightLane.metrics}
        color="bg-green-500"
      />
    </div>
  )
}

export default RaceTrack
