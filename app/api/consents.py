"""
Consents API - POST /v1/consents

Create user consents and get delegation tokens.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.database import get_db
from app.models.consent import Consent
from app.schemas.consent import ConsentCreate, ConsentResponse
from app.services.consent_service import consent_service

router = APIRouter(prefix="/v1/consents", tags=["Consents"])


@router.get(
    "",
    summary="List all consents",
    description="List all active consents (for dashboard monitoring).",
)
async def list_consents(
    limit: int = Query(default=20, le=100, description="Max consents to return"),
    offset: int = Query(default=0, ge=0, description="Offset for pagination"),
    db: AsyncSession = Depends(get_db),
):
    """List all consents for dashboard monitoring with pagination."""
    try:
        # Efficient query with pagination - uses index on created_at
        result = await db.execute(
            select(
                Consent.consent_id,
                Consent.user_id,
                Consent.developer_id,
                Consent.intent_description,
                Consent.constraints,
                Consent.scope,
                Consent.is_active,
                Consent.created_at,
                Consent.expires_at
            )
            .order_by(Consent.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        rows = result.all()
        
        return {
            "consents": [
                {
                    "consent_id": row.consent_id,
                    "user_id": row.user_id,
                    "developer_id": row.developer_id,
                    "intent_description": row.intent_description,
                    "constraints": row.constraints,
                    "scope": row.scope,
                    "is_active": row.is_active,
                    "created_at": row.created_at.isoformat() if row.created_at else None,
                    "expires_at": row.expires_at.isoformat() if row.expires_at else None,
                }
                for row in rows
            ],
            "total": len(rows),
            "limit": limit,
            "offset": offset,
        }
    except Exception as e:
        return {"consents": [], "total": 0, "error": str(e)}


@router.post(
    "",
    response_model=ConsentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new consent",
    description="""
    Create a new user consent and receive a delegation token.
    
    The consent captures:
    - **User intent**: What the user wants to accomplish
    - **Constraints**: Spending limits and merchant restrictions
    - **Options**: Expiry, single-use, etc.
    
    Returns a delegation token that agents use to request authorization.
    """,
)
async def create_consent(
    consent_data: ConsentCreate,
    db: AsyncSession = Depends(get_db),
) -> ConsentResponse:
    """
    Create a new consent.
    
    This is the first step in the AgentAuth flow.
    User expresses intent → We issue delegation token.
    """
    try:
        response = await consent_service.create_consent(db, consent_data)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create consent: {str(e)}"
        )


@router.get(
    "/{consent_id}",
    summary="Get consent details",
    description="Retrieve details of an existing consent.",
)
async def get_consent(
    consent_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get consent by ID."""
    consent = await consent_service.get_consent(db, consent_id)
    if consent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent not found"
        )
    
    return {
        "consent_id": consent.consent_id,
        "user_id": consent.user_id,
        "intent": consent.intent_description,
        "constraints": consent.constraints,
        "is_active": consent.is_active,
        "expires_at": consent.expires_at,
        "created_at": consent.created_at,
    }


@router.delete(
    "/{consent_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Revoke a consent",
    description="Revoke a consent, invalidating any associated tokens.",
)
async def revoke_consent(
    consent_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Revoke a consent."""
    success = await consent_service.revoke_consent(db, consent_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Consent not found"
        )
    return None
