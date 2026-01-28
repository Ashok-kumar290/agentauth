export function CoreInsight() {
  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-5xl font-bold mb-16 tracking-tight">
        Authentication must evolve
      </h2>
      
      <div className="space-y-12">
        <div className="flex items-center gap-8">
          <div className="text-zinc-600 text-6xl font-light">
            Humans
          </div>
          <div className="text-zinc-400 text-3xl">
            authenticate once.
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="text-white text-6xl font-light">
            Agents
          </div>
          <div className="text-zinc-200 text-3xl">
            must authenticate <span className="text-blue-500 font-bold">continuously</span>.
          </div>
        </div>
      </div>
      
      <div className="mt-20 pt-12 border-t border-zinc-800">
        <p className="text-2xl text-zinc-300 leading-relaxed">
          Authentication must be context-aware, intent-aware, and economically bounded.
        </p>
      </div>
    </div>
  );
}
