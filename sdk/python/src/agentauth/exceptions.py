"""
AgentAuth SDK Exceptions
"""


class AgentAuthError(Exception):
    """Base exception for AgentAuth SDK."""
    
    def __init__(self, message: str, code: str = None, details: dict = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(message)


class AuthorizationDenied(AgentAuthError):
    """Raised when authorization is denied."""
    
    def __init__(self, reason: str, message: str = None):
        self.reason = reason
        super().__init__(
            message=message or f"Authorization denied: {reason}",
            code="authorization_denied",
            details={"reason": reason}
        )


class InvalidToken(AgentAuthError):
    """Raised when the delegation token is invalid."""
    
    def __init__(self, message: str = "Invalid or expired delegation token"):
        super().__init__(
            message=message,
            code="invalid_token"
        )


class VerificationFailed(AgentAuthError):
    """Raised when verification fails."""
    
    def __init__(self, error: str):
        super().__init__(
            message=f"Verification failed: {error}",
            code="verification_failed",
            details={"error": error}
        )


class RateLimitExceeded(AgentAuthError):
    """Raised when rate limit is exceeded."""
    
    def __init__(self, retry_after: int = None):
        self.retry_after = retry_after
        super().__init__(
            message="Rate limit exceeded",
            code="rate_limit_exceeded",
            details={"retry_after": retry_after}
        )


class APIError(AgentAuthError):
    """Raised for API errors."""
    
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        super().__init__(
            message=message,
            code="api_error",
            details={"status_code": status_code}
        )
