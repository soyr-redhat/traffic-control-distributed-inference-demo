import { useState } from 'react'

const PromptInput = ({ onSendPrompt, onBatch, onStressTest, onCacheTest }) => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const quickPrompts = [
    { label: 'SHORT', text: 'What is AI?', code: 'Q1' },
    { label: 'MEDIUM', text: 'Explain neural networks in simple terms.', code: 'Q2' },
    { label: 'LONG', text: 'Write a detailed guide about artificial intelligence history.', code: 'Q3' }
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
    <div className="space-y-3 font-tech text-xs">
      {/* Prompt Input */}
      <div className="relative">
        <div className="absolute -top-3 left-2 bg-cyber-bg-light px-2 text-cyber-cyan opacity-60">
          PROMPT_INPUT
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="> Enter your prompt..."
          className="w-full h-20 bg-cyber-bg border-2 border-cyber-cyan rounded px-3 py-2 text-cyber-cyan placeholder-cyber-cyan placeholder-opacity-40 focus:outline-none focus:border-cyber-magenta focus:shadow-[0_0_10px_rgba(255,0,255,0.5)] resize-none transition-all"
          disabled={isLoading}
        />
      </div>

      {/* Quick Prompts */}
      <div>
        <div className="text-cyber-cyan opacity-60 mb-2">QUICK_SELECT:</div>
        <div className="grid grid-cols-3 gap-2">
          {quickPrompts.map((qp) => (
            <button
              key={qp.label}
              onClick={() => setPrompt(qp.text)}
              className="border border-cyber-cyan bg-cyber-bg hover:bg-cyber-bg-light hover:border-cyber-magenta transition-all p-2 text-center group"
              title={qp.text}
            >
              <div className="text-cyber-cyan group-hover:neon-text-magenta transition-all">
                [{qp.code}]
              </div>
              <div className="text-xs opacity-60 mt-1">{qp.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div>
        <div className="text-cyber-cyan opacity-60 mb-2">ACTIONS:</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSend}
            disabled={!prompt.trim() || isLoading}
            className="border-2 border-cyber-cyan bg-cyber-bg text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-bg disabled:opacity-40 disabled:cursor-not-allowed transition-all p-2 font-bold tracking-wider"
          >
            [SEND]
          </button>

          <button
            onClick={() => handleBatch(10)}
            disabled={!prompt.trim() || isLoading}
            className="border-2 border-cyber-green bg-cyber-bg text-cyber-green hover:bg-cyber-green hover:text-cyber-bg disabled:opacity-40 disabled:cursor-not-allowed transition-all p-2 font-bold tracking-wider"
          >
            [BATCH]
          </button>

          <button
            onClick={onStressTest}
            disabled={isLoading}
            className="border-2 border-cyber-magenta bg-cyber-bg text-cyber-magenta hover:bg-cyber-magenta hover:text-cyber-bg disabled:opacity-40 disabled:cursor-not-allowed transition-all p-2 font-bold tracking-wider"
          >
            [STRESS]
          </button>

          <button
            onClick={onCacheTest}
            disabled={isLoading}
            className="border-2 border-cyber-yellow bg-cyber-bg text-cyber-yellow hover:bg-cyber-yellow hover:text-cyber-bg disabled:opacity-40 disabled:cursor-not-allowed transition-all p-2 font-bold tracking-wider"
          >
            [CACHE]
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="border border-cyber-cyan bg-cyber-bg px-3 py-2 flex items-center gap-2 animate-fadeIn">
          <div className="w-2 h-2 bg-cyber-cyan animate-pulseNeon" />
          <span className="text-cyber-cyan">PROCESSING<span className="cursor-blink"></span></span>
        </div>
      )}
    </div>
  )
}

export default PromptInput
