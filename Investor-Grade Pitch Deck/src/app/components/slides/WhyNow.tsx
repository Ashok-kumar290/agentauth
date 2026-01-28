export function WhyNow() {
  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-5xl font-bold mb-12 tracking-tight">
        Three forces just collided
      </h2>
      
      <div className="space-y-8 mb-16">
        <div className="flex items-start gap-4">
          <div className="text-blue-500 font-mono text-sm mt-1">—</div>
          <p className="text-2xl text-zinc-300">
            Agentic AI is in production
          </p>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="text-blue-500 font-mono text-sm mt-1">—</div>
          <p className="text-2xl text-zinc-300">
            Voice interfaces are transactional
          </p>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="text-blue-500 font-mono text-sm mt-1">—</div>
          <p className="text-2xl text-zinc-300">
            Financial stakes are real
          </p>
        </div>
      </div>
      
      <div className="max-w-3xl border-l-2 border-blue-500 pl-8 py-4 mt-16">
        <p className="text-2xl italic text-zinc-400 leading-relaxed">
          "The question shifted from 'Can AI act?' to 'Should it be allowed to act safely?'"
        </p>
      </div>
    </div>
  );
}
