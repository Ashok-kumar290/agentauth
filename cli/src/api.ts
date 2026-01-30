import fetch, { Response } from 'node-fetch';
import {
  Agent,
  AgentRegistration,
  ApiKey,
  ApiKeyCreateRequest,
  ApiResponse,
  AuthorizationRequest,
  AuthorizationResult,
  Consent,
  DashboardStats,
  LogEntry,
  LogQuery,
  PaginatedResponse,
  Policy,
  PolicyCreateRequest,
  AccountInfo,
} from './types';

export class ApiError extends Error {
  public statusCode: number;
  public responseBody: string;

  constructor(message: string, statusCode: number, responseBody: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

export class AgentAuthClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://agentauth.in') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private get headers(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': '@agentauth/cli v1.0.0',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const text = await response.text();

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorBody = JSON.parse(text);
        if (errorBody.error) {
          errorMessage = errorBody.error;
        } else if (errorBody.message) {
          errorMessage = errorBody.message;
        }
      } catch {
        // text is not JSON; use status-based message
      }
      throw new ApiError(errorMessage, response.status, text);
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new ApiError('Invalid JSON response from API', response.status, text);
    }
  }

  private async get<T>(path: string, query?: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.headers,
    });

    return this.handleResponse<T>(response);
  }

  private async post<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  private async put<T>(path: string, body?: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  private async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.headers,
    });

    return this.handleResponse<T>(response);
  }

  // ─── Account ────────────────────────────────────────────────────────────────

  /**
   * Validate the API key and get account information
   */
  async getAccount(): Promise<ApiResponse<AccountInfo>> {
    return this.get<ApiResponse<AccountInfo>>('/v1/account');
  }

  // ─── Authorization ─────────────────────────────────────────────────────────

  /**
   * Submit an authorization request
   */
  async authorize(request: AuthorizationRequest): Promise<ApiResponse<AuthorizationResult>> {
    return this.post<ApiResponse<AuthorizationResult>>('/v1/authorize', request);
  }

  // ─── Agents ─────────────────────────────────────────────────────────────────

  /**
   * List all registered agents
   */
  async listAgents(): Promise<PaginatedResponse<Agent>> {
    return this.get<PaginatedResponse<Agent>>('/v1/agents');
  }

  /**
   * Register a new agent
   */
  async registerAgent(registration: AgentRegistration): Promise<ApiResponse<Agent>> {
    return this.post<ApiResponse<Agent>>('/v1/agents', registration);
  }

  /**
   * Get a single agent by ID
   */
  async getAgent(id: string): Promise<ApiResponse<Agent>> {
    return this.get<ApiResponse<Agent>>(`/v1/agents/${encodeURIComponent(id)}`);
  }

  /**
   * Update an agent
   */
  async updateAgent(id: string, updates: Partial<AgentRegistration>): Promise<ApiResponse<Agent>> {
    return this.put<ApiResponse<Agent>>(`/v1/agents/${encodeURIComponent(id)}`, updates);
  }

  /**
   * Remove an agent
   */
  async removeAgent(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.delete<ApiResponse<{ deleted: boolean }>>(`/v1/agents/${encodeURIComponent(id)}`);
  }

  // ─── Policies ───────────────────────────────────────────────────────────────

  /**
   * List all policies
   */
  async listPolicies(): Promise<PaginatedResponse<Policy>> {
    return this.get<PaginatedResponse<Policy>>('/v1/policies');
  }

  /**
   * Create a new policy
   */
  async createPolicy(policy: PolicyCreateRequest): Promise<ApiResponse<Policy>> {
    return this.post<ApiResponse<Policy>>('/v1/policies', policy);
  }

  /**
   * Get a single policy by ID
   */
  async getPolicy(id: string): Promise<ApiResponse<Policy>> {
    return this.get<ApiResponse<Policy>>(`/v1/policies/${encodeURIComponent(id)}`);
  }

  /**
   * Update a policy
   */
  async updatePolicy(id: string, updates: Partial<PolicyCreateRequest>): Promise<ApiResponse<Policy>> {
    return this.put<ApiResponse<Policy>>(`/v1/policies/${encodeURIComponent(id)}`, updates);
  }

  /**
   * Delete a policy
   */
  async deletePolicy(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.delete<ApiResponse<{ deleted: boolean }>>(`/v1/policies/${encodeURIComponent(id)}`);
  }

  /**
   * Test a policy with a simulated request (dry run)
   */
  async testPolicy(policyId: string, request: AuthorizationRequest): Promise<ApiResponse<AuthorizationResult>> {
    return this.post<ApiResponse<AuthorizationResult>>(`/v1/policies/${encodeURIComponent(policyId)}/test`, request);
  }

  // ─── Consents ───────────────────────────────────────────────────────────────

  /**
   * List all consent requests
   */
  async listConsents(status?: string): Promise<PaginatedResponse<Consent>> {
    return this.get<PaginatedResponse<Consent>>('/v1/consents', status ? { status } : undefined);
  }

  /**
   * Get a single consent by ID
   */
  async getConsent(id: string): Promise<ApiResponse<Consent>> {
    return this.get<ApiResponse<Consent>>(`/v1/consents/${encodeURIComponent(id)}`);
  }

  /**
   * Approve a pending consent
   */
  async approveConsent(id: string): Promise<ApiResponse<Consent>> {
    return this.post<ApiResponse<Consent>>(`/v1/consents/${encodeURIComponent(id)}/approve`);
  }

  /**
   * Deny a pending consent
   */
  async denyConsent(id: string, reason?: string): Promise<ApiResponse<Consent>> {
    return this.post<ApiResponse<Consent>>(`/v1/consents/${encodeURIComponent(id)}/deny`, { reason });
  }

  /**
   * Revoke a previously approved consent
   */
  async revokeConsent(id: string): Promise<ApiResponse<Consent>> {
    return this.post<ApiResponse<Consent>>(`/v1/consents/${encodeURIComponent(id)}/revoke`);
  }

  // ─── Logs & Analytics ───────────────────────────────────────────────────────

  /**
   * Query logs with filters
   */
  async listLogs(query?: LogQuery): Promise<PaginatedResponse<LogEntry>> {
    const params: Record<string, string | number | undefined> = {};
    if (query) {
      if (query.agentId) params.agentId = query.agentId;
      if (query.action) params.action = query.action;
      if (query.decision) params.decision = query.decision;
      if (query.startDate) params.startDate = query.startDate;
      if (query.endDate) params.endDate = query.endDate;
      if (query.limit) params.limit = query.limit;
      if (query.offset) params.offset = query.offset;
      if (query.search) params.search = query.search;
    }
    return this.get<PaginatedResponse<LogEntry>>('/v1/analytics/logs', params);
  }

  /**
   * Stream logs in real-time (long-polling)
   */
  async streamLogs(since?: string): Promise<PaginatedResponse<LogEntry>> {
    const params: Record<string, string | number | undefined> = {
      stream: 'true' as string,
    };
    if (since) params.since = since;
    return this.get<PaginatedResponse<LogEntry>>('/v1/analytics/logs', params);
  }

  // ─── Dashboard ──────────────────────────────────────────────────────────────

  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    return this.get<ApiResponse<DashboardStats>>('/v1/dashboard/stats');
  }

  // ─── API Keys ───────────────────────────────────────────────────────────────

  /**
   * List all API keys
   */
  async listKeys(): Promise<PaginatedResponse<ApiKey>> {
    return this.get<PaginatedResponse<ApiKey>>('/v1/api-keys');
  }

  /**
   * Create a new API key
   */
  async createKey(request: ApiKeyCreateRequest): Promise<ApiResponse<ApiKey>> {
    return this.post<ApiResponse<ApiKey>>('/v1/api-keys', request);
  }

  /**
   * Get a single API key by ID
   */
  async getKey(id: string): Promise<ApiResponse<ApiKey>> {
    return this.get<ApiResponse<ApiKey>>(`/v1/api-keys/${encodeURIComponent(id)}`);
  }

  /**
   * Revoke an API key
   */
  async revokeKey(id: string): Promise<ApiResponse<{ revoked: boolean }>> {
    return this.delete<ApiResponse<{ revoked: boolean }>>(`/v1/api-keys/${encodeURIComponent(id)}`);
  }
}

/**
 * Create an authenticated API client from stored configuration
 */
export function createClient(apiKey: string, apiUrl: string): AgentAuthClient {
  return new AgentAuthClient(apiKey, apiUrl);
}
