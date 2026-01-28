export function Problem() {
  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-5xl font-bold mb-12 tracking-tight">
        Human-centric authentication breaks under autonomy
      </h2>
      
      <div className="max-w-3xl">
        <p className="text-2xl text-zinc-300 leading-relaxed">
          AI agents now execute payments, call APIs, and act on behalf of enterprises, 
          but legacy auth systems were built for humans, not autonomous systems.
        </p>
        
        <p className="text-2xl text-zinc-300 leading-relaxed mt-8">
          Enterprises trust agents with execution, but not identity.
        </p>
      </div>
    </div>
  );
}
