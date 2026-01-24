"""
AgentBuy - AgentAuth Tools

Tools for authorization, budget checking, and transaction logging.
Integrates with the AgentAuth platform for spending controls.
"""
import logging
from dataclasses import dataclass
from typing import Optional
import os

logger = logging.getLogger(__name__)


@dataclass
class AuthorizationResult:
    """Result of an authorization request."""
    allowed: bool
    authorization_code: Optional[str] = None
    reason: Optional[str] = None
    remaining_budget: Optional[float] = None


class AgentAuthTools:
    """
    Tools for interacting with AgentAuth authorization system.
    Provides spending controls and audit logging for AI purchases.
    """
    
    def __init__(self, api_url: str = None, api_key: str = None):
        self.api_url = api_url or os.getenv("AGENTAUTH_API_URL", "https://api.agentauth.in")
        self.api_key = api_key or os.getenv("AGENTAUTH_API_KEY")
        self._mock_budgets: dict[str, float] = {}  # For demo mode
    
    async def check_budget(
        self,
        user_id: str,
        category: str = "general",
        amount: float = None
    ) -> dict:
        """
        Check if a purchase is within the user's budget.
        
        Args:
            user_id: The user's ID
            category: Purchase category (coffee, food, electronics, etc.)
            amount: Optional amount to check against budget
            
        Returns:
            Budget status including remaining amount and whether purchase is allowed
        """
        # Demo mode - use mock budgets
        if not self.api_key:
            budget_key = f"{user_id}:{category}"
            budget = self._mock_budgets.get(budget_key, 50.0)  # Default $50
            
            allowed = amount is None or amount <= budget
            
            return {
                "success": True,
                "category": category,
                "budget_limit": budget,
                "remaining": budget,
                "amount_requested": amount,
                "allowed": allowed
            }
        
        # Production mode - call AgentAuth API
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_url}/v1/budgets/{user_id}",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    params={"category": category}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    allowed = amount is None or amount <= data.get("remaining", 0)
                    return {
                        "success": True,
                        **data,
                        "amount_requested": amount,
                        "allowed": allowed
                    }
                else:
                    return {
                        "success": False,
                        "error": f"API error: {response.status_code}"
                    }
        except Exception as e:
            logger.error(f"Budget check failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def request_authorization(
        self,
        user_id: str,
        amount: float,
        merchant: str,
        description: str,
        category: str = "general"
    ) -> dict:
        """
        Request authorization for a purchase.
        
        Args:
            user_id: The user's ID
            amount: Purchase amount
            merchant: Merchant name (e.g., "starbucks")
            description: Description of the purchase
            category: Purchase category
            
        Returns:
            Authorization result with code if approved
        """
        # Demo mode
        if not self.api_key:
            budget_key = f"{user_id}:{category}"
            budget = self._mock_budgets.get(budget_key, 50.0)
            
            if amount <= budget:
                import os
                auth_code = f"auth_{os.urandom(8).hex()}"
                # Deduct from mock budget for demo
                self._mock_budgets[budget_key] = budget - amount
                
                return {
                    "success": True,
                    "allowed": True,
                    "authorization_code": auth_code,
                    "amount": amount,
                    "merchant": merchant,
                    "remaining_budget": budget - amount
                }
            else:
                return {
                    "success": True,
                    "allowed": False,
                    "reason": f"Amount ${amount} exceeds budget ${budget}",
                    "remaining_budget": budget
                }
        
        # Production mode - call AgentAuth API
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_url}/v1/authorize",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "user_id": user_id,
                        "transaction": {
                            "amount": amount,
                            "currency": "USD",
                            "merchant_id": merchant,
                            "description": description,
                            "category": category
                        }
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "allowed": data.get("decision") == "ALLOW",
                        "authorization_code": data.get("authorization_code"),
                        "reason": data.get("reason"),
                        "amount": amount,
                        "merchant": merchant
                    }
                else:
                    return {
                        "success": False,
                        "error": f"API error: {response.status_code}"
                    }
        except Exception as e:
            logger.error(f"Authorization request failed: {e}")
            return {"success": False, "error": str(e)}
    
    async def log_transaction(
        self,
        user_id: str,
        authorization_code: str,
        amount: float,
        merchant: str,
        order_id: str,
        status: str = "completed"
    ) -> dict:
        """
        Log a completed transaction for audit.
        
        Args:
            user_id: The user's ID
            authorization_code: The authorization code used
            amount: Final transaction amount
            merchant: Merchant name
            order_id: Order ID from the merchant
            status: Transaction status
            
        Returns:
            Confirmation of logged transaction
        """
        logger.info(f"Transaction logged: user={user_id}, merchant={merchant}, "
                   f"amount=${amount}, order={order_id}")
        
        return {
            "success": True,
            "logged": True,
            "transaction_id": f"txn_{os.urandom(8).hex()}",
            "user_id": user_id,
            "authorization_code": authorization_code,
            "amount": amount,
            "merchant": merchant,
            "order_id": order_id,
            "status": status
        }
    
    async def get_spending_summary(self, user_id: str, period: str = "today") -> dict:
        """
        Get spending summary for a user.
        
        Args:
            user_id: The user's ID
            period: Time period ("today", "week", "month")
            
        Returns:
            Spending summary with totals by category
        """
        # Demo mode
        return {
            "success": True,
            "user_id": user_id,
            "period": period,
            "total_spent": 15.50,
            "by_category": {
                "coffee": 8.50,
                "food": 7.00
            },
            "transaction_count": 2
        }
