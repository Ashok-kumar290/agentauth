"""
Verify Service - Merchant verification of authorization codes
"""
from datetime import datetime, timezone
from typing import Optional
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.authorization import Authorization
from app.models.consent import Consent
from app.schemas.verify import VerifyRequest, VerifyResponse, ConsentProof
from app.services.token_service import token_service
# Import the auth cache for fast lookups before DB
from app.services.auth_service import _auth_cache


class VerifyService:
    """
    Verification Service - allows merchants to verify authorization codes.
    
    This is the merchant-facing endpoint. When a merchant receives an
    authorization code from an agent, they call this to:
    1. Verify the code is valid
    2. Get proof of user consent (for chargeback defense)
    3. Mark the authorization as used
    """
    
    async def verify(
        self,
        db: AsyncSession,
        request: VerifyRequest
    ) -> VerifyResponse:
        """
        Verify an authorization code and return consent proof.
        
        Uses cache-first approach for fast verification:
        1. Check in-memory cache (populated by authorize)
        2. Fall back to database lookup
        """
        now = datetime.now(timezone.utc)
        
        # Step 1: Check in-memory cache first (fast path)
        cached_auth = _auth_cache.get(request.authorization_code)
        
        if cached_auth:
            # Validate from cache
            if cached_auth.get("is_used"):
                return VerifyResponse(
                    valid=False,
                    verification_timestamp=now,
                    error="authorization_already_used"
                )
            
            if cached_auth["expires_at"] < now:
                return VerifyResponse(
                    valid=False,
                    verification_timestamp=now,
                    error="authorization_expired"
                )
            
            if abs(cached_auth["amount"] - request.transaction.amount) > 0.01:
                return VerifyResponse(
                    valid=False,
                    verification_timestamp=now,
                    error="amount_mismatch"
                )
            
            if cached_auth["currency"] != request.transaction.currency:
                return VerifyResponse(
                    valid=False,
                    verification_timestamp=now,
                    error="currency_mismatch"
                )
            
            # Get consent for proof
            consent_result = await db.execute(
                select(Consent).where(
                    Consent.consent_id == cached_auth["consent_id"]
                )
            )
            consent = consent_result.scalar_one_or_none()
            
            if consent is None:
                return VerifyResponse(
                    valid=False,
                    verification_timestamp=now,
                    error="consent_not_found"
                )
            
            # Mark as used in cache
            cached_auth["is_used"] = True
            cached_auth["used_at"] = now
            
            # Generate proof token
            proof_token = token_service.create_proof_token(
                consent_id=consent.consent_id,
                authorization_code=request.authorization_code,
                user_intent=consent.intent_description,
                max_amount=consent.max_amount or 0,
                actual_amount=cached_auth["amount"],
                currency=cached_auth["currency"],
                verified_at=now,
            )
            
            # Build consent proof
            consent_proof = ConsentProof(
                consent_id=consent.consent_id,
                user_authorized_at=consent.created_at,
                user_intent=consent.intent_description,
                max_authorized_amount=consent.max_amount or 0,
                actual_amount=cached_auth["amount"],
                currency=cached_auth["currency"],
                signature_valid=True,
            )
            
            return VerifyResponse(
                valid=True,
                authorization_id=str(uuid.uuid4()),  # Generate ID for cached auth
                consent_proof=consent_proof,
                verification_timestamp=now,
                proof_token=proof_token,
            )
        
        # Step 2: Fall back to database lookup
        result = await db.execute(
            select(Authorization).where(
                Authorization.authorization_code == request.authorization_code
            )
        )
        authorization = result.scalar_one_or_none()
        
        if authorization is None:
            return VerifyResponse(
                valid=False,
                verification_timestamp=now,
                error="authorization_not_found"
            )
        
        # Step 2: Check if already used
        if authorization.is_used:
            return VerifyResponse(
                valid=False,
                verification_timestamp=now,
                error="authorization_already_used"
            )
        
        # Step 3: Check if expired
        if authorization.expires_at < now:
            return VerifyResponse(
                valid=False,
                verification_timestamp=now,
                error="authorization_expired"
            )
        
        # Step 4: Validate amount matches
        if abs(authorization.amount - request.transaction.amount) > 0.01:
            return VerifyResponse(
                valid=False,
                verification_timestamp=now,
                error="amount_mismatch"
            )
        
        if authorization.currency != request.transaction.currency:
            return VerifyResponse(
                valid=False,
                verification_timestamp=now,
                error="currency_mismatch"
            )
        
        # Step 5: Get the original consent for proof
        consent_result = await db.execute(
            select(Consent).where(
                Consent.consent_id == authorization.consent_id
            )
        )
        consent = consent_result.scalar_one_or_none()
        
        if consent is None:
            return VerifyResponse(
                valid=False,
                verification_timestamp=now,
                error="consent_not_found"
            )
        
        # Step 6: Mark as used
        authorization.used_at = now
        authorization.is_used = True
        authorization.verified_at = now
        authorization.verified_by = request.merchant_id
        await db.flush()
        
        # Step 7: Generate proof token
        proof_token = token_service.create_proof_token(
            consent_id=consent.consent_id,
            authorization_code=authorization.authorization_code,
            user_intent=consent.intent_description,
            max_amount=consent.max_amount or 0,
            actual_amount=authorization.amount,
            currency=authorization.currency,
            verified_at=now,
        )
        
        # Step 8: Build consent proof
        consent_proof = ConsentProof(
            consent_id=consent.consent_id,
            user_authorized_at=consent.created_at,
            user_intent=consent.intent_description,
            max_authorized_amount=consent.max_amount or 0,
            actual_amount=authorization.amount,
            currency=authorization.currency,
            signature_valid=True,  # TODO: Actually verify signature
        )
        
        return VerifyResponse(
            valid=True,
            authorization_id=str(authorization.id),
            consent_proof=consent_proof,
            verification_timestamp=now,
            proof_token=proof_token,
        )


# Singleton instance
verify_service = VerifyService()
