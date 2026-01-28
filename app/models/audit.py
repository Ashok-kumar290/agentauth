"""
Audit log model - immutable record of all authorization events
"""
import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.database import Base


class AuditLog(Base):
    """
    Audit log table - append-only record of all authorization events.
    
    This provides a complete audit trail for compliance and dispute resolution.
    """
    __tablename__ = "audit_log"

    # Primary key
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    
    # Event identification
    event_id: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        index=True,
        nullable=False
    )
    
    # Event type
    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )
    # Event types:
    # - consent_created
    # - consent_revoked
    # - authorization_requested
    # - authorization_granted
    # - authorization_denied
    # - verification_requested
    # - verification_completed
    
    # Timestamp
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    
    # Actors involved
    user_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    agent_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    merchant_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Related entities
    consent_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    authorization_code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    
    # Event data (full context)
    event_data: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    # Structure varies by event_type, but typically includes:
    # {
    #   "action": "payment",
    #   "amount": 347,
    #   "currency": "USD",
    #   "decision": "ALLOW",
    #   "reason": null,
    #   ...
    # }
    
    # Cryptographic chain (for integrity)
    record_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    previous_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    
    # Platform signature for non-repudiation
    signature: Mapped[str] = mapped_column(Text, nullable=False)
    
    def __repr__(self) -> str:
        return f"<AuditLog {self.event_id} type={self.event_type}>"
