export function WhatsBroken() {
  const issues = [
    {
      label: 'Legacy Auth',
      description: "Passwords, OTPs, static keys don't scale to autonomous actions",
    },
    {
      label: 'Silent Failures',
      description: 'Agent loops burn money without real-time verification',
    },
    {
      label: 'Exploitable Surfaces',
      description: 'Voice and LLM spoofing enable fraud',
    },
    {
      label: 'Economic Risk',
      description: 'No spend or authority boundaries',
    },
  ];

  return (
    <div className="w-full max-w-6xl">
      <h2 className="text-5xl font-bold mb-16 tracking-tight">
        What's Broken
      </h2>
      
      <div className="grid grid-cols-4 gap-8">
        {issues.map((issue, index) => (
          <div key={index} className="border border-zinc-800 p-6 bg-zinc-900/30">
            <div className="text-blue-500 font-mono text-sm mb-4">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="text-xl font-bold mb-4 tracking-tight">
              {issue.label}
            </div>
            <div className="text-zinc-400 text-sm leading-relaxed">
              {issue.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}