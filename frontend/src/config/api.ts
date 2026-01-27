/**
 * API Configuration
 * 
 * Centralized API URL configuration for the AgentAuth frontend.
 * Uses environment variable VITE_API_URL, with fallback for development.
 */

/**
 * Get the base API URL from environment or use fallback
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Check if we're in development mode
 */
export const IS_DEVELOPMENT = import.meta.env.DEV;

/**
 * Build a full API endpoint URL
 */
export function apiUrl(path: string): string {
    const base = API_BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    const endpoint = path.startsWith('/') ? path : `/${path}`;
    return `${base}${endpoint}`;
}

/**
 * Helper for v1 API endpoints
 */
export function v1Api(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return apiUrl(`/v1/${cleanPath}`);
}

/**
 * Helper for Netlify functions (used for Stripe, waitlist, etc.)
 */
export function netlifyFunction(name: string): string {
    // Netlify functions are always relative to the current origin
    return `/.netlify/functions/${name}`;
}
