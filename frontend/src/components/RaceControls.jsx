import { useState } from 'react'

const RaceControls = ({ onStartRace, isRacing }) => {
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedPreset, setSelectedPreset] = useState(null)

  const presetPrompts = [
    {
      id: 'short',
      label: 'Short Response',
      icon: '⚡',
      prompt: 'What is artificial intelligence?',
      description: '~50 tokens'
    },
    {
      id: 'medium',
      label: 'Medium Response',
      icon: '🧠',
      prompt: 'Explain how neural networks work in simple terms.',
      description: '~150 tokens'
    },
    {
      id: 'long',
      label: 'Long Response',
      icon: '📚',
      prompt: 'Write a comprehensive guide about machine learning, covering supervised learning, unsupervised learning, and reinforcement learning.',
      description: '~300 tokens'
    }
  ]

  const handleStartRace = (prompt) => {
    onStartRace(prompt)
    setCustomPrompt('')
    setSelectedPreset(null)
  }

  return (
    <div className="space-y-4">
      {/* Preset Prompts */}
      <div>
        <div className="text-sm font-semibold text-gray-400 mb-3">Quick Start</div>
        <div className="grid grid-cols-3 gap-3">
          {presetPrompts.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleStartRace(preset.prompt)}
              disabled={isRacing}
              className={`
                glass hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed
                transition-all rounded-xl p-4 text-left
                ${selectedPreset === preset.id ? 'ring-2 ring-redhat-red' : ''}
              `}
            >
              <div className="text-3xl mb-2">{preset.icon}</div>
              <div className="text-sm font-semibold mb-1">{preset.label}</div>
              <div className="text-xs text-gray-500">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt */}
      <div>
        <div className="text-sm font-semibold text-gray-400 mb-3">Custom Prompt</div>
        <div className="glass rounded-2xl p-2">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Type your own prompt to race..."
                className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none py-3 px-3"
                rows="2"
                disabled={isRacing}
                onInput={(e) => {
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
            </div>
            <button
              onClick={() => handleStartRace(customPrompt)}
              disabled={!customPrompt.trim() || isRacing}
              className={`
                flex-shrink-0 rounded-xl px-6 py-3 font-semibold transition-all
                ${customPrompt.trim() && !isRacing
                  ? 'bg-redhat-red hover:bg-red-700 text-white'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {isRacing ? '⏳ Racing...' : '🏁 Start Race'}
            </button>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="glass rounded-xl p-4 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <div className="font-semibold mb-1">How it works</div>
            <div className="text-sm text-gray-400">
              The same prompt runs twice: once with a cold start (no cache) and once with prefix caching enabled.
              Watch the dramatic performance difference! Cache hits are typically <strong className="text-green-400">30x faster</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RaceControls
