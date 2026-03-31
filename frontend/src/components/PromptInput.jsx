import { useState } from 'react'

const PromptInput = ({ onSendPrompt, onBatch, onStressTest, onCacheTest }) => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const quickPrompts = [
    { label: 'Short', text: 'What is AI?', emoji: '⚡' },
    { label: 'Medium', text: 'Explain neural networks in simple terms.', emoji: '🧠' },
    { label: 'Long', text: 'Write a detailed guide about artificial intelligence.', emoji: '📚' }
  ]

  const handleSend = async () => {
    if (!prompt.trim()) return
    setIsLoading(true)
    await onSendPrompt(prompt)
    setIsLoading(false)
  }

  const handleBatch = async (count) => {
    if (!prompt.trim()) return
    setIsLoading(true)
    await onBatch(prompt, count)
    setIsLoading(false)
  }

  return (
    <div className="space-y-3">
      {/* Prompt Input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Type your prompt here..."
        className="w-full h-20 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-redhat-red/50 focus:border-redhat-red resize-none"
        disabled={isLoading}
      />

      {/* Quick Prompts */}
      <div className="grid grid-cols-3 gap-2">
        {quickPrompts.map((qp) => (
          <button
            key={qp.label}
            onClick={() => setPrompt(qp.text)}
            className="glass hover:bg-white/10 transition-all rounded-lg p-2 text-center"
            title={qp.text}
          >
            <div className="text-lg">{qp.emoji}</div>
            <div className="text-xs font-semibold mt-1">{qp.label}</div>
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleSend}
          disabled={!prompt.trim() || isLoading}
          className="bg-redhat-red hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors rounded-lg px-3 py-2 text-sm font-semibold"
        >
          🚀 Send
        </button>

        <button
          onClick={() => handleBatch(10)}
          disabled={!prompt.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors rounded-lg px-3 py-2 text-sm font-semibold"
        >
          ⚡ Batch
        </button>

        <button
          onClick={onStressTest}
          disabled={isLoading}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors rounded-lg px-3 py-2 text-sm font-semibold"
        >
          🔥 Stress
        </button>

        <button
          onClick={onCacheTest}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors rounded-lg px-3 py-2 text-sm font-semibold"
        >
          📋 Cache
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="glass rounded-lg px-3 py-2 flex items-center gap-2 text-xs">
          <div className="w-3 h-3 border-2 border-redhat-red border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-300">Processing...</span>
        </div>
      )}
    </div>
  )
}

export default PromptInput
