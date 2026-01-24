"""
AgentBuy - Base Platform Connector

Abstract interface for all platform integrations.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional


class OrderStatusEnum(Enum):
    """Possible order statuses."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    FAILED = "failed"


@dataclass
class Item:
    """Represents an item to purchase."""
    name: str
    price: float = 0.0
    quantity: int = 1
    size: Optional[str] = None
    customizations: list[str] = field(default_factory=list)
    
    @property
    def total_price(self) -> float:
        return self.price * self.quantity


@dataclass
class Order:
    """Represents a placed order."""
    order_id: str
    platform: str
    items: list[Item]
    total_price: float
    status: OrderStatusEnum = OrderStatusEnum.PENDING
    created_at: datetime = field(default_factory=datetime.utcnow)
    estimated_ready: Optional[datetime] = None
    pickup_location: Optional[str] = None
    tracking_url: Optional[str] = None
    
    @property
    def summary(self) -> str:
        item_names = ", ".join(i.name for i in self.items)
        return f"{item_names} from {self.platform} - ${self.total_price:.2f}"


@dataclass
class OrderStatus:
    """Status update for an order."""
    order_id: str
    status: OrderStatusEnum
    message: str
    updated_at: datetime = field(default_factory=datetime.utcnow)
    estimated_ready: Optional[datetime] = None


class PlatformConnector(ABC):
    """
    Abstract base class for platform integrations.
    
    Each platform (Starbucks, DoorDash, Amazon, etc.) implements this interface.
    """
    
    @property
    @abstractmethod
    def platform_id(self) -> str:
        """Unique identifier for this platform."""
        pass
    
    @property
    @abstractmethod
    def platform_name(self) -> str:
        """Human-readable platform name."""
        pass
    
    @abstractmethod
    async def authenticate(self, credentials: dict) -> bool:
        """
        Authenticate with the platform.
        
        Args:
            credentials: Platform-specific credentials
            
        Returns:
            True if authentication successful
        """
        pass
    
    @abstractmethod
    async def search_items(self, query: str, **kwargs) -> list[Item]:
        """
        Search for items on the platform.
        
        Args:
            query: Search query
            **kwargs: Platform-specific filters
            
        Returns:
            List of matching items
        """
        pass
    
    @abstractmethod
    async def estimate_price(self, items: list[dict]) -> float:
        """
        Estimate total price for items.
        
        Args:
            items: List of item specifications
            
        Returns:
            Estimated total price
        """
        pass
    
    @abstractmethod
    async def create_order(
        self,
        items: list[dict],
        authorization_code: str,
        delivery: bool = False,
        location: Optional[str] = None,
        special_instructions: Optional[str] = None
    ) -> Order:
        """
        Create and submit an order.
        
        Args:
            items: Items to order
            authorization_code: AgentAuth authorization code
            delivery: Whether to deliver (vs pickup)
            location: Store/delivery location
            special_instructions: Special requests
            
        Returns:
            Created order
        """
        pass
    
    @abstractmethod
    async def get_order_status(self, order_id: str) -> OrderStatus:
        """
        Get current status of an order.
        
        Args:
            order_id: Order identifier
            
        Returns:
            Current order status
        """
        pass
    
    @abstractmethod
    async def cancel_order(self, order_id: str) -> bool:
        """
        Cancel a pending order.
        
        Args:
            order_id: Order to cancel
            
        Returns:
            True if cancellation successful
        """
        pass
