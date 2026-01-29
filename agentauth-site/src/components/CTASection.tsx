"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { staggerContainer, staggerItem, viewportOnce, fadeUp } from "@/lib/animations";

/**
 * CTA Section + Footer - Clean enterprise design
 */

export function CTASection() {
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
    <section className="py-32 border-t border-zinc-800/50 bg-black relative overflow-hidden" id="waitlist">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.1),transparent)]" />
      
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 relative">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.15)}
        >
          <motion.h2 
            className="text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-6"
            variants={staggerItem}
          >
            Ready to start?
          </motion.h2>

          <motion.p 
            className="text-lg text-zinc-400 mb-12"
            variants={staggerItem}
          >
            Join the waitlist for early access. We&apos;re onboarding teams weekly.
          </motion.p>

          {/* Waitlist form */}
          <motion.div variants={staggerItem}>
            {status === "success" ? (
              <motion.div 
                className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Check className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">You&apos;re on the list. We&apos;ll be in touch.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 px-5 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 focus:bg-zinc-800/50 transition-all duration-200"
                  required
                  disabled={status === "loading"}
                />
                <motion.button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-medium rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      Join Waitlist
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Trust note */}
          <motion.p 
            className="text-xs text-zinc-600 mt-6"
            variants={staggerItem}
          >
            No spam. We only email about product updates.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 border-t border-zinc-800/50 bg-black">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        {/* Footer Grid */}
        <motion.div 
          className="grid md:grid-cols-4 gap-12 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer(0.1)}
        >
          {/* Brand */}
          <motion.div className="md:col-span-1" variants={staggerItem}>
            <a href="/" className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                <span className="text-black font-bold text-sm">A</span>
              </div>
              <span className="text-white font-semibold text-lg">AgentAuth</span>
            </a>
            <p className="text-zinc-500 text-sm leading-relaxed">
              The authorization layer for AI agent payments.
            </p>
          </motion.div>

          {/* Product */}
          <motion.div variants={staggerItem}>
            <h4 className="text-white text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="/docs" className="text-zinc-500 hover:text-white text-sm transition-colors duration-200">Documentation</a></li>
              <li><a href="#demo" className="text-zinc-500 hover:text-white text-sm transition-colors duration-200">Live Demo</a></li>
              <li><a href="#pricing" className="text-zinc-500 hover:text-white text-sm transition-colors duration-200">Pricing</a></li>
              <li><a href="/changelog" className="text-zinc-500 hover:text-white text-sm transition-colors duration-200">Changelog</a></li>
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={staggerItem}>
            <h4 className="text-white text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="/about" className="text-zinc-500 hover:text-white text-sm transition-colors duration-200">About</a></li>
              <li><a href="/contact" className="text-zinc-500 hover:text-white text-sm transition-colors duration-200">Contact</a></li>
              <li><a href="mailto:hello@agentauth.in" className="text-zinc-500 hover:text-white text-sm transition-colors duration-200">hello@agentauth.in</a></li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div variants={staggerItem}>
            <h4 className="text-white text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="/privacy" className="text-zinc-500 hover:text-white text-sm transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="/terms" className="text-zinc-500 hover:text-white text-sm transition-colors duration-200">Terms of Service</a></li>
              <li><a href="/security" className="text-zinc-500 hover:text-white text-sm transition-colors duration-200">Security</a></li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={viewportOnce}
          transition={{ delay: 0.3 }}
        >
          <p className="text-zinc-600 text-sm">
            © {currentYear} AgentAuth. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://twitter.com/agentauth" className="text-zinc-600 hover:text-white transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://github.com/agentauth" className="text-zinc-600 hover:text-white transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
            <a href="https://linkedin.com/company/agentauth" className="text-zinc-600 hover:text-white transition-colors duration-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
