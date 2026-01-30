// ─── Agent Types ────────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'suspended';
  capabilities: string[];
  policies: string[];
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string | null;
  metadata: Record<string, unknown>;
}

export interface AgentRegistration {
  name: string;
  description?: string;
  capabilities?: string[];
  policies?: string[];
  metadata?: Record<string, unknown>;
}

// ─── Policy Types ───────────────────────────────────────────────────────────

export interface Policy {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  rules: PolicyRule[];
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  id: string;
  action: string;
  effect: 'allow' | 'deny' | 'require_consent';
  conditions: PolicyCondition[];
  priority: number;
}

export interface PolicyCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'matches';
  value: unknown;
}

export interface PolicyCreateRequest {
  name: string;
  description?: string;
  rules: Omit<PolicyRule, 'id'>[];
}

// ─── Consent Types ──────────────────────────────────────────────────────────

export interface Consent {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  resource: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied' | 'revoked' | 'expired';
  amount?: number;
  merchant?: string;
  expiresAt: string | null;
  decidedAt: string | null;
  decidedBy: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
}

// ─── Authorization Types ────────────────────────────────────────────────────

export interface AuthorizationRequest {
  agentId: string;
  action: string;
  resource?: string;
  amount?: number;
  merchant?: string;
  description?: string;
  context?: Record<string, unknown>;
}

export interface AuthorizationResult {
  decision: 'ALLOWED' | 'DENIED' | 'PENDING';
  requestId: string;
  agentId: string;
  action: string;
  reason: string;
  policyId?: string;
  policyName?: string;
  consentId?: string;
  evaluatedAt: string;
  latencyMs: number;
  conditions?: string[];
}

// ─── Log Types ──────────────────────────────────────────────────────────────

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  event: string;
  agentId: string;
  agentName: string;
  action: string;
  decision: 'ALLOWED' | 'DENIED' | 'PENDING';
  amount?: number;
  merchant?: string;
  policyId?: string;
  latencyMs: number;
  metadata: Record<string, unknown>;
}

export interface LogQuery {
  agentId?: string;
  action?: string;
  decision?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

// ─── API Key Types ──────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  status: 'active' | 'revoked';
  permissions: string[];
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

export interface ApiKeyCreateRequest {
  name: string;
  permissions?: string[];
  expiresAt?: string;
}

// ─── Dashboard Types ────────────────────────────────────────────────────────

export interface DashboardStats {
  actionsToday: number;
  actionsThisWeek: number;
  actionsThisMonth: number;
  totalVolume: number;
  approvalRate: number;
  denialRate: number;
  pendingRate: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  activeAgents: number;
  totalAgents: number;
  activePolicies: number;
  pendingConsents: number;
  topAgents: Array<{ id: string; name: string; actions: number }>;
  topActions: Array<{ action: string; count: number }>;
  recentActivity: LogEntry[];
}

// ─── Account Types ──────────────────────────────────────────────────────────

export interface AccountInfo {
  id: string;
  email: string;
  name: string;
  organization: string;
  plan: 'free' | 'pro' | 'enterprise';
  usage: {
    authorizationsUsed: number;
    authorizationsLimit: number;
    agentsUsed: number;
    agentsLimit: number;
    policiesUsed: number;
    policiesLimit: number;
  };
  createdAt: string;
}

// ─── API Response Types ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ─── Test Scenario Types ────────────────────────────────────────────────────

export interface TestScenario {
  name: string;
  description?: string;
  scenarios: TestCase[];
}

export interface TestCase {
  name: string;
  request: AuthorizationRequest;
  expectedDecision: 'ALLOWED' | 'DENIED' | 'PENDING';
  expectedReason?: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  latencyMs: number;
  reason: string;
  error?: string;
}

// ─── Config Types ───────────────────────────────────────────────────────────

export interface CliConfig {
  apiKey: string;
  apiUrl: string;
  outputFormat: 'table' | 'json' | 'yaml';
  colorEnabled: boolean;
}
