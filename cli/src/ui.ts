import chalk from 'chalk';
import Table from 'cli-table3';
import boxen from 'boxen';
import ora, { Ora } from 'ora';

// ─── Brand Colors ───────────────────────────────────────────────────────────

const purple = chalk.hex('#7C3AED');
const purpleBg = chalk.bgHex('#7C3AED').white.bold;

// ─── Header & Branding ─────────────────────────────────────────────────────

/**
 * Display a branded header with boxen
 */
export function header(text: string): string {
  return boxen(purple.bold(text), {
    padding: 1,
    margin: { top: 1, bottom: 1, left: 0, right: 0 },
    borderStyle: 'round',
    borderColor: '#7C3AED',
  });
}

/**
 * Display a branded sub-header
 */
export function subheader(text: string): string {
  return purple.bold(`\n  ${text}\n  ${'─'.repeat(text.length)}`);
}

// ─── Status Messages ────────────────────────────────────────────────────────

/**
 * Success message with green checkmark
 */
export function success(text: string): string {
  return `${chalk.green('✔')} ${text}`;
}

/**
 * Error message with red X
 */
export function error(text: string): string {
  return `${chalk.red('✖')} ${chalk.red(text)}`;
}

/**
 * Warning message with yellow triangle
 */
export function warn(text: string): string {
  return `${chalk.yellow('⚠')} ${chalk.yellow(text)}`;
}

/**
 * Info message with blue icon
 */
export function info(text: string): string {
  return `${chalk.blue('ℹ')} ${text}`;
}

/**
 * Debug message (dim)
 */
export function debug(text: string): string {
  return chalk.dim(`  ${text}`);
}

// ─── Tables ─────────────────────────────────────────────────────────────────

/**
 * Create a formatted table
 */
export function table(headers: string[], rows: (string | number)[][]): string {
  const tbl = new Table({
    head: headers.map(h => purple.bold(h)),
    style: {
      head: [],
      border: ['gray'],
    },
    chars: {
      'top': '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      'bottom': '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      'left': '│',
      'left-mid': '├',
      'mid': '─',
      'mid-mid': '┼',
      'right': '│',
      'right-mid': '┤',
      'middle': '│',
    },
  });

  rows.forEach(row => tbl.push(row.map(cell => String(cell))));
  return tbl.toString();
}

/**
 * Create a key-value detail table
 */
export function detailTable(pairs: [string, string][]): string {
  const tbl = new Table({
    style: {
      head: [],
      border: ['gray'],
    },
    chars: {
      'top': '─',
      'top-mid': '┬',
      'top-left': '┌',
      'top-right': '┐',
      'bottom': '─',
      'bottom-mid': '┴',
      'bottom-left': '└',
      'bottom-right': '┘',
      'left': '│',
      'left-mid': '├',
      'mid': '─',
      'mid-mid': '┼',
      'right': '│',
      'right-mid': '┤',
      'middle': '│',
    },
  });

  pairs.forEach(([key, value]) => {
    const obj: Record<string, string> = {};
    obj[purple.bold(key)] = value;
    tbl.push(obj);
  });

  return tbl.toString();
}

// ─── Spinner ────────────────────────────────────────────────────────────────

/**
 * Create an ora spinner
 */
export function spinner(text: string): Ora {
  return ora({
    text,
    color: 'magenta',
    spinner: 'dots',
  });
}

// ─── Formatters ─────────────────────────────────────────────────────────────

/**
 * Format a dollar amount
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 5) return 'just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
}

/**
 * Format a date as absolute timestamp
 */
export function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format a percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format latency in ms
 */
export function formatLatency(ms: number): string {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// ─── Status Badges ──────────────────────────────────────────────────────────

/**
 * Colored status badge
 */
export function statusBadge(status: string): string {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'allowed':
    case 'active':
    case 'approved':
      return chalk.green.bold(`● ${status.toUpperCase()}`);
    case 'denied':
    case 'revoked':
    case 'suspended':
    case 'error':
      return chalk.red.bold(`● ${status.toUpperCase()}`);
    case 'pending':
    case 'draft':
      return chalk.yellow.bold(`● ${status.toUpperCase()}`);
    case 'expired':
    case 'inactive':
    case 'archived':
      return chalk.gray.bold(`● ${status.toUpperCase()}`);
    default:
      return chalk.white.bold(`● ${status.toUpperCase()}`);
  }
}

/**
 * Decision badge (for authorization results)
 */
export function decisionBadge(decision: string): string {
  switch (decision.toUpperCase()) {
    case 'ALLOWED':
      return chalk.bgGreen.white.bold(` ALLOWED `);
    case 'DENIED':
      return chalk.bgRed.white.bold(` DENIED `);
    case 'PENDING':
      return chalk.bgYellow.black.bold(` PENDING `);
    default:
      return chalk.bgGray.white.bold(` ${decision} `);
  }
}

/**
 * Log level badge
 */
export function levelBadge(level: string): string {
  switch (level.toLowerCase()) {
    case 'info':
      return chalk.blue('INFO ');
    case 'warn':
      return chalk.yellow('WARN ');
    case 'error':
      return chalk.red('ERROR');
    case 'debug':
      return chalk.gray('DEBUG');
    default:
      return chalk.white(level.toUpperCase().padEnd(5));
  }
}

// ─── Boxes & Cards ──────────────────────────────────────────────────────────

/**
 * Create a stats card
 */
export function statsCard(title: string, value: string, subtitle?: string): string {
  const content = subtitle
    ? `${chalk.bold(value)}\n${chalk.dim(subtitle)}`
    : chalk.bold(value);

  return boxen(content, {
    title: purple(title),
    titleAlignment: 'center',
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    borderStyle: 'round',
    borderColor: '#7C3AED',
  });
}

/**
 * Create an info box
 */
export function infoBox(title: string, content: string): string {
  return boxen(content, {
    title: purple.bold(title),
    titleAlignment: 'left',
    padding: 1,
    margin: { top: 0, bottom: 1, left: 0, right: 0 },
    borderStyle: 'round',
    borderColor: '#7C3AED',
  });
}

/**
 * Create an error box
 */
export function errorBox(title: string, content: string): string {
  return boxen(chalk.red(content), {
    title: chalk.red.bold(title),
    titleAlignment: 'left',
    padding: 1,
    margin: { top: 0, bottom: 1, left: 0, right: 0 },
    borderStyle: 'round',
    borderColor: 'red',
  });
}

// ─── Misc ───────────────────────────────────────────────────────────────────

/**
 * Mask a string, showing only first and last N characters
 */
export function mask(value: string, showFirst: number = 4, showLast: number = 4): string {
  if (value.length <= showFirst + showLast) return value;
  return `${value.substring(0, showFirst)}${'•'.repeat(8)}${value.substring(value.length - showLast)}`;
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(text: string, maxLength: number = 40): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Print a newline
 */
export function newline(): void {
  console.log();
}

/**
 * Brand tag for the CLI
 */
export function brand(): string {
  return purpleBg(' AgentAuth ');
}

export { chalk, purple, purpleBg };
