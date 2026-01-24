"""
AgentBuy - Main Agent

The primary agent that combines the brain (reasoning) with tools.
"""
import logging
import os
from typing import Optional

from openai import AsyncOpenAI

from src.brain.reasoning import ReActEngine, AgentContext
from src.tools.browser import BrowserTools
from src.tools.auth import AgentAuthTools
from src.tools.context import ContextTools
from src.connectors.starbucks import StarbucksConnector

logger = logging.getLogger(__name__)


class PurchaseAgent:
    """
    The main AI Purchase Agent.
    
    Combines:
    - ReAct reasoning engine for decision making
    - Browser tools for web automation
    - AgentAuth tools for authorization
    - Context tools for user information
    - Platform connectors for specific integrations
    """
    
    def __init__(
        self,
        openai_api_key: str = None,
        agentauth_api_key: str = None,
        headless: bool = True
    ):
        # Initialize OpenAI client
        api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.llm = AsyncOpenAI(api_key=api_key) if api_key else None
        
        # Initialize tools
        self.browser = BrowserTools(vision_client=self.llm, headless=headless)
        self.auth = AgentAuthTools(api_key=agentauth_api_key)
        self.context = ContextTools()
        self.starbucks = StarbucksConnector()
        
        # Build tool registry
        self.tools = self._build_tool_registry()
        
        # Initialize reasoning engine
        if self.llm:
            self.brain = ReActEngine(
                llm_client=self.llm,
                tools=self.tools,
                model="gpt-4o"
            )
        else:
            self.brain = None
            logger.warning("No OpenAI API key - agent will run in demo mode")
    
    def _build_tool_registry(self) -> dict:
        """Build the registry of all available tools."""
        return {
            # Browser tools
            "browser_navigate": self.browser.navigate,
            "browser_click": self.browser.click,
            "browser_type": self.browser.type_text,
            "browser_screenshot": self.browser.screenshot,
            "browser_analyze_page": self.browser.analyze_page,
            "browser_get_text": self.browser.get_page_text,
            "browser_scroll": self.browser.scroll,
            "browser_wait": self.browser.wait_for,
            
            # Auth tools
            "auth_check_budget": self.auth.check_budget,
            "auth_request_authorization": self.auth.request_authorization,
            "auth_log_transaction": self.auth.log_transaction,
            "auth_get_spending_summary": self.auth.get_spending_summary,
            
            # Context tools
            "get_user_preferences": self.context.get_user_preferences,
            "get_user_location": self.context.get_user_location,
            "search_nearby": self.context.search_nearby,
            "get_current_time": self.context.get_current_time,
            "ask_user": self.context.ask_user,
            
            # Starbucks-specific tools
            "starbucks_search_menu": self.starbucks.search_items,
            "starbucks_estimate_price": self.starbucks.estimate_price,
            "starbucks_place_order": self._starbucks_order_wrapper,
            "starbucks_get_order_status": self.starbucks.get_order_status,
        }
    
    async def _starbucks_order_wrapper(
        self,
        items: list,
        authorization_code: str,
        location: str = None
    ) -> dict:
        """Wrapper for Starbucks order placement."""
        try:
            order = await self.starbucks.create_order(
                items=items,
                authorization_code=authorization_code,
                delivery=False,
                location=location
            )
            return {
                "success": True,
                "order_id": order.order_id,
                "total": order.total_price,
                "status": order.status.value,
                "pickup_location": order.pickup_location,
                "estimated_ready": order.estimated_ready.isoformat() if order.estimated_ready else None
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def execute(self, command: str, user_id: str) -> dict:
        """
        Execute a user command using the full agentic loop.
        
        Args:
            command: Natural language command from user
            user_id: The user's ID for authorization
            
        Returns:
            Result of the agent's execution including reasoning trace
        """
        if not self.brain:
            # Demo mode without LLM
            return await self._demo_execute(command, user_id)
        
        logger.info(f"Agent executing: {command}")
        
        # Run the ReAct loop
        result = await self.brain.run(
            goal=command,
            user_id=user_id
        )
        
        return result
    
    async def _demo_execute(self, command: str, user_id: str) -> dict:
        """Demo execution without full LLM reasoning."""
        command_lower = command.lower()
        
        # Simple keyword matching for demo
        if any(word in command_lower for word in ["coffee", "latte", "starbucks"]):
            # Check budget
            budget = await self.auth.check_budget(user_id, "coffee", 10.0)
            
            if not budget.get("allowed", False):
                return {
                    "success": False,
                    "error": "Over budget",
                    "trace": ["Checked budget: denied"]
                }
            
            # Get auth
            auth = await self.auth.request_authorization(
                user_id=user_id,
                amount=6.75,
                merchant="starbucks",
                description="Coffee order",
                category="coffee"
            )
            
            if not auth.get("allowed", False):
                return {
                    "success": False,
                    "error": auth.get("reason", "Not authorized"),
                    "trace": ["Authorization denied"]
                }
            
            # Place order
            order_result = await self._starbucks_order_wrapper(
                items=[{"name": "Iced Latte", "size": "grande", "quantity": 1}],
                authorization_code=auth.get("authorization_code"),
                location="Main St Starbucks"
            )
            
            return {
                "success": True,
                "result": f"Order placed! {order_result}",
                "order": order_result,
                "trace": [
                    "Checked budget: approved",
                    f"Requested authorization: {auth.get('authorization_code')}",
                    f"Placed order: {order_result.get('order_id')}"
                ]
            }
        
        return {
            "success": False,
            "error": "Demo mode: Only coffee orders supported",
            "trace": ["No matching intent found"]
        }
    
    async def close(self):
        """Clean up resources."""
        await self.browser.close()
        await self.starbucks.close()
