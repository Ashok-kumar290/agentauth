export function ProductInAction() {
  const steps = [
    {
      number: '1',
      title: 'User authorizes agent via voice',
      description: 'Biometric and contextual verification',
    },
    {
      number: '2',
      title: 'Agent requests a transaction',
      description: 'Intent is captured and logged',
    },
    {
      number: '3',
      title: 'AgentAuth verifies identity, context, and limits in real time',
      description: 'Policy engine evaluates all constraints',
    },
    {
      number: '4',
      title: 'Transaction executes only if safe',
      description: 'Authorization granted or denied instantly',
    },
  ];

  return (
    <div className="w-full max-w-5xl">
      <h2 className="text-5xl font-bold mb-16 tracking-tight">
        Product in Action
      </h2>
      
      <div className="space-y-8 mb-16">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full border-2 border-blue-500 flex items-center justify-center text-blue-500 font-mono text-lg">
              {step.number}
            </div>
            <div className="flex-1 pt-2">
              <div className="text-xl font-semibold mb-2 tracking-tight">
                {step.title}
              </div>
              <div className="text-zinc-500">
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-16 pt-8 border-t border-zinc-800">
        <p className="text-2xl text-zinc-400 tracking-tight">
          No OTPs. No blind trust. No silent failures.
        </p>
      </div>
    </div>
  );
}
