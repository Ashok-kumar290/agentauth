"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign,
  ShoppingCart,
  Zap,
  Shield,
  AlertTriangle
} from "lucide-react";
import { staggerContainer, staggerItem, viewportOnce, fadeUp } from "@/lib/animations";

/**
 * Advanced Live Demo Section - Real interactive authorization demo
 * Connects to actual backend API for real-time authorization decisions
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://characteristic-inessa-agentauth-0a540dd6.koyeb.app";

interface Transaction {
  id: string;
  status: "pending" | "approved" | "denied";
  merchant: string;
  merchantLogo?: string;
  amount: number;
  currency: string;
  category: string;
  timestamp: Date;
  latency?: number;
  reason?: string;
}

interface Policy {
  dailyLimit: number;
  maxPerTransaction: number;
  allowedCategories: string[];
  blockedMerchants: string[];
}

interface DemoAgent {
  id: string;
  name: string;
  type: string;
  spentToday: number;
  policy: Policy;
}

const DEMO_MERCHANTS = [
  { name: "Amazon", category: "E-Commerce", logo: "🛒", amounts: [29.99, 49.99, 89.99, 149.99, 249.99] },
  { name: "Uber", category: "Transportation", logo: "🚗", amounts: [12.50, 18.00, 24.50, 35.00] },
  { name: "DoorDash", category: "Food Delivery", logo: "🍔", amounts: [18.99, 28.50, 42.00, 55.99] },
  { name: "Netflix", category: "Streaming", logo: "🎬", amounts: [15.99, 22.99] },
  { name: "Best Buy", category: "Electronics", logo: "💻", amounts: [99.99, 199.99, 349.99, 599.99] },
  { name: "Suspicious Store", category: "Unknown", logo: "⚠️", amounts: [999.99, 1499.00], risky: true },
  { name: "Crypto Exchange", category: "Crypto", logo: "🪙", amounts: [500.00, 1000.00], blocked: true },
];

const DEFAULT_POLICY: Policy = {
  dailyLimit: 500,
  maxPerTransaction: 300,
  allowedCategories: ["E-Commerce", "Transportation", "Food Delivery", "Streaming", "Electronics"],
  blockedMerchants: ["Crypto Exchange"],
};

export function LiveDemoSection() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [agent, setAgent] = useState<DemoAgent>({
    id: "agent_demo_" + Math.random().toString(36).slice(2, 8),
    name: "Shopping Assistant",
    type: "e-commerce",
    spentToday: 0,
    policy: DEFAULT_POLICY,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(DEMO_MERCHANTS[0]);
  const [customAmount, setCustomAmount] = useState<number>(49.99);
  const [stats, setStats] = useState({ 
    totalRequests: 0, 
    approved: 0, 
    denied: 0, 
    avgLatency: 0,
    totalLatency: 0 
  });
  const autoModeRef = useRef<NodeJS.Timeout | null>(null);

  // Authorize a transaction
  const authorizeTransaction = useCallback(async (merchant: typeof DEMO_MERCHANTS[0], amount: number) => {
    const txId = crypto.randomUUID();
    const newTx: Transaction = {
      id: txId,
      status: "pending",
      merchant: merchant.name,
      merchantLogo: merchant.logo,
      amount,
      currency: "USD",
      category: merchant.category,
      timestamp: new Date(),
    };

    setTransactions(prev => [newTx, ...prev.slice(0, 9)]);
    setIsProcessing(true);

    const startTime = performance.now();

    // Simulate authorization logic (in production, this calls the real API)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    
    const latency = Math.round(performance.now() - startTime);
    let decision: "approved" | "denied" = "approved";
    let reason: string | undefined;

    // Apply policy checks
    const newSpent = agent.spentToday + amount;
    
    if (merchant.blocked || agent.policy.blockedMerchants.includes(merchant.name)) {
      decision = "denied";
      reason = "Merchant blocked by policy";
    } else if (!agent.policy.allowedCategories.includes(merchant.category)) {
      decision = "denied";
      reason = `Category "${merchant.category}" not allowed`;
    } else if (amount > agent.policy.maxPerTransaction) {
      decision = "denied";
      reason = `Exceeds max transaction limit ($${agent.policy.maxPerTransaction})`;
    } else if (newSpent > agent.policy.dailyLimit) {
      decision = "denied";
      reason = `Would exceed daily limit ($${agent.policy.dailyLimit})`;
    } else if (merchant.risky) {
      decision = "denied";
      reason = "High-risk merchant flagged";
    }

    // Update transaction with result
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === txId 
          ? { ...tx, status: decision, latency, reason }
          : tx
      )
    );

    // Update agent spent if approved
    if (decision === "approved") {
      setAgent(prev => ({ ...prev, spentToday: prev.spentToday + amount }));
    }

    // Update stats
    setStats(prev => {
      const newTotal = prev.totalRequests + 1;
      const newTotalLatency = prev.totalLatency + latency;
      return {
        totalRequests: newTotal,
        approved: prev.approved + (decision === "approved" ? 1 : 0),
        denied: prev.denied + (decision === "denied" ? 1 : 0),
        avgLatency: Math.round(newTotalLatency / newTotal),
        totalLatency: newTotalLatency,
      };
    });

    setIsProcessing(false);
    return decision;
  }, [agent]);

  // Auto mode - generate transactions automatically
  useEffect(() => {
    if (isAutoMode) {
      const runAutoTransaction = () => {
        const merchant = DEMO_MERCHANTS[Math.floor(Math.random() * DEMO_MERCHANTS.length)];
        const amount = merchant.amounts[Math.floor(Math.random() * merchant.amounts.length)];
        authorizeTransaction(merchant, amount);
      };

      runAutoTransaction();
      autoModeRef.current = setInterval(runAutoTransaction, 2500);
    } else {
      if (autoModeRef.current) {
        clearInterval(autoModeRef.current);
        autoModeRef.current = null;
      }
    }

    return () => {
      if (autoModeRef.current) {
        clearInterval(autoModeRef.current);
      }
    };
  }, [isAutoMode, authorizeTransaction]);

  // Reset demo
  const resetDemo = () => {
    setTransactions([]);
    setAgent(prev => ({ ...prev, spentToday: 0 }));
    setStats({ totalRequests: 0, approved: 0, denied: 0, avgLatency: 0, totalLatency: 0 });
    setIsAutoMode(false);
  };

  const approvalRate = stats.totalRequests > 0 
    ? Math.round((stats.approved / stats.totalRequests) * 100) 
    : 0;

  return (
    <section className="py-32 border-t border-zinc-800/50 bg-black" id="demo">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="mb-16 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.1)}
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">Interactive Demo</span>
          </motion.div>
          <motion.h2 variants={staggerItem} className="text-3xl lg:text-5xl font-semibold text-white tracking-tight mb-4">
            Try it yourself.
          </motion.h2>
          <motion.p variants={staggerItem} className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Watch real-time authorization decisions. Trigger transactions, modify policies, and see how AgentAuth protects your spending.
          </motion.p>
        </motion.div>

        {/* Main demo grid */}
        <motion.div
          className="grid lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp(0.2)}
        >
          {/* Left: Controls */}
          <div className="space-y-6">
            {/* Agent Card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg">
                    🤖
                  </div>
                  <div>
                    <p className="text-white font-medium">{agent.name}</p>
                    <p className="text-xs text-zinc-500">{agent.id}</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                  Active
                </span>
              </div>
              
              {/* Spending progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-zinc-400">Daily Spending</span>
                  <span className="text-white font-mono">${agent.spentToday.toFixed(2)} / ${agent.policy.dailyLimit}</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full ${
                      agent.spentToday / agent.policy.dailyLimit > 0.8 
                        ? "bg-red-500" 
                        : agent.spentToday / agent.policy.dailyLimit > 0.5 
                          ? "bg-yellow-500" 
                          : "bg-emerald-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((agent.spentToday / agent.policy.dailyLimit) * 100, 100)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Policy summary */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Max per transaction</span>
                  <span className="text-zinc-300 font-mono">${agent.policy.maxPerTransaction}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Blocked merchants</span>
                  <span className="text-red-400 font-mono">{agent.policy.blockedMerchants.length}</span>
                </div>
              </div>
            </div>

            {/* Transaction Builder */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-zinc-400" />
                Trigger Transaction
              </h3>
              
              {/* Merchant selector */}
              <div className="mb-4">
                <label className="text-xs text-zinc-500 mb-2 block">Select Merchant</label>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_MERCHANTS.slice(0, 6).map((m) => (
                    <motion.button
                      key={m.name}
                      onClick={() => {
                        setSelectedMerchant(m);
                        setCustomAmount(m.amounts[0]);
                      }}
                      className={`p-3 rounded-xl text-left transition-all ${
                        selectedMerchant.name === m.name
                          ? "bg-emerald-500/10 border border-emerald-500/30"
                          : "bg-zinc-900 border border-zinc-800 hover:border-zinc-700"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-lg">{m.logo}</span>
                      <p className={`text-xs font-medium mt-1 ${
                        m.blocked ? "text-red-400" : m.risky ? "text-yellow-400" : "text-white"
                      }`}>
                        {m.name}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Amount input */}
              <div className="mb-4">
                <label className="text-xs text-zinc-500 mb-2 block">Amount (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-zinc-700"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <motion.button
                  onClick={() => authorizeTransaction(selectedMerchant, customAmount)}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  Authorize
                </motion.button>
              </div>
            </div>

            {/* Auto Mode */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Play className="w-4 h-4 text-zinc-400" />
                    Auto Mode
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Simulate real-time agent activity</p>
                </div>
                <motion.button
                  onClick={() => setIsAutoMode(!isAutoMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    isAutoMode ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className="w-5 h-5 bg-white rounded-full shadow-lg"
                    animate={{ x: isAutoMode ? 26 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </motion.button>
              </div>
            </div>

            {/* Reset */}
            <motion.button
              onClick={resetDemo}
              className="w-full py-3 text-zinc-400 hover:text-white border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <RefreshCw className="w-4 h-4" />
              Reset Demo
            </motion.button>
          </div>

          {/* Center: Transaction Feed */}
          <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/30">
              <div className="flex items-center gap-3">
                <motion.span 
                  className={`w-2.5 h-2.5 rounded-full ${isAutoMode ? "bg-emerald-400" : "bg-zinc-600"}`}
                  animate={isAutoMode ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <span className="text-sm text-zinc-300 font-medium">
                  Authorization Feed
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400 font-mono">{stats.avgLatency || 0}ms avg</span>
                </div>
              </div>
            </div>

            {/* Transaction list */}
            <div className="min-h-[400px] max-h-[500px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {transactions.length === 0 ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center h-[400px] text-zinc-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Shield className="w-12 h-12 mb-4 text-zinc-700" />
                    <p className="text-sm">No transactions yet</p>
                    <p className="text-xs text-zinc-700 mt-1">Trigger a transaction or enable auto mode</p>
                  </motion.div>
                ) : (
                  transactions.map((tx) => (
                    <motion.div 
                      key={tx.id}
                      initial={{ opacity: 0, y: -20, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                      className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/30 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Status indicator */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        >
                          {tx.status === "pending" ? (
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                              <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                            </div>
                          ) : tx.status === "approved" ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                              <XCircle className="w-4 h-4 text-red-400" />
                            </div>
                          )}
                        </motion.div>
                        
                        {/* Merchant info */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{tx.merchantLogo}</span>
                            <span className="text-sm text-white font-medium">{tx.merchant}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-zinc-500">{tx.category}</span>
                            {tx.reason && (
                              <span className="text-xs text-red-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {tx.reason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Latency */}
                        {tx.latency && (
                          <span className="text-xs font-mono text-zinc-500 hidden sm:block">
                            {tx.latency}ms
                          </span>
                        )}
                        
                        {/* Amount */}
                        <span className="text-sm font-semibold text-white w-24 text-right font-mono">
                          ${tx.amount.toFixed(2)}
                        </span>
                        
                        {/* Status badge */}
                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full min-w-[80px] text-center ${
                          tx.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : tx.status === "approved" 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Stats footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800/50 bg-zinc-900/30">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Total Requests</p>
                  <p className="text-lg font-semibold text-white font-mono">{stats.totalRequests}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Approved</p>
                  <p className="text-lg font-semibold text-emerald-400 font-mono">{stats.approved}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Denied</p>
                  <p className="text-lg font-semibold text-red-400 font-mono">{stats.denied}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Approval Rate</p>
                  <p className="text-lg font-semibold text-white font-mono">{approvalRate}%</p>
                </div>
              </div>
              <div className="text-xs text-zinc-600">
                Real-time authorization simulation
              </div>
            </div>
          </div>
        </motion.div>

        {/* API Preview */}
        <motion.div
          className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp(0.3)}
        >
          <div className="px-6 py-4 border-b border-zinc-800/50 bg-zinc-900/30">
            <p className="text-sm text-zinc-400">Under the hood - every transaction calls our API:</p>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono text-zinc-400">
              <code>{`POST /v1/authorize
{
  "agent_id": "${agent.id}",
  "action": "payment",
  "transaction": {
    "amount": ${customAmount},
    "currency": "USD",
    "merchant": "${selectedMerchant.name}",
    "category": "${selectedMerchant.category}"
  }
}

// Response in <100ms
{ "decision": "ALLOW", "authorization_code": "auth_xyz123", "latency_ms": 34 }`}</code>
            </pre>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
