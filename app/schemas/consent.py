"""
Consent schemas - request/response models for /v1/consents
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ConsentIntent(BaseModel):
    """User's intent - what they want to accomplish."""
    description: str = Field(
        ...,
        description="Human-readable description of intent",
        examples=["Buy cheapest flight to NYC"]
    )
    raw_input: Optional[str] = Field(
        None,
        description="Original user input (voice/text)"
    )


class ConsentConstraints(BaseModel):
    """Spending and merchant constraints."""
    max_amount: float = Field(
        ...,
        gt=0,
        description="Maximum amount in the specified currency",
        examples=[500.0]
    )
    currency: str = Field(
        default="USD",
        min_length=3,
        max_length=3,
        description="ISO 4217 currency code",
        examples=["USD", "EUR", "GBP"]
    )
    allowed_merchants: Optional[List[str]] = Field(
        None,
        description="List of allowed merchant IDs (if restricted)"
    )
    allowed_categories: Optional[List[str]] = Field(
        None,
        description="List of allowed merchant category codes (MCCs)"
    )


class ConsentOptions(BaseModel):
    """Optional consent configuration."""
    expires_in_seconds: int = Field(
        default=3600,
        gt=0,
        le=86400 * 7,  # Max 7 days
        description="How long the consent is valid (seconds)"
    )
    single_use: bool = Field(
        default=True,
        description="Whether consent is consumed after one use"
    )
    requires_confirmation: bool = Field(
        default=False,
        description="Require step-up confirmation for final purchase"
    )


class ConsentCreate(BaseModel):
    """Request body for creating a new consent."""
    user_id: str = Field(
        ...,
        min_length=1,
        description="Unique identifier for the user",
        examples=["user_123"]
    )
    intent: ConsentIntent
    constraints: ConsentConstraints
    options: Optional[ConsentOptions] = Field(default_factory=ConsentOptions)
    signature: str = Field(
        ...,
        description="Digital signature over intent + constraints"
    )
    public_key: str = Field(
        ...,
        description="User's public key for verification"
    )
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "user_id": "user_123",
                    "intent": {
                        "description": "Buy cheapest flight to NYC"
                    },
                    "constraints": {
                        "max_amount": 500,
                        "currency": "USD"
                    },
                    "options": {
                        "expires_in_seconds": 3600
                    },
                    "signature": "base64_signature",
                    "public_key": "base64_public_key"
                }
            ]
        }
    }


class ConsentResponse(BaseModel):
    """Response after creating a consent."""
    consent_id: str = Field(
        ...,
        description="Unique consent identifier"
    )
    delegation_token: str = Field(
        ...,
        description="JWT token for agent to use"
    )
    expires_at: datetime = Field(
        ...,
        description="When the consent expires"
    )
    constraints: ConsentConstraints = Field(
        ...,
        description="The constraints that were set"
    )
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "consent_id": "cons_abc123xyz",
                    "delegation_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                    "expires_at": "2026-01-11T15:00:00Z",
                    "constraints": {
                        "max_amount": 500,
                        "currency": "USD"
                    }
                }
            ]
        }
    }
