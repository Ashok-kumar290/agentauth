"""
Rate Limiting Middleware

Simple in-memory rate limiter for MVP.
For production, use Redis-backed limiter.
"""
import time
from collections import defaultdict
from typing import Dict, Tuple, Optional
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimitStore:
    """In-memory store for rate limit tracking."""
    
    def __init__(self):
        self.requests: Dict[str, list] = defaultdict(list)
    
    def is_rate_limited(
        self,
        key: str,
        max_requests: int,
        window_seconds: int
    ) -> Tuple[bool, int, int]:
        """
        Check if a key is rate limited.
        
        Returns:
            (is_limited, remaining_requests, reset_time)
        """
        now = time.time()
        window_start = now - window_seconds
        
        # Clean old requests
        self.requests[key] = [
            ts for ts in self.requests[key] 
            if ts > window_start
        ]
        
        current_count = len(self.requests[key])
        remaining = max(0, max_requests - current_count)
        
        if current_count >= max_requests:
            # Calculate reset time
            oldest = min(self.requests[key]) if self.requests[key] else now
            reset_in = int(oldest + window_seconds - now)
            return True, 0, reset_in
        
        # Record this request
        self.requests[key].append(now)
        return False, remaining - 1, window_seconds


# Global store
rate_limit_store = RateLimitStore()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware.
    
    Limits:
    - By IP: 100 requests per minute
    - By API key: 1000 requests per minute
    """
    
    def __init__(
        self,
        app,
        requests_per_minute: int = 100,
        api_key_requests_per_minute: int = 1000,
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.api_key_requests_per_minute = api_key_requests_per_minute
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for docs and health
        if request.url.path in ["/docs", "/redoc", "/openapi.json", "/health", "/"]:
            return await call_next(request)
        
        # Get client identifier
        client_ip = request.client.host if request.client else "unknown"
        api_key = request.headers.get("X-API-Key") or request.headers.get("Authorization", "").replace("Bearer ", "")
        
        # Determine rate limit based on auth
        if api_key and api_key.startswith("aa_"):
            key = f"apikey:{api_key[:20]}"
            max_requests = self.api_key_requests_per_minute
        else:
            key = f"ip:{client_ip}"
            max_requests = self.requests_per_minute
        
        # Check rate limit
        is_limited, remaining, reset_in = rate_limit_store.is_rate_limited(
            key=key,
            max_requests=max_requests,
            window_seconds=60
        )
        
        if is_limited:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "rate_limit_exceeded",
                    "message": f"Rate limit exceeded. Try again in {reset_in} seconds.",
                    "retry_after": reset_in
                },
                headers={"Retry-After": str(reset_in)}
            )
        
        # Add rate limit headers to response
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_in)
        
        return response
