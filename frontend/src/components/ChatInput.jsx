import { useState } from 'react'

const ChatInput = ({ onSendPrompt, onBatch, onStressTest, onCacheTest }) => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const quickPrompts = [
    { label: 'Short', text: 'What is AI?', icon: '⚡' },
    { label: 'Medium', text: 'Explain neural networks in simple terms.', icon: '🧠' },
    { label: 'Long', text: 'Write a detailed guide about artificial intelligence.', icon: '📚' }
  ]

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return
    setIsLoading(true)
    await onSendPrompt(prompt)
    setPrompt('')
    setIsLoading(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleBatch = async (count) => {
    if (!prompt.trim()) return
    setIsLoading(true)
    await onBatch(prompt, count)
    setPrompt('')
    setIsLoading(false)
    setShowActions(false)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Quick Actions */}
      {showActions && (
        <div className="mb-3 glass rounded-2xl p-4 animate-fadeIn">
          <div className="text-xs text-redhat-text-secondary mb-3">Quick Actions</div>
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleBatch(10)}
              disabled={!prompt.trim() || isLoading}
              className="glass hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-lg p-3 text-left"
            >
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-xs font-semibold">Batch 10</div>
              <div className="text-xs text-redhat-text-secondary mt-1">Send 10x</div>
            </button>
            <button
              onClick={onStressTest}
              disabled={isLoading}
              className="glass hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-lg p-3 text-left"
            >
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-xs font-semibold">Stress Test</div>
              <div className="text-xs text-redhat-text-secondary mt-1">50 requests</div>
            </button>
            <button
              onClick={onCacheTest}
              disabled={isLoading}
              className="glass hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all rounded-lg p-3 text-left"
            >
              <div className="text-2xl mb-1">📋</div>
              <div className="text-xs font-semibold">Cache Test</div>
              <div className="text-xs text-redhat-text-secondary mt-1">A-B-A pattern</div>
            </button>
            <button
              onClick={() => setShowActions(false)}
              className="glass hover:bg-white/10 transition-all rounded-lg p-3 text-center"
            >
              <div className="text-2xl mb-1">✕</div>
              <div className="text-xs font-semibold">Close</div>
            </button>
          </div>
        </div>
      )}

      {/* Quick Prompts */}
      {!prompt && !showActions && (
        <div className="mb-3 flex items-center justify-center gap-2">
          {quickPrompts.map((qp) => (
            <button
              key={qp.label}
              onClick={() => setPrompt(qp.text)}
              className="glass hover:bg-white/10 transition-all rounded-full px-4 py-2 text-sm flex items-center gap-2"
            >
              <span>{qp.icon}</span>
              <span>{qp.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Chat Input */}
      <div className="glass rounded-3xl p-2 shadow-2xl border border-white/10">
        <div className="flex items-end gap-2">
          {/* Actions Button */}
          <button
            onClick={() => setShowActions(!showActions)}
            className="flex-shrink-0 w-10 h-10 rounded-full glass hover:bg-white/10 transition-all flex items-center justify-center text-redhat-text-secondary hover:text-white"
            title="Quick Actions"
          >
            <span className="text-xl">+</span>
          </button>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Send a prompt to test distributed inference..."
              className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none py-3 px-2 max-h-32"
              rows="1"
              disabled={isLoading}
              style={{
                minHeight: '40px',
                maxHeight: '128px'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!prompt.trim() || isLoading}
            className={`
              flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              transition-all
              ${prompt.trim() && !isLoading
                ? 'bg-redhat-red hover:bg-red-700 text-white'
                : 'bg-redhat-dark-surface text-redhat-text-secondary cursor-not-allowed'
              }
            `}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-xl">↑</span>
            )}
          </button>
        </div>
      </div>

      {/* Helper Text */}
      <div className="mt-2 text-center text-xs text-redhat-text-secondary">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  )
}

export default ChatInput
