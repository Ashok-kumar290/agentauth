export function Market() {
  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-5xl font-bold mb-16 tracking-tight">
        Every acting agent needs authentication
      </h2>
      
      <div className="space-y-12">
        {/* Initial Wedge */}
        <div>
          <h3 className="text-sm font-mono text-blue-500 uppercase tracking-widest mb-6">
            Initial wedge
          </h3>
          <div className="border border-zinc-800 p-8 bg-zinc-900/30">
            <p className="text-xl text-zinc-300 leading-relaxed">
              Fintech agents, enterprise automation, voice workflows
            </p>
          </div>
        </div>
        
        {/* Expansion */}
        <div>
          <h3 className="text-sm font-mono text-blue-500 uppercase tracking-widest mb-6">
            Expansion
          </h3>
          <div className="border border-zinc-800 p-8 bg-zinc-900/30">
            <p className="text-xl text-zinc-300 leading-relaxed">
              Autonomous trading, procurement agents, consumer AI assistants
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
