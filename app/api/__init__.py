"""
AgentAuth API Package
"""
from app.api.consents import router as consents_router
from app.api.authorize import router as authorize_router
from app.api.verify import router as verify_router

__all__ = ["consents_router", "authorize_router", "verify_router"]
