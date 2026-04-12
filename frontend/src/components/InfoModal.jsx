const InfoModal = ({ isOpen, onClose, topic }) => {
  if (!isOpen) return null

  const content = {
    router: {
      title: '🧠 How Smart Routing Works',
      sections: [
        {
          title: '1️⃣ Check Cache',
          content: 'Has this prompt (or similar) been sent before? If yes, route to the same replica to leverage prefix caching for massive speedup.'
        },
        {
          title: '2️⃣ Load Balance',
          content: 'If no cache match, select the replica with the lowest queue depth. This distributes work evenly across all active replicas.'
        },
        {
          title: '3️⃣ Auto-Scale',
          content: 'Monitor load continuously. If average load > 70%, open a new replica. If load < 15%, close idle replicas to save resources.'
        },
        {
          title: '💡 Real-World Usage',
          content: 'This is what LLM-D (LLM Distributed) does automatically! It intelligently routes requests across multiple vLLM instances for optimal performance.'
        }
      ]
    },
    metrics: {
      title: '📊 Understanding the Metrics',
      sections: [
        {
          title: 'Throughput (tokens/sec)',
          content: 'Total tokens generated per second across all replicas. Higher throughput means better GPU utilization and more work getting done.'
        },
        {
          title: 'Cache Hit Rate',
          content: 'Percentage of requests that hit the prefix cache. Uncached requests take ~2.5s, while cached requests complete in ~0.08s - that\'s 32x faster! ⚡'
        },
        {
          title: 'TTFT (Time To First Token)',
          content: 'How quickly the first token appears. Lower TTFT means better user experience. Cache hits dramatically reduce TTFT from seconds to milliseconds.'
        },
        {
          title: 'Queue Depth',
          content: 'Number of waiting requests per replica. This metric drives auto-scaling decisions. High queue depth signals the need for more replicas.'
        }
      ]
    },
    llmd: {
      title: '🌐 What is LLM-D?',
      sections: [
        {
          title: 'Overview',
          content: 'LLM Distributed (LLM-D) is an intelligent request router that sits in front of multiple vLLM inference replicas. It maximizes throughput while minimizing latency.'
        },
        {
          title: '✨ Key Features',
          content: '• Prefix-cache aware routing\n• Dynamic load balancing\n• Automatic scaling based on demand\n• Request prioritization\n• Health monitoring and failover'
        },
        {
          title: '🎯 Why It Matters',
          content: 'Running large language models at scale requires distributing load across multiple GPUs. LLM-D makes this automatic and intelligent, giving you better performance with lower costs.'
        },
        {
          title: '🛠️ This Demo',
          content: 'This demo uses 3 actual vLLM replicas running Mistral-Small-24B. The routing logic you see here demonstrates LLM-D behavior using real inference!'
        }
      ]
    },
    caching: {
      title: '⚡ How This Demo Works',
      sections: [
        {
          title: 'What is Prefix Caching?',
          content: 'When processing a prompt, vLLM computes and stores "KV cache" for each token. When the same (or similar) prompt arrives again, vLLM reuses this cached computation instead of recomputing from scratch.'
        },
        {
          title: '🏁 The Race',
          content: 'Left Lane (🧊 Cold Start): First time the model sees this prompt - no cache available\n\nRight Lane (⚡ Cache Hit): Same prompt sent again - leverages cached computations for massive speedup'
        },
        {
          title: '🎯 Real Performance',
          content: 'Typical results:\n• Cold Start TTFT: ~2.5s\n• Cached TTFT: ~0.08s\n\nThat\'s 30x faster! All measurements come from real vLLM inference running on distributed replicas.'
        },
        {
          title: '🧠 Distributed Routing',
          content: 'Behind the scenes, an intelligent router remembers which replica processed each prompt. When you send the same prompt twice, it routes to the same replica to maximize cache hits.'
        },
        {
          title: '💡 Why This Matters',
          content: 'In production, many prompts share common patterns (system prompts, few-shot examples). Prefix caching can reduce inference costs by 30x and dramatically improve user experience.'
        }
      ]
    }
  }

  const data = content[topic] || content.router

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-redhat-dark-bg border border-redhat-grid-line rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-redhat-dark-bg border-b border-redhat-grid-line px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold">{data.title}</h2>
          <button
            onClick={onClose}
            className="text-redhat-text-secondary hover:text-redhat-text-primary transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {data.sections.map((section, idx) => (
            <div key={idx} className="glass rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-redhat-red">
                {section.title}
              </h3>
              <p className="text-redhat-text-secondary text-sm whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-redhat-dark-bg border-t border-redhat-grid-line px-6 py-4">
          <button
            onClick={onClose}
            className="w-full bg-redhat-red hover:bg-red-700 transition-colors rounded-lg px-4 py-3 font-semibold"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

export default InfoModal
