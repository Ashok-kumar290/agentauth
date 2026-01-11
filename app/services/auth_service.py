"""
Auth Service - Authorization decision engine
"""
import secrets
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.authorization import Authorization
from app.schemas.authorize import AuthorizeRequest, AuthorizeResponse
from app.services.token_service import token_service
from app.services.consent_service import consent_service
from app.config import get_settings

settings = get_settings()


def generate_authorization_code() -> str:
    """Generate a unique authorization code."""
    return f"authz_{secrets.token_urlsafe(16)}"


class AuthService:
    """
    Authorization Service - makes authorization decisions.
    
    This is where we check:
    1. Is the token valid?
    2. Is the amount within limits?
    3. Is the merchant allowed?
    4. Is the currency correct?
    
    If all checks pass, we generate an authorization code.
    """
    
    async def authorize(
        self,
        db: AsyncSession,
        request: AuthorizeRequest
    ) -> AuthorizeResponse:
        """
        Make an authorization decision.
        
        This is the critical path - called every time an agent
        wants to perform an action.
        """
        # Step 1: Verify the delegation token
        verification = token_service.verify_token(
            token=request.delegation_token,
            request_amount=request.transaction.amount,
            request_currency=request.transaction.currency,
            request_merchant_id=request.transaction.merchant_id,
            request_merchant_category=request.transaction.merchant_category,
        )
        
        # If token verification failed, deny
        if not verification.valid:
            return AuthorizeResponse(
                decision="DENY",
                reason=verification.reason,
                message=verification.message
            )
        
        # Step 2: Check if consent still exists in database (optional but recommended)
        # This catches revoked consents that still have valid tokens
        consent = await consent_service.get_active_consent(
            db, verification.payload.consent_id
        )
        
        if consent is None:
            return AuthorizeResponse(
                decision="DENY",
                reason="consent_invalid",
                message="Consent has been revoked or does not exist"
            )
        
        # Step 3: All checks passed - generate authorization code
        now = datetime.utcnow()
        expires_at = now + timedelta(seconds=settings.auth_code_expiry_seconds)
        authorization_code = generate_authorization_code()
        
        # Store authorization record
        authorization = Authorization(
            authorization_code=authorization_code,
            consent_id=verification.payload.consent_id,
            decision="ALLOW",
            amount=request.transaction.amount,
            currency=request.transaction.currency,
            merchant_id=request.transaction.merchant_id,
            merchant_name=request.transaction.merchant_name,
            merchant_category=request.transaction.merchant_category,
            action=request.action,
            transaction_metadata={
                "description": request.transaction.description,
            },
            expires_at=expires_at,
        )
        
        db.add(authorization)
        await db.flush()
        
        return AuthorizeResponse(
            decision="ALLOW",
            authorization_code=authorization_code,
            expires_at=expires_at,
            consent_id=verification.payload.consent_id
        )
    
    async def check_step_up_required(
        self,
        consent_id: str,
        amount: float
    ) -> bool:
        """
        Check if step-up authentication is required.
        
        For MVP, always returns False.
        Future: configurable thresholds per user/consent.
        """
        # TODO: Implement step-up logic
        return False


# Singleton instance
auth_service = AuthService()
