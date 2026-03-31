import { useState } from 'react'

const PromptInput = ({ onSendPrompt, onBatch, onStressTest, onCacheTest }) => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const quickPrompts = [
    { label: 'Short', text: 'What is AI?', description: 'Fast response, ~10 tokens' },
    { label: 'Medium', text: 'Explain how neural networks work in simple terms.', description: 'Normal length, ~100 tokens' },
    { label: 'Long', text: 'Write a detailed guide explaining the history of artificial intelligence, including major breakthroughs and key researchers.', description: 'Long response, ~500 tokens' },
    { label: 'Code', text: 'Write a Python function that implements a binary search algorithm with comments.', description: 'Code generation' }
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
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-display font-bold flex items-center gap-2">
          <span className="text-redhat-red">✍️</span> Send a Prompt
        </h2>
        <button
          className="text-gray-400 hover:text-white transition-colors text-sm"
          title="Learn about prompt routing"
        >
          <span className="text-lg">ℹ️</span>
        </button>
      </div>

      {/* Prompt Input */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Write a story about a robot learning to cook..."
        className="w-full h-32 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-redhat-red/50 focus:border-redhat-red resize-none font-mono text-sm"
        disabled={isLoading}
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        <button
          onClick={handleSend}
          disabled={!prompt.trim() || isLoading}
          className="bg-redhat-red hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors rounded-lg px-4 py-3 font-semibold flex items-center justify-center gap-2"
        >
          <span className="text-xl">🚀</span>
          <span>Send</span>
        </button>

        <button
          onClick={() => handleBatch(10)}
          disabled={!prompt.trim() || isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors rounded-lg px-4 py-3 font-semibold flex items-center justify-center gap-2"
        >
          <span className="text-xl">⚡</span>
          <span>Batch 10</span>
        </button>

        <button
          onClick={onStressTest}
          disabled={isLoading}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors rounded-lg px-4 py-3 font-semibold flex items-center justify-center gap-2"
        >
          <span className="text-xl">🔥</span>
          <span>Stress Test</span>
        </button>

        <button
          onClick={onCacheTest}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors rounded-lg px-4 py-3 font-semibold flex items-center justify-center gap-2"
        >
          <span className="text-xl">📋</span>
          <span>Cache Test</span>
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="mt-6">
        <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span>Try these:</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickPrompts.map((qp) => (
            <button
              key={qp.label}
              onClick={() => setPrompt(qp.text)}
              className="glass hover:bg-white/10 transition-all rounded-lg p-3 text-left group"
              title={qp.description}
            >
              <div className="font-semibold text-sm mb-1">{qp.label}</div>
              <div className="text-xs text-gray-400 line-clamp-2">{qp.text}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mt-4 glass rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-redhat-red border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-300">Processing requests...</span>
        </div>
      )}
    </div>
  )
}

export default PromptInput
