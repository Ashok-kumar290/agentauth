"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/animations";

/**
 * Problem Section - Clean, Apple-style three-column grid
 */

const problems = [
  {
    number: "01",
    title: "Agents are transacting",
    description: "AI agents are booking flights, ordering groceries, managing subscriptions. They need to spend money to complete tasks.",
  },
  {
    number: "02",
    title: "Humans lose visibility",
    description: "When an agent makes a purchase, you often don't know until it's done. No approval flow. No spending limits. No audit trail.",
  },
  {
    number: "03",
    title: "Existing tools don't fit",
    description: "Payment systems were designed for humans clicking buttons. They can't handle autonomous, high-frequency agent transactions.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-32 border-t border-zinc-800/50 bg-black">
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
            className="text-sm text-zinc-500 font-medium uppercase tracking-widest mb-4"
          >
            The Problem
          </motion.p>
          <motion.h2
            variants={staggerItem}
            className="text-3xl lg:text-4xl font-semibold text-white tracking-tight max-w-2xl leading-tight"
          >
            AI agents need to spend money.
            <br />
            <span className="text-zinc-500">You need control over how they do it.</span>
          </motion.h2>
        </motion.div>

        {/* Three-column grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-12 lg:gap-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.15, 0.2)}
        >
          {problems.map((problem) => (
            <motion.div
              key={problem.number}
              variants={staggerItem}
              className="group relative"
            >
              {/* Hover glow effect */}
              <div className="absolute -inset-4 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative">
                {/* Large faded number */}
                <motion.p 
                  className="text-[5rem] font-bold text-zinc-900 leading-none mb-4 select-none"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  {problem.number}
                </motion.p>
                
                {/* Title */}
                <h3 className="text-xl font-semibold text-white mb-4 tracking-tight">
                  {problem.title}
                </h3>
                
                {/* Description */}
                <p className="text-zinc-400 leading-relaxed">
                  {problem.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
