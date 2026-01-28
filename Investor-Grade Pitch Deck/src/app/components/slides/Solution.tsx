export function Solution() {
  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-6xl font-bold mb-6 tracking-tight">
        AgentAuth
      </h2>
      
      <p className="text-2xl text-zinc-400 mb-16 font-light">
        A real-time authentication and authorization layer for AI agents
      </p>
      
      <div className="space-y-8 mb-16">
        <div className="flex items-start gap-4">
          <div className="text-blue-500 font-mono text-sm mt-2">—</div>
          <p className="text-2xl text-zinc-300">
            Verifies <span className="text-white font-semibold">who</span> is acting
          </p>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="text-blue-500 font-mono text-sm mt-2">—</div>
          <p className="text-2xl text-zinc-300">
            Validates <span className="text-white font-semibold">what</span> the agent intends to do
          </p>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="text-blue-500 font-mono text-sm mt-2">—</div>
          <p className="text-2xl text-zinc-300">
            Confirms <span className="text-white font-semibold">whether</span> it is allowed right now
          </p>
        </div>
      </div>
      
      <div className="mt-16 pt-8 border-t border-zinc-800">
        <p className="text-xl text-zinc-500 tracking-tight">
          All checks happen <span className="text-blue-500 font-semibold">before execution</span>.
        </p>
      </div>
    </div>
  );
}
