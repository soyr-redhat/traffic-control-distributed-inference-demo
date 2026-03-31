import { useState } from 'react'

const InfoModal = ({ isOpen, onClose, topic }) => {
  if (!isOpen) return null

  const content = {
    router: {
      title: 'SMART_ROUTING_PROTOCOL',
      sections: [
        {
          title: '[STEP_1] CACHE_CHECK',
          content: 'SYSTEM SCANS FOR IDENTICAL PROMPTS IN CACHE TABLE. IF MATCH FOUND, ROUTE TO SAME REPLICA FOR PREFIX CACHE HIT. SPEEDS UP PROCESSING BY 32x.'
        },
        {
          title: '[STEP_2] LOAD_BALANCE',
          content: 'IF NO CACHE MATCH, SELECT REPLICA WITH LOWEST QUEUE_DEPTH. DISTRIBUTES WORKLOAD EVENLY ACROSS ALL ACTIVE NODES.'
        },
        {
          title: '[STEP_3] AUTO_SCALE',
          content: 'MONITOR LOAD CONTINUOUSLY. IF AVG_LOAD > 70%, ACTIVATE NEW REPLICA. IF AVG_LOAD < 15%, DEACTIVATE IDLE REPLICA TO SAVE RESOURCES.'
        },
        {
          title: '[SYSTEM_NOTE]',
          content: 'THIS IS LLM-D (LLM DISTRIBUTED) PROTOCOL. INTELLIGENT REQUEST ROUTING ACROSS MULTIPLE vLLM INSTANCES FOR OPTIMAL PERFORMANCE.'
        }
      ]
    },
    metrics: {
      title: 'METRICS_DOCUMENTATION',
      sections: [
        {
          title: 'THROUGHPUT [tok/s]',
          content: 'TOTAL TOKENS GENERATED PER SECOND ACROSS ALL REPLICAS. HIGHER VALUE = BETTER GPU UTILIZATION AND SYSTEM EFFICIENCY.'
        },
        {
          title: 'CACHE_HIT_RATE [%]',
          content: 'PERCENTAGE OF REQUESTS HITTING PREFIX CACHE. UNCACHED: ~2.5s | CACHED: ~0.08s = 32x SPEEDUP. TARGET: >75%.'
        },
        {
          title: 'TTFT [seconds]',
          content: 'TIME TO FIRST TOKEN. MEASURES LATENCY FROM REQUEST TO FIRST RESPONSE. LOWER = BETTER USER EXPERIENCE. CACHE HITS DRAMATICALLY REDUCE TTFT.'
        },
        {
          title: 'QUEUE_DEPTH',
          content: 'NUMBER OF WAITING REQUESTS PER REPLICA. DRIVES AUTO-SCALING DECISIONS. HIGH QUEUE_DEPTH → SCALE UP. LOW QUEUE_DEPTH → SCALE DOWN.'
        }
      ]
    },
    llmd: {
      title: 'LLM-D_SYSTEM_INFO',
      sections: [
        {
          title: '[OVERVIEW]',
          content: 'LLM DISTRIBUTED (LLM-D) = INTELLIGENT REQUEST ROUTER FOR MULTIPLE vLLM INFERENCE REPLICAS. MAXIMIZES THROUGHPUT WHILE MINIMIZING LATENCY.'
        },
        {
          title: '[FEATURES]',
          content: '• PREFIX_CACHE_AWARE_ROUTING\n• DYNAMIC_LOAD_BALANCING\n• AUTOMATIC_SCALING_ON_DEMAND\n• REQUEST_PRIORITIZATION\n• HEALTH_MONITORING_FAILOVER'
        },
        {
          title: '[WHY_IT_MATTERS]',
          content: 'RUNNING LARGE LANGUAGE MODELS AT SCALE REQUIRES DISTRIBUTED LOAD ACROSS MULTIPLE GPUs. LLM-D MAKES THIS AUTOMATIC AND INTELLIGENT = BETTER PERFORMANCE + LOWER COSTS.'
        },
        {
          title: '[THIS_DEMO]',
          content: 'RUNS 3 ACTUAL vLLM REPLICAS WITH MISTRAL-SMALL-24B. ROUTING LOGIC DEMONSTRATES LLM-D BEHAVIOR USING REAL INFERENCE DATA.'
        }
      ]
    },
    caching: {
      title: 'PREFIX_CACHING_EXPLAINED',
      sections: [
        {
          title: '[MECHANISM]',
          content: 'WHEN PROCESSING PROMPT, MODEL COMPUTES KV_CACHE FOR EACH TOKEN. IF SIMILAR PROMPT SENT, vLLM REUSES CACHED COMPUTATION INSTEAD OF RECALCULATING FROM SCRATCH.'
        },
        {
          title: '[PERFORMANCE]',
          content: 'WITHOUT_CACHE: 2.5s\nWITH_CACHE: 0.08s\n\nRESULT: 32x FASTER! MEASURED FROM ACTUAL INFERENCE IN THIS DEMO.'
        },
        {
          title: '[TEST_IT]',
          content: 'CLICK [CACHE] BUTTON TO RUN A-B-A PATTERN TEST. SENDS SAME PROMPT TWICE. OBSERVE DRAMATIC SPEEDUP ON SECOND REQUEST.'
        },
        {
          title: '[SMART_ROUTING]',
          content: 'ROUTER REMEMBERS WHICH REPLICA PROCESSED WHICH PROMPT. SIMILAR PROMPTS GET ROUTED TO SAME REPLICA TO MAXIMIZE CACHE HITS.'
        }
      ]
    }
  }

  const data = content[topic] || content.router

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 font-tech">
      <div className="terminal-border bg-cyber-bg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b-2 border-cyber-cyan px-6 py-4 flex items-center justify-between bg-cyber-bg-light">
          <h2 className="text-lg font-display font-bold neon-text tracking-wider">{data.title}</h2>
          <button
            onClick={onClose}
            className="text-3xl text-cyber-cyan hover:text-cyber-magenta transition-colors leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {data.sections.map((section, idx) => (
            <div key={idx} className="border border-cyber-cyan bg-cyber-bg-light p-4">
              <h3 className="font-bold text-sm mb-2 text-cyber-magenta neon-text-magenta">
                {section.title}
              </h3>
              <p className="text-cyber-cyan text-xs whitespace-pre-line leading-relaxed opacity-90">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-cyber-cyan px-6 py-4 bg-cyber-bg-light">
          <button
            onClick={onClose}
            className="w-full border-2 border-cyber-cyan bg-cyber-bg text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-bg transition-all py-2 font-bold tracking-wider"
          >
            [CLOSE]
          </button>
        </div>
      </div>
    </div>
  )
}

export default InfoModal
