"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Copy, Check, FileCode, ChevronDown } from "lucide-react";

/**
 * PolicyEditor
 * 
 * Design decisions:
 * - Shows policy as YAML or JSON (engineers' preferred formats)
 * - Read-only display with syntax-like highlighting
 * - Copy button for quick extraction
 * - Line numbers for reference in discussions
 * - Collapsible sections for large policies
 * - Modeled after GitHub code view and Stripe API docs
 */

interface PolicyEditorProps {
  policy: object;
  format?: "yaml" | "json";
  title?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
}

// Simple YAML-like stringifier for display
function toYaml(obj: object, indent = 0): string {
  const spaces = "  ".repeat(indent);
  let result = "";

  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      result += `${spaces}${key}:\n`;
      for (const item of value) {
        if (typeof item === "object" && item !== null) {
          result += `${spaces}  -\n`;
          result += toYaml(item, indent + 2)
            .split("\n")
            .map((line) => (line ? `${spaces}    ${line.trim()}` : ""))
            .join("\n") + "\n";
        } else {
          result += `${spaces}  - ${item}\n`;
        }
      }
    } else if (typeof value === "object" && value !== null) {
      result += `${spaces}${key}:\n`;
      result += toYaml(value, indent + 1);
    } else if (typeof value === "string") {
      result += `${spaces}${key}: "${value}"\n`;
    } else if (typeof value === "boolean") {
      result += `${spaces}${key}: ${value}\n`;
    } else {
      result += `${spaces}${key}: ${value}\n`;
    }
  }

  return result;
}

function highlightLine(line: string, format: "yaml" | "json"): JSX.Element {
  if (format === "yaml") {
    // Highlight YAML syntax
    const keyMatch = line.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)(:)/);
    if (keyMatch) {
      const [, spaces, key, colon] = keyMatch;
      const rest = line.slice(keyMatch[0].length);
      return (
        <>
          <span className="text-zinc-600">{spaces}</span>
          <span className="text-blue-400">{key}</span>
          <span className="text-zinc-500">{colon}</span>
          <span className={
            rest.includes('"') ? "text-amber-400" :
            rest.includes("true") || rest.includes("false") ? "text-purple-400" :
            /\d/.test(rest) ? "text-emerald-400" :
            "text-zinc-300"
          }>{rest}</span>
        </>
      );
    }
    if (line.trim().startsWith("-")) {
      return <span className="text-zinc-400">{line}</span>;
    }
  }

  if (format === "json") {
    // Highlight JSON syntax
    const keyMatch = line.match(/^(\s*)"([^"]+)"(:)/);
    if (keyMatch) {
      const [, spaces, key, colon] = keyMatch;
      const rest = line.slice(keyMatch[0].length);
      return (
        <>
          <span className="text-zinc-600">{spaces}</span>
          <span className="text-zinc-500">&quot;</span>
          <span className="text-blue-400">{key}</span>
          <span className="text-zinc-500">&quot;{colon}</span>
          <span className={
            rest.includes('"') ? "text-amber-400" :
            rest.includes("true") || rest.includes("false") ? "text-purple-400" :
            /\d/.test(rest) ? "text-emerald-400" :
            "text-zinc-300"
          }>{rest}</span>
        </>
      );
    }
  }

  return <span className="text-zinc-300">{line}</span>;
}

export function PolicyEditor({
  policy,
  format = "yaml",
  title = "Policy Configuration",
  showLineNumbers = true,
  maxHeight = "400px",
  className,
}: PolicyEditorProps) {
  const [copied, setCopied] = useState(false);

  const content = format === "yaml" 
    ? toYaml(policy) 
    : JSON.stringify(policy, null, 2);
  
  const lines = content.split("\n").filter(Boolean);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <FileCode className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-400">
            {title}
          </span>
          <span className="text-[10px] font-mono text-zinc-600 bg-[#1a1a1a] px-1.5 py-0.5 rounded uppercase">
            {format}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div
        className="overflow-auto font-mono text-xs leading-relaxed"
        style={{ maxHeight }}
      >
        <pre className="p-4">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && (
                <span className="w-8 text-right pr-4 text-zinc-700 select-none flex-shrink-0">
                  {i + 1}
                </span>
              )}
              <code>{highlightLine(line, format)}</code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}

// Inline policy snippet for compact display
export function PolicySnippet({
  policy,
  className,
}: {
  policy: object;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const yaml = toYaml(policy);
  const lines = yaml.split("\n").filter(Boolean);
  const displayLines = isExpanded ? lines : lines.slice(0, 4);

  return (
    <div className={cn("font-mono text-xs", className)}>
      {displayLines.map((line, i) => (
        <div key={i} className="text-zinc-400">
          {highlightLine(line, "yaml")}
        </div>
      ))}
      {lines.length > 4 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 mt-1 text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <ChevronDown className={cn(
            "w-3 h-3 transition-transform",
            isExpanded && "rotate-180"
          )} />
          {isExpanded ? "Show less" : `+${lines.length - 4} more lines`}
        </button>
      )}
    </div>
  );
}
