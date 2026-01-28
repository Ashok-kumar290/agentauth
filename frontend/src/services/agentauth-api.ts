/**
 * AgentAuth API Service
 * 
 * Connects the frontend to the backend authorization system.
 * Backend: https://characteristic-inessa-agentauth-0a540dd6.koyeb.app (production)
 */

import { API_BASE_URL, IS_DEVELOPMENT } from '../config/api';

// Production backend URL
const PRODUCTION_BACKEND = 'https://characteristic-inessa-agentauth-0a540dd6.koyeb.app';

/**
 * Get the correct backend URL based on environment
 */
function getBackendUrl(): string {
    // Use the centralized API_BASE_URL from config
    if (API_BASE_URL && API_BASE_URL !== 'http://localhost:8000') {
        return API_BASE_URL;
    }
    return IS_DEVELOPMENT ? 'http://localhost:8000' : PRODUCTION_BACKEND;
}

const BACKEND_URL = getBackendUrl();

/**
 * API request helper with error handling
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${BACKEND_URL}${endpoint}`;
    
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.detail || data.error || 'API request failed');
    }
    
    return data;
}

// ============================================================================
// API Types
// ============================================================================

export interface Consent {
    id: string;
    agent_id: string;
    user_id: string;
    merchant_whitelist?: string[];
    merchant_blacklist?: string[];
    category_whitelist?: string[];
    category_blacklist?: string[];
    max_amount?: number;
    max_per_transaction?: number;
    daily_limit?: number;
    monthly_limit?: number;
    valid_from: string;
    valid_until: string;
    status: 'active' | 'revoked' | 'expired' | 'pending';
    delegation_token: string;
    created_at: string;
}

export interface ConsentCreateRequest {
    agent_id: string;
    merchant_whitelist?: string[];
    merchant_blacklist?: string[];
    category_whitelist?: string[];
    category_blacklist?: string[];
    max_amount?: number;
    max_per_transaction?: number;
    daily_limit?: number;
    monthly_limit?: number;
    valid_hours?: number;
}

export interface AuthorizeRequest {
    delegation_token: string;
    merchant: string;
    amount: number;
    currency?: string;
    category?: string;
    description?: string;
    metadata?: Record<string, any>;
}

export interface AuthorizeResponse {
    decision: 'ALLOW' | 'DENY';
    auth_code?: string;
    consent_id?: string;
    remaining_daily_limit?: number;
    remaining_monthly_limit?: number;
    reason?: string;
    expires_at?: string;
}

export interface VerifyRequest {
    auth_code: string;
    merchant: string;
    amount: number;
}

export interface VerifyResponse {
    valid: boolean;
    consent_proof?: {
        consent_id: string;
        user_id: string;
        agent_id: string;
        authorized_at: string;
        merchant: string;
        amount: number;
        signature: string;
    };
    error?: string;
}

export interface SpendingLimits {
    daily_limit: number;
    monthly_limit: number;
    per_transaction_limit: number;
    daily_used: number;
    monthly_used: number;
}

export interface DashboardStats {
    total_authorizations: number;
    transaction_volume: number;
    approval_rate: number;
    avg_response_time: number;
    active_consents: number;
    daily_requests: number[];
}

// ============================================================================
// API Methods
// ============================================================================

/**
 * Check backend health
 */
export async function checkHealth(): Promise<{ status: string }> {
    return apiRequest('/health');
}

/**
 * Create a new consent
 */
export async function createConsent(
    request: ConsentCreateRequest,
    apiKey: string
): Promise<Consent> {
    return apiRequest('/v1/consents', {
        method: 'POST',
        headers: {
            'X-API-Key': apiKey,
        },
        body: JSON.stringify(request),
    });
}

/**
 * Get all consents for the authenticated user
 */
export async function getConsents(apiKey: string): Promise<Consent[]> {
    return apiRequest('/v1/consents', {
        headers: {
            'X-API-Key': apiKey,
        },
    });
}

/**
 * Get a specific consent by ID
 */
export async function getConsent(id: string, apiKey: string): Promise<Consent> {
    return apiRequest(`/v1/consents/${id}`, {
        headers: {
            'X-API-Key': apiKey,
        },
    });
}

/**
 * Revoke a consent
 */
export async function revokeConsent(id: string, apiKey: string): Promise<void> {
    return apiRequest(`/v1/consents/${id}`, {
        method: 'DELETE',
        headers: {
            'X-API-Key': apiKey,
        },
    });
}

/**
 * Authorize a transaction
 */
export async function authorizeTransaction(
    request: AuthorizeRequest,
    apiKey: string
): Promise<AuthorizeResponse> {
    return apiRequest('/v1/authorize', {
        method: 'POST',
        headers: {
            'X-API-Key': apiKey,
        },
        body: JSON.stringify(request),
    });
}

/**
 * Verify an authorization code
 */
export async function verifyAuthorization(
    request: VerifyRequest,
    apiKey: string
): Promise<VerifyResponse> {
    return apiRequest('/v1/verify', {
        method: 'POST',
        headers: {
            'X-API-Key': apiKey,
        },
        body: JSON.stringify(request),
    });
}

/**
 * Get spending limits
 */
export async function getSpendingLimits(apiKey: string): Promise<SpendingLimits> {
    return apiRequest('/v1/limits', {
        headers: {
            'X-API-Key': apiKey,
        },
    });
}

/**
 * Update spending limits
 */
export async function updateSpendingLimits(
    limits: Partial<SpendingLimits>,
    apiKey: string
): Promise<SpendingLimits> {
    return apiRequest('/v1/limits', {
        method: 'PUT',
        headers: {
            'X-API-Key': apiKey,
        },
        body: JSON.stringify(limits),
    });
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(apiKey: string): Promise<DashboardStats> {
    return apiRequest('/v1/dashboard', {
        headers: {
            'X-API-Key': apiKey,
        },
    });
}

/**
 * Generate a new API key
 */
export async function generateApiKey(
    name: string,
    isLive: boolean = false,
    userId?: string
): Promise<{ api_key: string; name: string; is_live: boolean }> {
    return apiRequest('/v1/api-keys', {
        method: 'POST',
        body: JSON.stringify({
            name,
            is_live: isLive,
            user_id: userId,
        }),
    });
}

// ============================================================================
// Helper for Demo/Testing
// ============================================================================

/**
 * Run a complete authorization flow (for demo purposes)
 */
export async function runDemoFlow(apiKey: string): Promise<{
    consent: Consent;
    authorization: AuthorizeResponse;
    verification: VerifyResponse;
}> {
    // 1. Create a consent
    const consent = await createConsent({
        agent_id: 'demo-agent',
        max_per_transaction: 100,
        daily_limit: 500,
        valid_hours: 24,
    }, apiKey);
    
    // 2. Authorize a transaction
    const authorization = await authorizeTransaction({
        delegation_token: consent.delegation_token,
        merchant: 'Demo Store',
        amount: 29.99,
        category: 'retail',
    }, apiKey);
    
    // 3. Verify the authorization
    let verification: VerifyResponse = { valid: false };
    if (authorization.decision === 'ALLOW' && authorization.auth_code) {
        verification = await verifyAuthorization({
            auth_code: authorization.auth_code,
            merchant: 'Demo Store',
            amount: 29.99,
        }, apiKey);
    }
    
    return { consent, authorization, verification };
}

// Export the backend URL for debugging
export { BACKEND_URL };
