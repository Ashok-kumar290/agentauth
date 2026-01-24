"""
AgentBuy - Agent Orchestrator

Main orchestration logic that coordinates intent parsing, authorization, and execution.
"""
import logging
from dataclasses import dataclass
from typing import Optional
from openai import AsyncOpenAI

from .intent_parser import IntentParser, ParsedIntent
from ..connectors.base import PlatformConnector, Order, OrderStatus

logger = logging.getLogger(__name__)


@dataclass
class ExecutionResult:
    """Result of an agent execution."""
    success: bool
    order: Optional[Order] = None
    message: str = ""
    authorization_code: Optional[str] = None
    error: Optional[str] = None


class AgentOrchestrator:
    """
    Main agent that orchestrates the purchase flow:
    1. Parse user intent
    2. Check authorization via AgentAuth
    3. Execute via platform connector
    4. Track order status
    """
    
    def __init__(
        self,
        openai_client: AsyncOpenAI,
        agentauth_client,  # AgentAuthClient
        connectors: dict[str, PlatformConnector]
    ):
        self.intent_parser = IntentParser(openai_client)
        self.agentauth = agentauth_client
        self.connectors = connectors
        self.pending_orders: dict[str, Order] = {}
    
    async def execute_command(
        self,
        text: str,
        user_id: str,
        delegation_token: str
    ) -> ExecutionResult:
        """
        Execute a user command end-to-end.
        
        Args:
            text: Natural language command
            user_id: User identifier
            delegation_token: AgentAuth delegation token for this user
            
        Returns:
            ExecutionResult with order details or error
        """
        # Step 1: Parse the intent
        logger.info(f"Parsing command: {text[:50]}...")
        intent = await self.intent_parser.parse(text)
        
        if intent.action == "unknown" or intent.confidence < 0.5:
            return ExecutionResult(
                success=False,
                message="I couldn't understand that command. Could you rephrase?",
                error="intent_parse_failed"
            )
        
        # Step 2: Get the appropriate connector
        connector = self.connectors.get(intent.platform)
        if not connector:
            return ExecutionResult(
                success=False,
                message=f"Sorry, I don't support {intent.platform} yet.",
                error="platform_not_supported"
            )
        
        # Step 3: Estimate price and request authorization
        try:
            estimated_price = await connector.estimate_price(intent.items)
        except Exception as e:
            logger.error(f"Price estimation failed: {e}")
            estimated_price = 20.0  # Default estimate for coffee
        
        logger.info(f"Requesting authorization for ${estimated_price}")
        auth_response = await self.agentauth.authorize(
            delegation_token=delegation_token,
            amount=estimated_price,
            currency="USD",
            merchant_id=intent.platform
        )
        
        if auth_response.decision != "ALLOW":
            return ExecutionResult(
                success=False,
                message=f"Purchase not authorized: {auth_response.reason}",
                error="authorization_denied"
            )
        
        # Step 4: Execute the order
        logger.info(f"Placing order with authorization: {auth_response.authorization_code[:10]}...")
        try:
            order = await connector.create_order(
                items=intent.items,
                authorization_code=auth_response.authorization_code,
                delivery=intent.delivery,
                location=intent.location,
                special_instructions=intent.special_instructions
            )
            
            self.pending_orders[order.order_id] = order
            
            return ExecutionResult(
                success=True,
                order=order,
                message=f"Order placed! {order.summary}",
                authorization_code=auth_response.authorization_code
            )
            
        except Exception as e:
            logger.error(f"Order execution failed: {e}")
            return ExecutionResult(
                success=False,
                message=f"Failed to place order: {str(e)}",
                error="execution_failed"
            )
    
    async def get_order_status(self, order_id: str) -> Optional[OrderStatus]:
        """Get status of a pending order."""
        order = self.pending_orders.get(order_id)
        if not order:
            return None
        
        connector = self.connectors.get(order.platform)
        if not connector:
            return None
        
        return await connector.get_order_status(order_id)
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel a pending order."""
        order = self.pending_orders.get(order_id)
        if not order:
            return False
        
        connector = self.connectors.get(order.platform)
        if not connector:
            return False
        
        success = await connector.cancel_order(order_id)
        if success:
            del self.pending_orders[order_id]
        
        return success
