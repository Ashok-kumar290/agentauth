"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/animations";
import { Shield, Gauge, FileText, Lock } from "lucide-react";

/**
 * Why AgentAuth Section - Feature cards with icons
 */

const features = [
  {
    icon: Gauge,
    title: "Real-time authorization",
    description: "Every agent action is evaluated against your policies before execution. Sub-100ms decisions.",
    highlight: "<100ms",
  },
  {
    icon: Shield,
    title: "Granular policies",
    description: "Set limits by agent, merchant, time, amount, or custom rules. Full programmatic control.",
    highlight: "Custom rules",
  },
  {
    icon: FileText,
    title: "Complete audit trail",
    description: "Every decision logged with full context. Exportable for compliance and debugging.",
    highlight: "Full logs",
  },
  {
    icon: Lock,
    title: "No fund custody",
    description: "We authorize, you execute. Your money stays with your payment processor.",
    highlight: "Zero custody",
  },
];

export function WhyAgentAuthSection() {
  return (
    <section className="py-32 border-t border-zinc-800/50 bg-black">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="mb-20 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.1)}
        >
          <motion.p
            variants={staggerItem}
            className="text-sm text-emerald-400 font-medium uppercase tracking-widest mb-4"
          >
            Why AgentAuth
          </motion.p>
          <motion.h2
            variants={staggerItem}
            className="text-3xl lg:text-4xl font-semibold text-white tracking-tight max-w-2xl mx-auto"
          >
            Authorization designed for autonomous agents.
          </motion.h2>
        </motion.div>

        {/* Features grid */}
        <motion.div 
          className="grid md:grid-cols-2 gap-6 lg:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.1, 0.2)}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              className="group relative p-8 rounded-2xl border border-zinc-800/50 bg-zinc-950/50 hover:border-zinc-700/50 hover:bg-zinc-900/30 transition-all duration-500"
              whileHover={{ y: -4 }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 group-hover:bg-emerald-500/20 transition-colors duration-300">
                <feature.icon className="w-6 h-6" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-zinc-400 leading-relaxed mb-4">
                {feature.description}
              </p>

              {/* Highlight badge */}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                {feature.highlight}
              </span>

              {/* Subtle corner glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
