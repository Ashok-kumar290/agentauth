"""
AgentAuth Middleware Package
"""
from app.middleware.rate_limiter import RateLimitMiddleware, rate_limit_store, rate_limit_check
from app.middleware.api_keys import (
    generate_api_key,
    verify_api_key,
    get_api_key_optional,
    require_api_key,
    DEMO_KEY,
)
from app.middleware.idempotency import (
    IdempotencyMiddleware,
    generate_idempotency_key,
    get_idempotency_key,
    require_idempotency_key,
)

__all__ = [
    "RateLimitMiddleware",
    "rate_limit_store",
    "rate_limit_check",
    "generate_api_key",
    "verify_api_key",
    "get_api_key_optional",
    "require_api_key",
    "DEMO_KEY",
    "IdempotencyMiddleware",
    "generate_idempotency_key",
    "get_idempotency_key",
    "require_idempotency_key",
]
