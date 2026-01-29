"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Check } from "lucide-react";
import { useState } from "react";
import { staggerContainer, staggerItem, fadeLeft } from "@/lib/animations";

/**
 * HeroSection - Apple-level design with video background
 * 
 * Design philosophy:
 * - Immersive video background
 * - Crisp typography with text shadows
 * - Smooth, purposeful animations
 * - Clean CTA hierarchy
 */

export function HeroSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 -z-20">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.4)" }}
        >
          <source src="/240967.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
      </div>

      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 -z-10 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-8 py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left: Copy */}
          <motion.div 
            className="max-w-xl"
            initial="hidden"
            animate="visible"
            variants={staggerContainer(0.15, 0.2)}
          >
            {/* Eyebrow */}
            <motion.div
              variants={staggerItem}
              className="mb-8"
            >
              <span className="inline-flex items-center gap-2 text-sm text-zinc-300 font-medium backdrop-blur-sm bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Now in private beta
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={staggerItem}
              className="text-[3rem] sm:text-[3.5rem] lg:text-[4.5rem] font-semibold leading-[1.05] tracking-[-0.02em] text-white mb-8"
              style={{ textShadow: "0 2px 40px rgba(0,0,0,0.5)" }}
            >
              Let AI Agents
              <br />
              <span className="text-zinc-400">Buy For You.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={staggerItem}
              className="text-lg lg:text-xl text-zinc-300 leading-relaxed mb-10"
            >
              The authorization layer for AI agent payments. Set spending limits, 
              control merchants, approve transactions — in under 100ms.
            </motion.p>

            {/* Email Form */}
            <motion.form
              variants={staggerItem}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 mb-6"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 px-5 py-3.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all duration-300"
                required
                disabled={status === "loading"}
              />
              <motion.button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-black font-medium rounded-xl hover:bg-zinc-100 transition-all duration-200 disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={status === "loading"}
              >
                {status === "success" ? (
                  <>
                    <Check className="w-4 h-4" />
                    You&apos;re in
                  </>
                ) : status === "loading" ? (
                  "Joining..."
                ) : (
                  <>
                    Join Waitlist
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.form>

            {/* Secondary CTA */}
            <motion.div variants={staggerItem}>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors duration-200 group"
              >
                <div className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-zinc-500 group-hover:bg-white/5 transition-all duration-200">
                  <Play className="w-4 h-4 ml-0.5" />
                </div>
                <span className="font-medium">See live demo</span>
              </a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={staggerItem}
              className="mt-16 pt-8 border-t border-white/10"
            >
              <div className="flex items-center gap-8">
                <span className="text-zinc-500 text-sm font-medium">YC W26</span>
                <span className="text-zinc-500 text-sm font-medium">SOC 2</span>
                <span className="text-zinc-500 text-sm font-medium">GDPR Ready</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Dashboard mock */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeLeft(0.5, 60)}
            className="relative hidden lg:block"
          >
            {/* Browser chrome */}
            <motion.div 
              className="relative rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl overflow-hidden shadow-2xl"
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
            >
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-zinc-900/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-[200px] mx-auto px-3 py-1 rounded-md bg-zinc-800/50 text-xs text-zinc-500 text-center font-mono">
                    dashboard.agentauth.in
                  </div>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Agent Activity</p>
                    <p className="text-lg font-semibold text-white">Today&apos;s Transactions</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Live</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Authorized", value: "1,284", change: "+12%", positive: true },
                    { label: "Blocked", value: "23", change: "1.8%", positive: false },
                    { label: "Avg Latency", value: "34ms", change: "-8ms", positive: true },
                  ].map((stat, i) => (
                    <motion.div 
                      key={stat.label} 
                      className="p-4 rounded-xl bg-white/5 border border-white/5"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                    >
                      <p className="text-xs text-zinc-500 mb-1">{stat.label}</p>
                      <p className="text-xl font-semibold text-white">{stat.value}</p>
                      <p className={`text-xs mt-1 ${stat.positive ? "text-emerald-400" : "text-zinc-500"}`}>
                        {stat.change}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Transaction feed */}
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 mb-3">Recent Activity</p>
                  {[
                    { status: "success", merchant: "amazon.com", amount: "$149.99", time: "2s ago" },
                    { status: "success", merchant: "bestbuy.com", amount: "$89.00", time: "1m ago" },
                    { status: "blocked", merchant: "suspicious-store.biz", amount: "$999.99", time: "3m ago" },
                    { status: "success", merchant: "uber.com", amount: "$24.50", time: "5m ago" },
                  ].map((tx, i) => (
                    <motion.div 
                      key={i}
                      className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors duration-200"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.1 + i * 0.1, duration: 0.4 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${
                          tx.status === "success" ? "bg-emerald-400" : "bg-red-400"
                        }`} />
                        <span className="text-sm text-zinc-300">{tx.merchant}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-white">{tx.amount}</span>
                        <span className="text-xs text-zinc-600">{tx.time}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Glow effect */}
            <div className="absolute -inset-8 -z-10 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent rounded-3xl blur-2xl opacity-50" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
