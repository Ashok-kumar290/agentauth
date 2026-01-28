export function WhyWeWin() {
  return (
    <div className="w-full max-w-6xl">
      <h2 className="text-5xl font-bold mb-16 tracking-tight">
        Why We Win
      </h2>
      
      <div className="grid grid-cols-2 gap-12">
        {/* Technical Moat */}
        <div>
          <h3 className="text-2xl font-bold mb-8 text-blue-500 tracking-tight">
            Technical moat
          </h3>
          
          <div className="space-y-6">
            <div className="border-l-2 border-zinc-800 pl-6">
              <p className="text-lg text-zinc-300 leading-relaxed">
                Real-time intent validation
              </p>
            </div>
            
            <div className="border-l-2 border-zinc-800 pl-6">
              <p className="text-lg text-zinc-300 leading-relaxed">
                Designed specifically for autonomous agents
              </p>
            </div>
            
            <div className="border-l-2 border-zinc-800 pl-6">
              <p className="text-lg text-zinc-300 leading-relaxed">
                Works across voice, API, and system actions
              </p>
            </div>
          </div>
        </div>
        
        {/* Strategic Moat */}
        <div>
          <h3 className="text-2xl font-bold mb-8 text-blue-500 tracking-tight">
            Strategic moat
          </h3>
          
          <div className="space-y-6">
            <div className="border-l-2 border-zinc-800 pl-6">
              <p className="text-lg text-zinc-300 leading-relaxed">
                Embedded infrastructure layer
              </p>
            </div>
            
            <div className="border-l-2 border-zinc-800 pl-6">
              <p className="text-lg text-zinc-300 leading-relaxed">
                High switching costs
              </p>
            </div>
            
            <div className="border-l-2 border-zinc-800 pl-6">
              <p className="text-lg text-zinc-300 leading-relaxed">
                Foundational identity layer, not a feature
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
