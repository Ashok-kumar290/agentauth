"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem, viewportOnce, fadeUp } from "@/lib/animations";

/**
 * How It Works Section - Clean step-based layout with connecting elements
 */

const steps = [
  {
    number: "01",
    title: "Define policies",
    description: "Set spending limits, allowed merchants, approval thresholds, and custom rules for each agent.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Agent requests action",
    description: "Before executing a payment, your agent calls AgentAuth with transaction details.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Real-time decision",
    description: "We evaluate policies and return approve/deny in under 100ms. You execute or block.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-32 border-t border-zinc-800/50 bg-black" id="how-it-works">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.1)}
        >
          <motion.p
            variants={staggerItem}
            className="text-sm text-emerald-400 font-medium uppercase tracking-widest mb-4"
          >
            How It Works
          </motion.p>
          <motion.h2
            variants={staggerItem}
            className="text-3xl lg:text-4xl font-semibold text-white tracking-tight max-w-2xl"
          >
            Three steps to authorized agent payments.
          </motion.h2>
        </motion.div>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="absolute top-16 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent hidden md:block" />

          <motion.div 
            className="grid md:grid-cols-3 gap-12 lg:gap-16"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.2, 0.1)}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                variants={staggerItem}
                className="relative group"
              >
                {/* Step indicator */}
                <div className="relative mb-8">
                  <motion.div 
                    className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/5 transition-all duration-500"
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    {step.icon}
                  </motion.div>
                  
                  {/* Step number badge */}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 text-black text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-4 tracking-tight">
                  {step.title}
                </h3>
                
                {/* Description */}
                <p className="text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom stats */}
        <motion.div 
          className="mt-20 pt-12 border-t border-zinc-800/50"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp(0.2)}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "<100ms", label: "Authorization time" },
              { value: "99.99%", label: "Uptime SLA" },
              { value: "0", label: "Fund custody" },
              { value: "SOC 2", label: "Compliant" },
            ].map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="text-2xl lg:text-3xl font-semibold text-white mb-2">{stat.value}</p>
                <p className="text-sm text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
