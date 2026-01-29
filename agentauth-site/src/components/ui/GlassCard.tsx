"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

/**
 * GlassCard - Modern glassmorphism card with border glow
 */
export function GlassCard({
  children,
  className = "",
  glowColor = "emerald",
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  glowColor?: "emerald" | "blue" | "purple" | "white";
  hover?: boolean;
}) {
  const glowColors = {
    emerald: "hover:shadow-emerald-500/10",
    blue: "hover:shadow-blue-500/10",
    purple: "hover:shadow-purple-500/10",
    white: "hover:shadow-white/5",
  };

  const borderColors = {
    emerald: "hover:border-emerald-500/30",
    blue: "hover:border-blue-500/30",
    purple: "hover:border-purple-500/30",
    white: "hover:border-white/20",
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        bg-gradient-to-b from-white/[0.08] to-white/[0.02]
        backdrop-blur-xl border border-white/[0.08]
        ${hover ? `transition-all duration-300 hover:shadow-2xl ${glowColors[glowColor]} ${borderColors[glowColor]}` : ""}
        ${className}
      `}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {/* Gradient shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/**
 * TerminalWindow - macOS-style terminal window
 */
export function TerminalWindow({
  children,
  title = "terminal",
  className = "",
}: {
  children: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/[0.08] ${className}`}>
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0d0d0d] border-b border-white/[0.05]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-zinc-500 font-mono ml-2">{title}</span>
      </div>
      
      {/* Content */}
      <div className="p-4">{children}</div>
    </div>
  );
}

/**
 * BrowserWindow - Browser mockup window
 */
export function BrowserWindow({
  children,
  url = "dashboard.agentauth.in",
  className = "",
}: {
  children: ReactNode;
  url?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl overflow-hidden bg-[#0a0a0a] border border-white/[0.08] shadow-2xl ${className}`}>
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#111] border-b border-white/[0.05]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        
        {/* URL bar */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-[#1a1a1a] rounded-lg border border-white/[0.05]">
            <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-zinc-400 font-mono">{url}</span>
          </div>
        </div>
        
        <div className="w-16" /> {/* Spacer for symmetry */}
      </div>
      
      {/* Content */}
      <div>{children}</div>
    </div>
  );
}

/**
 * StatusBadge - Live status indicator
 */
export function StatusBadge({
  status = "live",
  text,
  pulse = true,
}: {
  status?: "live" | "processing" | "error";
  text?: string;
  pulse?: boolean;
}) {
  const colors = {
    live: "bg-emerald-500",
    processing: "bg-amber-500",
    error: "bg-red-500",
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-75 animate-ping`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${colors[status]}`} />
      </span>
      <span className="text-xs font-mono text-zinc-400">
        {text || (status === "live" ? "Live" : status === "processing" ? "Processing" : "Error")}
      </span>
    </div>
  );
}

/**
 * GradientText - Animated gradient text
 */
export function GradientText({
  children,
  className = "",
  animate = false,
}: {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}) {
  return (
    <span
      className={`
        bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent
        ${animate ? "animate-gradient bg-[length:200%_auto]" : ""}
        ${className}
      `}
    >
      {children}
      {animate && (
        <style jsx>{`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            animation: gradient 8s ease infinite;
          }
        `}</style>
      )}
    </span>
  );
}

/**
 * MetricCard - Dashboard-style metric display
 */
export function MetricCard({
  label,
  value,
  trend,
  trendDirection = "up",
}: {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: "up" | "down";
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-white font-mono">{value}</span>
        {trend && (
          <span className={`text-xs font-mono ${trendDirection === "up" ? "text-emerald-400" : "text-red-400"}`}>
            {trendDirection === "up" ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
