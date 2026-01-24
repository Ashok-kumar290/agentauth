"""
AgentBuy - Memory Systems

Memory for user preferences, past interactions, and context.
"""
import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional
import json

logger = logging.getLogger(__name__)


@dataclass
class MemoryItem:
    """A single memory item."""
    content: str
    category: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    metadata: dict = field(default_factory=dict)
    embedding: Optional[list[float]] = None


class MemorySystem:
    """
    Three-tier memory system for the agent.
    
    - Working Memory: Current session context
    - Episodic Memory: Past interactions and orders
    - Semantic Memory: User preferences and facts
    """
    
    def __init__(self):
        # Working memory - current session
        self.working: dict[str, Any] = {}
        
        # Episodic memory - past events (in production, use vector DB)
        self.episodic: list[MemoryItem] = []
        
        # Semantic memory - user facts/preferences
        self.semantic: dict[str, dict] = {}
    
    def set_working(self, key: str, value: Any):
        """Set a value in working memory."""
        self.working[key] = value
    
    def get_working(self, key: str, default: Any = None) -> Any:
        """Get a value from working memory."""
        return self.working.get(key, default)
    
    def clear_working(self):
        """Clear working memory (end of session)."""
        self.working = {}
    
    def add_episodic(self, content: str, category: str, metadata: dict = None):
        """Add an episodic memory."""
        self.episodic.append(MemoryItem(
            content=content,
            category=category,
            metadata=metadata or {}
        ))
    
    def search_episodic(self, query: str, category: str = None, limit: int = 5) -> list[MemoryItem]:
        """
        Search episodic memory.
        In production, this would use vector similarity search.
        """
        results = []
        query_lower = query.lower()
        
        for item in reversed(self.episodic):  # Most recent first
            if category and item.category != category:
                continue
            if query_lower in item.content.lower():
                results.append(item)
                if len(results) >= limit:
                    break
        
        return results
    
    def set_semantic(self, user_id: str, key: str, value: Any):
        """Set a semantic fact about a user."""
        if user_id not in self.semantic:
            self.semantic[user_id] = {}
        self.semantic[user_id][key] = value
    
    def get_semantic(self, user_id: str, key: str = None) -> Any:
        """Get semantic facts about a user."""
        if user_id not in self.semantic:
            return {} if key is None else None
        
        if key is None:
            return self.semantic[user_id]
        return self.semantic[user_id].get(key)
    
    def get_user_context(self, user_id: str) -> dict:
        """Get full context for a user for LLM prompts."""
        context = {
            "working_memory": self.working,
            "preferences": self.get_semantic(user_id),
            "recent_orders": [
                {"content": m.content, "timestamp": m.timestamp.isoformat()}
                for m in self.search_episodic("order", category="order", limit=3)
            ]
        }
        return context
    
    def remember_order(self, user_id: str, order_details: dict):
        """Remember a completed order."""
        self.add_episodic(
            content=json.dumps(order_details),
            category="order",
            metadata={"user_id": user_id}
        )
        
        # Update semantic memory with preference patterns
        if "items" in order_details:
            for item in order_details["items"]:
                item_name = item.get("name", "").lower()
                if "latte" in item_name or "coffee" in item_name:
                    # Track coffee preferences
                    coffee_orders = self.get_semantic(user_id, "coffee_order_count") or 0
                    self.set_semantic(user_id, "coffee_order_count", coffee_orders + 1)
                    self.set_semantic(user_id, "last_coffee_order", item)
