"""
AgentBuy - Starbucks Connector

Integration with Starbucks mobile ordering.
Uses browser automation as primary method with API fallback.
"""
import asyncio
import logging
import re
import uuid
from datetime import datetime, timedelta
from typing import Optional

from playwright.async_api import async_playwright, Browser, Page

from .base import PlatformConnector, Item, Order, OrderStatus, OrderStatusEnum

logger = logging.getLogger(__name__)


# Starbucks menu items with normalized names and typical prices
STARBUCKS_MENU = {
    "iced caramel macchiato": {"base_price": 5.75, "sizes": {"tall": 0, "grande": 0.50, "venti": 1.00}},
    "iced latte": {"base_price": 4.75, "sizes": {"tall": 0, "grande": 0.50, "venti": 1.00}},
    "caffe latte": {"base_price": 4.25, "sizes": {"tall": 0, "grande": 0.50, "venti": 1.00}},
    "cappuccino": {"base_price": 4.25, "sizes": {"tall": 0, "grande": 0.50, "venti": 1.00}},
    "caramel frappuccino": {"base_price": 5.25, "sizes": {"tall": 0, "grande": 0.80, "venti": 1.30}},
    "pike place": {"base_price": 2.75, "sizes": {"tall": 0, "grande": 0.30, "venti": 0.60}},
    "cold brew": {"base_price": 4.25, "sizes": {"tall": 0, "grande": 0.50, "venti": 1.00, "trenta": 1.50}},
    "nitro cold brew": {"base_price": 4.95, "sizes": {"tall": 0, "grande": 0.50}},
    "matcha latte": {"base_price": 5.25, "sizes": {"tall": 0, "grande": 0.50, "venti": 1.00}},
    "chai latte": {"base_price": 4.75, "sizes": {"tall": 0, "grande": 0.50, "venti": 1.00}},
}


class StarbucksConnector(PlatformConnector):
    """
    Starbucks mobile ordering connector.
    
    Uses Playwright for browser automation to place orders.
    """
    
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.authenticated = False
        self.orders: dict[str, Order] = {}
    
    @property
    def platform_id(self) -> str:
        return "starbucks"
    
    @property
    def platform_name(self) -> str:
        return "Starbucks"
    
    async def _ensure_browser(self):
        """Ensure browser is initialized."""
        if not self.browser:
            playwright = await async_playwright().start()
            self.browser = await playwright.chromium.launch(headless=True)
            self.page = await self.browser.new_page()
    
    async def authenticate(self, credentials: dict) -> bool:
        """
        Authenticate with Starbucks account.
        
        Args:
            credentials: {"email": "...", "password": "..."}
        """
        await self._ensure_browser()
        
        try:
            # Navigate to Starbucks login
            await self.page.goto("https://www.starbucks.com/account/signin")
            await self.page.wait_for_load_state("networkidle")
            
            # Fill in credentials
            await self.page.fill('input[name="username"]', credentials["email"])
            await self.page.fill('input[name="password"]', credentials["password"])
            
            # Submit
            await self.page.click('button[type="submit"]')
            await self.page.wait_for_load_state("networkidle")
            
            # Check if logged in
            self.authenticated = "account" in self.page.url.lower()
            return self.authenticated
            
        except Exception as e:
            logger.error(f"Starbucks authentication failed: {e}")
            return False
    
    async def search_items(self, query: str, **kwargs) -> list[Item]:
        """Search Starbucks menu."""
        query_lower = query.lower()
        results = []
        
        for name, info in STARBUCKS_MENU.items():
            if any(word in name for word in query_lower.split()):
                results.append(Item(
                    name=name.title(),
                    price=info["base_price"],
                    size="grande"  # Default size
                ))
        
        return results
    
    async def estimate_price(self, items: list[dict]) -> float:
        """Estimate total price for items."""
        total = 0.0
        
        for item in items:
            name = item.get("name", "").lower()
            size = item.get("size", "grande").lower()
            quantity = item.get("quantity", 1)
            
            # Find matching menu item
            for menu_name, info in STARBUCKS_MENU.items():
                if self._fuzzy_match(name, menu_name):
                    base = info["base_price"]
                    size_upcharge = info["sizes"].get(size, 0.50)
                    total += (base + size_upcharge) * quantity
                    break
            else:
                # Default price if not found
                total += 5.50 * quantity
        
        # Add estimated tax
        total *= 1.08
        return round(total, 2)
    
    def _fuzzy_match(self, query: str, target: str) -> bool:
        """Check if query matches target (fuzzy)."""
        query_words = set(query.lower().split())
        target_words = set(target.lower().split())
        return len(query_words & target_words) > 0
    
    async def create_order(
        self,
        items: list[dict],
        authorization_code: str,
        delivery: bool = False,
        location: Optional[str] = None,
        special_instructions: Optional[str] = None
    ) -> Order:
        """
        Create a Starbucks order.
        
        For MVP, simulates order creation. Production would use browser automation.
        """
        order_id = f"sbux_{uuid.uuid4().hex[:12]}"
        
        # Build item list
        order_items = []
        total = 0.0
        
        for item_data in items:
            name = item_data.get("name", "Coffee")
            size = item_data.get("size", "grande")
            quantity = item_data.get("quantity", 1)
            
            # Estimate price
            price = 5.50  # Default
            for menu_name, info in STARBUCKS_MENU.items():
                if self._fuzzy_match(name, menu_name):
                    price = info["base_price"] + info["sizes"].get(size, 0.50)
                    break
            
            order_items.append(Item(
                name=name,
                price=price,
                quantity=quantity,
                size=size,
                customizations=item_data.get("customizations", [])
            ))
            total += price * quantity
        
        # Add tax
        total *= 1.08
        
        order = Order(
            order_id=order_id,
            platform="starbucks",
            items=order_items,
            total_price=round(total, 2),
            status=OrderStatusEnum.CONFIRMED,
            estimated_ready=datetime.utcnow() + timedelta(minutes=10),
            pickup_location=location or "Nearest Starbucks"
        )
        
        self.orders[order_id] = order
        
        logger.info(f"Created Starbucks order {order_id}: {order.summary}")
        
        # In production: Use browser automation to actually place the order
        # await self._place_order_via_browser(order, authorization_code)
        
        return order
    
    async def get_order_status(self, order_id: str) -> OrderStatus:
        """Get order status."""
        order = self.orders.get(order_id)
        
        if not order:
            return OrderStatus(
                order_id=order_id,
                status=OrderStatusEnum.FAILED,
                message="Order not found"
            )
        
        # Simulate order progression
        elapsed = (datetime.utcnow() - order.created_at).total_seconds()
        
        if elapsed < 120:  # 2 minutes
            status = OrderStatusEnum.PREPARING
            message = "Your order is being prepared"
        elif elapsed < 480:  # 8 minutes
            status = OrderStatusEnum.PREPARING
            message = "Almost ready!"
        else:
            status = OrderStatusEnum.READY
            message = "Your order is ready for pickup!"
        
        return OrderStatus(
            order_id=order_id,
            status=status,
            message=message,
            estimated_ready=order.estimated_ready
        )
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an order."""
        if order_id in self.orders:
            order = self.orders[order_id]
            if order.status in [OrderStatusEnum.PENDING, OrderStatusEnum.CONFIRMED]:
                order.status = OrderStatusEnum.CANCELLED
                return True
        return False
    
    async def close(self):
        """Clean up browser resources."""
        if self.browser:
            await self.browser.close()
