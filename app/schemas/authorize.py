"""
Authorization schemas - request/response models for /v1/authorize
"""
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


class Transaction(BaseModel):
    """Transaction details for authorization check."""
    amount: float = Field(
        ...,
        gt=0,
        description="Transaction amount",
        examples=[347.00]
    )
    currency: str = Field(
        default="USD",
        min_length=3,
        max_length=3,
        description="ISO 4217 currency code"
    )
    merchant_id: Optional[str] = Field(
        None,
        description="Unique merchant identifier",
        examples=["delta_airlines"]
    )
    merchant_name: Optional[str] = Field(
        None,
        description="Human-readable merchant name",
        examples=["Delta Airlines"]
    )
    merchant_category: Optional[str] = Field(
        None,
        description="Merchant Category Code (MCC)",
        examples=["4511"]
    )
    description: Optional[str] = Field(
        None,
        description="Transaction description"
    )


class AuthorizeRequest(BaseModel):
    """Request body for authorization check."""
    delegation_token: str = Field(
        ...,
        description="JWT delegation token from consent creation"
    )
    action: str = Field(
        default="payment",
        description="Action type being authorized",
        examples=["payment", "search", "compare"]
    )
    transaction: Transaction
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "delegation_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                    "action": "payment",
                    "transaction": {
                        "amount": 347.00,
                        "currency": "USD",
                        "merchant_id": "delta_airlines",
                        "merchant_name": "Delta Airlines"
                    }
                }
            ]
        }
    }


class AuthorizeResponse(BaseModel):
    """Response from authorization check."""
    decision: Literal["ALLOW", "DENY", "STEP_UP"] = Field(
        ...,
        description="Authorization decision"
    )
    authorization_code: Optional[str] = Field(
        None,
        description="One-time code for merchant to verify (only if ALLOW)"
    )
    expires_at: Optional[datetime] = Field(
        None,
        description="When the authorization code expires"
    )
    consent_id: Optional[str] = Field(
        None,
        description="Reference to the original consent"
    )
    reason: Optional[str] = Field(
        None,
        description="Reason code for denial",
        examples=["amount_exceeded", "currency_mismatch", "merchant_not_allowed"]
    )
    message: Optional[str] = Field(
        None,
        description="Human-readable explanation"
    )
    step_up_url: Optional[str] = Field(
        None,
        description="URL for user confirmation (only if STEP_UP)"
    )
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "decision": "ALLOW",
                    "authorization_code": "authz_xyz789abc",
                    "expires_at": "2026-01-11T15:05:00Z",
                    "consent_id": "cons_abc123xyz"
                },
                {
                    "decision": "DENY",
                    "reason": "amount_exceeded",
                    "message": "Transaction amount $600 exceeds consent limit of $500"
                }
            ]
        }
    }
