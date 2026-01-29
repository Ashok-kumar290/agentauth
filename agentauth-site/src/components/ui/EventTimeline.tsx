"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

/**
 * EventTimeline
 * 
 * Design decisions:
 * - Modeled after Stripe's event logs and Vercel's deployment timeline
 * - Monospace timestamps for scanability
 * - Status indicators use semantic colors (green/red/yellow)
 * - Expandable details on click (future enhancement)
 * - Dense layout - engineers expect information density
 * - No decorative elements - pure function
 */

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: "authorization" | "policy_check" | "webhook" | "approval" | "system";
  status: "success" | "denied" | "pending" | "error";
  title: string;
  description: string;
  metadata?: Record<string, string | number>;
  latencyMs?: number;
}

interface EventTimelineProps {
  events: TimelineEvent[];
  maxHeight?: string;
  showLatency?: boolean;
  className?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Success",
  },
  denied: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    label: "Denied",
  },
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    label: "Pending",
  },
  error: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    label: "Error",
  },
};

const typeLabels = {
  authorization: "AUTH",
  policy_check: "POLICY",
  webhook: "WEBHOOK",
  approval: "APPROVAL",
  system: "SYSTEM",
};

// Use relative time to avoid hydration mismatch
function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  
  if (diff < 1000) return "just now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function formatTimestamp(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 23);
}

export function EventTimeline({
  events,
  maxHeight = "400px",
  showLatency = true,
  className,
}: EventTimelineProps) {
  return (
    <div
      className={cn(
        "bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f] bg-[#0d0d0d]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Event Log
          </span>
        </div>
        <span className="text-xs text-zinc-600 font-mono">
          {events.length} events
        </span>
      </div>

      {/* Events list */}
      <div
        className="overflow-y-auto"
        style={{ maxHeight }}
      >
        {events.length === 0 ? (
          <div className="px-4 py-8 text-center text-zinc-600 text-sm">
            No events yet
          </div>
        ) : (
          <div className="divide-y divide-[#1f1f1f]">
            {events.map((event) => {
              const config = statusConfig[event.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={event.id}
                  className="group px-4 py-3 hover:bg-[#111] transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <div className={cn("mt-0.5 p-1 rounded", config.bg)}>
                      <StatusIcon className={cn("w-3.5 h-3.5", config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Type badge */}
                        <span className="text-[10px] font-mono font-medium text-zinc-500 bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                          {typeLabels[event.type]}
                        </span>
                        
                        {/* Title */}
                        <span className="text-sm text-zinc-200 truncate">
                          {event.title}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-zinc-500 truncate">
                        {event.description}
                      </p>

                      {/* Metadata */}
                      {event.metadata && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-[10px] font-mono text-zinc-600"
                            >
                              {key}=<span className="text-zinc-400">{value}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right side: timestamp + latency */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] font-mono text-zinc-600" suppressHydrationWarning>
                        {formatRelativeTime(event.timestamp)}
                      </span>
                      {showLatency && event.latencyMs !== undefined && (
                        <span className={cn(
                          "text-[10px] font-mono",
                          event.latencyMs < 50 ? "text-emerald-600" :
                          event.latencyMs < 100 ? "text-amber-600" :
                          "text-red-600"
                        )}>
                          {event.latencyMs}ms
                        </span>
                      )}
                    </div>

                    {/* Expand indicator */}
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors mt-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Compact version for inline use
export function EventTimelineCompact({
  events,
  className,
}: {
  events: TimelineEvent[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      {events.slice(0, 5).map((event) => {
        const config = statusConfig[event.status];
        const StatusIcon = config.icon;

        return (
          <div
            key={event.id}
            className="flex items-center gap-2 text-xs font-mono"
          >
            <StatusIcon className={cn("w-3 h-3", config.color)} />
            <span className="text-zinc-600" suppressHydrationWarning>
              {formatRelativeTime(event.timestamp)}
            </span>
            <span className="text-zinc-400 truncate flex-1">
              {event.title}
            </span>
            {event.latencyMs && (
              <span className="text-zinc-600">{event.latencyMs}ms</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
