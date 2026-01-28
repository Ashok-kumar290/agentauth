export function HowItWorks() {
  return (
    <div className="w-full max-w-6xl">
      <h2 className="text-5xl font-bold mb-16 tracking-tight">
        How It Works
      </h2>
      
      {/* Flow Diagram */}
      <div className="mb-16 flex items-center justify-center gap-8">
        <div className="border border-zinc-700 px-8 py-6 text-center min-w-[200px]">
          <div className="text-xl font-semibold">AI Agents</div>
        </div>
        
        <div className="text-blue-500 text-3xl">→</div>
        
        <div className="border-2 border-blue-500 px-8 py-6 text-center min-w-[200px] bg-blue-500/5">
          <div className="text-xl font-bold text-blue-500">AgentAuth</div>
        </div>
        
        <div className="text-blue-500 text-3xl">→</div>
        
        <div className="border border-zinc-700 px-8 py-6 text-center min-w-[200px]">
          <div className="text-xl font-semibold">Sensitive Actions</div>
        </div>
      </div>
      
      {/* Components */}
      <div className="grid grid-cols-2 gap-6">
        <div className="border border-zinc-800 p-6 bg-zinc-900/30">
          <div className="text-lg font-semibold mb-2 tracking-tight">
            Intent verification engine
          </div>
          <div className="text-zinc-500 text-sm">
            Validates what the agent is attempting
          </div>
        </div>
        
        <div className="border border-zinc-800 p-6 bg-zinc-900/30">
          <div className="text-lg font-semibold mb-2 tracking-tight">
            Voice & behavioral authentication
          </div>
          <div className="text-zinc-500 text-sm">
            Continuous identity verification
          </div>
        </div>
        
        <div className="border border-zinc-800 p-6 bg-zinc-900/30">
          <div className="text-lg font-semibold mb-2 tracking-tight">
            Policy-based execution gates
          </div>
          <div className="text-zinc-500 text-sm">
            Context-aware permission system
          </div>
        </div>
        
        <div className="border border-zinc-800 p-6 bg-zinc-900/30">
          <div className="text-lg font-semibold mb-2 tracking-tight">
            Spend & risk limits
          </div>
          <div className="text-zinc-500 text-sm">
            Economic boundaries for actions
          </div>
        </div>
      </div>
    </div>
  );
}
