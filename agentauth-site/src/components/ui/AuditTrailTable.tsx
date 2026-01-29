"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  Filter,
  Download,
  ExternalLink,
} from "lucide-react";

/**
 * AuditTrailTable
 * 
 * Design decisions:
 * - Modeled after AWS CloudTrail and Stripe's event tables
 * - Sortable columns for quick analysis
 * - Filterable by status
 * - Fixed headers for long lists
 * - Export functionality (CSV)
 * - Monospace for IDs and timestamps
 * - Latency color-coded by performance threshold
 * - Click to expand for full details
 */

export interface AuditRecord {
  id: string;
  timestamp: Date;
  agentId: string;
  agentName: string;
  action: string;
  merchant: string;
  amount: number;
  currency: string;
  decision: "approved" | "denied" | "pending";
  latencyMs: number;
  policyId?: string;
  reason?: string;
  ipAddress?: string;
}

interface AuditTrailTableProps {
  records: AuditRecord[];
  maxHeight?: string;
  showFilters?: boolean;
  className?: string;
}

const decisionConfig = {
  approved: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    label: "Approved",
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
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

function formatTimestamp(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 19);
}

type SortKey = "timestamp" | "amount" | "latencyMs" | "decision";
type SortDirection = "asc" | "desc";

export function AuditTrailTable({
  records,
  maxHeight = "500px",
  showFilters = true,
  className,
}: AuditTrailTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Sort and filter records
  const processedRecords = [...records]
    .filter((r) => filterStatus === "all" || r.decision === filterStatus)
    .sort((a, b) => {
      let comparison = 0;
      switch (sortKey) {
        case "timestamp":
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "latencyMs":
          comparison = a.latencyMs - b.latencyMs;
          break;
        case "decision":
          comparison = a.decision.localeCompare(b.decision);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const handleExport = () => {
    const headers = ["ID", "Timestamp", "Agent", "Merchant", "Amount", "Decision", "Latency (ms)"];
    const rows = processedRecords.map((r) => [
      r.id,
      formatTimestamp(r.timestamp),
      r.agentName,
      r.merchant,
      `${r.amount} ${r.currency}`,
      r.decision,
      r.latencyMs,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Stats
  const stats = {
    total: records.length,
    approved: records.filter((r) => r.decision === "approved").length,
    denied: records.filter((r) => r.decision === "denied").length,
    avgLatency: Math.round(
      records.reduce((sum, r) => sum + r.latencyMs, 0) / records.length
    ),
  };

  return (
    <div
      className={cn(
        "bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg overflow-hidden",
        className
      )}
    >
      {/* Header with stats and filters */}
      <div className="px-4 py-3 border-b border-[#1f1f1f] bg-[#0d0d0d]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-zinc-300">Audit Trail</h3>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-600">Total:</span>
            <span className="font-mono text-zinc-300">{stats.total}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-600">Approved:</span>
            <span className="font-mono text-emerald-500">{stats.approved}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-600">Denied:</span>
            <span className="font-mono text-red-500">{stats.denied}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-600">Avg latency:</span>
            <span className="font-mono text-zinc-300">{stats.avgLatency}ms</span>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center gap-2 mt-3">
            <Filter className="w-3.5 h-3.5 text-zinc-600" />
            <div className="flex gap-1">
              {["all", "approved", "denied", "pending"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "px-2 py-1 text-[10px] font-medium rounded transition-colors uppercase tracking-wider",
                    filterStatus === status
                      ? "bg-zinc-800 text-zinc-200"
                      : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-[#0d0d0d] border-b border-[#1f1f1f]">
            <tr>
              <th className="text-left px-4 py-2 text-zinc-600 font-medium">
                <button
                  onClick={() => handleSort("timestamp")}
                  className="flex items-center gap-1 hover:text-zinc-400 transition-colors"
                >
                  Timestamp
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-left px-4 py-2 text-zinc-600 font-medium">Agent</th>
              <th className="text-left px-4 py-2 text-zinc-600 font-medium">Merchant</th>
              <th className="text-right px-4 py-2 text-zinc-600 font-medium">
                <button
                  onClick={() => handleSort("amount")}
                  className="flex items-center gap-1 hover:text-zinc-400 transition-colors ml-auto"
                >
                  Amount
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-center px-4 py-2 text-zinc-600 font-medium">
                <button
                  onClick={() => handleSort("decision")}
                  className="flex items-center gap-1 hover:text-zinc-400 transition-colors mx-auto"
                >
                  Decision
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right px-4 py-2 text-zinc-600 font-medium">
                <button
                  onClick={() => handleSort("latencyMs")}
                  className="flex items-center gap-1 hover:text-zinc-400 transition-colors ml-auto"
                >
                  Latency
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f1f1f]">
            {processedRecords.map((record) => {
              const config = decisionConfig[record.decision];
              const DecisionIcon = config.icon;
              const isExpanded = expandedRow === record.id;

              return (
                <>
                  <tr
                    key={record.id}
                    onClick={() => setExpandedRow(isExpanded ? null : record.id)}
                    className="hover:bg-[#111] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-zinc-400">
                      {formatTimestamp(record.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-zinc-300">{record.agentName}</span>
                        <span className="block text-[10px] text-zinc-600 font-mono">
                          {record.agentId}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{record.merchant}</td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-300">
                      {formatCurrency(record.amount, record.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <div className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium mx-auto",
                        config.bg,
                        config.color
                      )}>
                        <DecisionIcon className="w-3 h-3" />
                        {config.label}
                      </div>
                    </td>
                    <td className={cn(
                      "px-4 py-3 text-right font-mono",
                      record.latencyMs < 50 ? "text-emerald-500" :
                      record.latencyMs < 100 ? "text-amber-500" :
                      "text-red-500"
                    )}>
                      {record.latencyMs}ms
                    </td>
                    <td className="px-4 py-3">
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-700 hover:text-zinc-400 transition-colors" />
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${record.id}-expanded`} className="bg-[#0d0d0d]">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-zinc-600 block mb-1">Authorization ID</span>
                            <span className="font-mono text-zinc-300">{record.id}</span>
                          </div>
                          <div>
                            <span className="text-zinc-600 block mb-1">Policy ID</span>
                            <span className="font-mono text-zinc-300">{record.policyId || "—"}</span>
                          </div>
                          <div>
                            <span className="text-zinc-600 block mb-1">IP Address</span>
                            <span className="font-mono text-zinc-300">{record.ipAddress || "—"}</span>
                          </div>
                          {record.reason && (
                            <div className="col-span-3">
                              <span className="text-zinc-600 block mb-1">Reason</span>
                              <span className="text-zinc-300">{record.reason}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>

        {processedRecords.length === 0 && (
          <div className="px-4 py-8 text-center text-zinc-600 text-sm">
            No records match the current filter
          </div>
        )}
      </div>
    </div>
  );
}
