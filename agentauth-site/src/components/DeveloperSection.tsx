"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/animations";

/**
 * Developer Section - Code examples with syntax highlighting
 */

type Tab = "sdk" | "api" | "cli";

const codeExamples: Record<Tab, { filename: string; language: string; code: string }> = {
  sdk: {
    filename: "agent.ts",
    language: "typescript",
    code: `import { AgentAuth } from "@agentauth/sdk";

const auth = new AgentAuth({ 
  apiKey: process.env.AGENTAUTH_API_KEY 
});

// Before making a purchase
const decision = await auth.authorize({
  agentId: "agent_shopping_7x8k2m",
  action: "payment",
  merchant: "amazon.com",
  amount: 149.99,
  currency: "USD",
});

if (decision.approved) {
  await processPayment();
  await auth.confirm(decision.id);
} else {
  console.log("Blocked:", decision.reason);
}`,
  },
  api: {
    filename: "request.sh",
    language: "bash",
    code: `curl -X POST https://api.agentauth.in/v1/authorize \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "agent_shopping_7x8k2m",
    "action": "payment",
    "merchant": "amazon.com",
    "amount": 149.99,
    "currency": "USD"
  }'

# Response
{
  "id": "auth_8x9k2m",
  "decision": "approved",
  "latency_ms": 34
}`,
  },
  cli: {
    filename: "terminal",
    language: "bash",
    code: `# Install the CLI
npm install -g @agentauth/cli

# Authenticate
agentauth login

# Create a new agent
agentauth agents create --name "Shopping Agent"
✓ Created: agent_shopping_7x8k2m

# Set spending policy
agentauth policies set agent_shopping_7x8k2m \\
    --daily-limit 500 \\
    --require-approval-above 200 \\
    --allowed-merchants "amazon.com,bestbuy.com"

✓ Policy applied`,
  },
};

export function DeveloperSection() {
  const [activeTab, setActiveTab] = useState<Tab>("sdk");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeExamples[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "sdk", label: "TypeScript SDK" },
    { id: "api", label: "REST API" },
    { id: "cli", label: "CLI" },
  ];

  return (
    <section className="py-32 border-t border-zinc-800/50 bg-black" id="developers">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.1)}
          >
            <motion.p variants={staggerItem} className="text-sm text-emerald-400 font-medium uppercase tracking-widest mb-4">
              For Developers
            </motion.p>
            <motion.h2 variants={staggerItem} className="text-3xl lg:text-4xl font-semibold text-white tracking-tight mb-6">
              Integrate in minutes.
            </motion.h2>
            <motion.p variants={staggerItem} className="text-lg text-zinc-400 leading-relaxed mb-8">
              Three lines to authorize. Full SDKs for Python, TypeScript, and Go. 
              Comprehensive documentation and examples to get you started fast.
            </motion.p>

            <motion.div variants={staggerItem} className="flex flex-wrap gap-4">
              <a
                href="/docs"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Read the Docs
              </a>
              <a
                href="https://github.com/agentauth"
                className="inline-flex items-center gap-2 px-6 py-3 text-zinc-300 font-medium rounded-xl border border-zinc-700 hover:border-zinc-600 hover:text-white transition-colors"
              >
                View on GitHub
              </a>
            </motion.div>
          </motion.div>

          {/* Right: Code display */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
              {/* Tab bar */}
              <div className="flex border-b border-zinc-800/50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-6 py-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id 
                        ? "text-white" 
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeDevTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Code content */}
              <div className="relative">
                {/* File name bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">
                      {codeExamples[activeTab].filename}
                    </span>
                  </div>
                  <motion.button
                    onClick={handleCopy}
                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </motion.button>
                </div>

                {/* Code */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 overflow-x-auto"
                  >
                    <pre className="text-sm font-mono text-zinc-300 leading-relaxed">
                      <code>{codeExamples[activeTab].code}</code>
                    </pre>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
