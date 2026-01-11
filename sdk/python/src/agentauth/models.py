"""
AgentAuth SDK Data Models
"""
from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class ConsentConstraints(BaseModel):
    """Spending constraints for a consent."""
    max_amount: float
    currency: str
    allowed_merchants: Optional[list[str]] = None
    allowed_categories: Optional[list[str]] = None


class Consent(BaseModel):
    """A user consent with delegation token."""
    consent_id: str
    delegation_token: str
    expires_at: datetime
    constraints: ConsentConstraints
    
    @property
    def token(self) -> str:
        """Alias for delegation_token."""
        return self.delegation_token


class Authorization(BaseModel):
    """Authorization decision result."""
    decision: str  # "ALLOW", "DENY", "STEP_UP"
    authorization_code: Optional[str] = None
    expires_at: Optional[datetime] = None
    consent_id: Optional[str] = None
    reason: Optional[str] = None
    message: Optional[str] = None
    step_up_url: Optional[str] = None
    
    @property
    def allowed(self) -> bool:
        """Check if authorization was allowed."""
        return self.decision == "ALLOW"
    
    @property
    def denied(self) -> bool:
        """Check if authorization was denied."""
        return self.decision == "DENY"
    
    @property
    def requires_step_up(self) -> bool:
        """Check if step-up authentication is required."""
        return self.decision == "STEP_UP"


class ConsentProof(BaseModel):
    """Cryptographic proof of user consent."""
    consent_id: str
    user_authorized_at: datetime
    user_intent: str
    max_authorized_amount: float
    actual_amount: float
    currency: str
    signature_valid: bool


class Verification(BaseModel):
    """Verification result for merchants."""
    valid: bool
    authorization_id: Optional[str] = None
    consent_proof: Optional[ConsentProof] = None
    verification_timestamp: datetime
    proof_token: Optional[str] = None
    error: Optional[str] = None


class Transaction(BaseModel):
    """Transaction details for authorization."""
    amount: float
    currency: str
    merchant_id: Optional[str] = None
    merchant_name: Optional[str] = None
    merchant_category: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
