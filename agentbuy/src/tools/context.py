"""
AgentBuy - Context Tools

Tools for accessing user context, location, and preferences.
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


class ContextTools:
    """
    Tools for accessing contextual information about the user and environment.
    """
    
    def __init__(self, user_preferences: dict = None):
        self.preferences = user_preferences or {}
        self._location_cache: dict[str, dict] = {}
    
    async def get_user_preferences(self, user_id: str, category: str = None) -> dict:
        """
        Get user preferences for purchases.
        
        Args:
            user_id: The user's ID
            category: Optional category to filter preferences
            
        Returns:
            User preferences including default orders, dietary restrictions, etc.
        """
        # Demo preferences
        prefs = {
            "user_id": user_id,
            "coffee": {
                "default_size": "grande",
                "default_drink": "iced oat milk latte",
                "customizations": ["extra shot"],
                "preferred_store": "Main St Starbucks"
            },
            "food": {
                "dietary_restrictions": [],
                "cuisine_preferences": ["italian", "mexican", "asian"],
                "spice_level": "medium"
            },
            "general": {
                "budget_alerts": True,
                "confirmation_required_above": 25.0,
                "preferred_payment": "default_card"
            }
        }
        
        if category and category in prefs:
            return {"success": True, "preferences": prefs[category]}
        
        return {"success": True, "preferences": prefs}
    
    async def get_user_location(self, user_id: str) -> dict:
        """
        Get user's current or saved location.
        
        Args:
            user_id: The user's ID
            
        Returns:
            Location information including coordinates and address
        """
        # Demo location
        return {
            "success": True,
            "user_id": user_id,
            "location": {
                "latitude": 37.7749,
                "longitude": -122.4194,
                "address": "123 Main St, San Francisco, CA 94105",
                "city": "San Francisco",
                "state": "CA"
            },
            "source": "saved"  # or "gps"
        }
    
    async def search_nearby(
        self,
        query: str,
        location: dict = None,
        radius_miles: float = 2.0
    ) -> dict:
        """
        Search for stores/restaurants near a location.
        
        Args:
            query: What to search for (e.g., "Starbucks", "pizza")
            location: Optional location dict, uses user's location if not provided
            radius_miles: Search radius in miles
            
        Returns:
            List of nearby matching locations
        """
        # Demo results for Starbucks search
        if "starbucks" in query.lower() or "coffee" in query.lower():
            return {
                "success": True,
                "query": query,
                "results": [
                    {
                        "name": "Starbucks - Main St",
                        "address": "100 Main St, San Francisco, CA",
                        "distance_miles": 0.2,
                        "rating": 4.3,
                        "wait_time_estimate": "5-8 min",
                        "store_id": "sbux_main_st"
                    },
                    {
                        "name": "Starbucks - Market St",
                        "address": "200 Market St, San Francisco, CA",
                        "distance_miles": 0.5,
                        "rating": 4.1,
                        "wait_time_estimate": "3-5 min",
                        "store_id": "sbux_market_st"
                    }
                ]
            }
        
        return {
            "success": True,
            "query": query,
            "results": []
        }
    
    async def get_current_time(self) -> dict:
        """
        Get the current time and date.
        
        Returns:
            Current time information
        """
        from datetime import datetime
        now = datetime.now()
        
        return {
            "success": True,
            "datetime": now.isoformat(),
            "time": now.strftime("%H:%M"),
            "date": now.strftime("%Y-%m-%d"),
            "day_of_week": now.strftime("%A"),
            "is_business_hours": 6 <= now.hour <= 22
        }
    
    async def ask_user(self, question: str) -> dict:
        """
        Ask the user for clarification or confirmation.
        
        Args:
            question: The question to ask the user
            
        Returns:
            Placeholder for user response (in real implementation, this would trigger UI)
        """
        logger.info(f"Asking user: {question}")
        
        # In real implementation, this would trigger a notification/prompt to the user
        return {
            "success": True,
            "question_asked": question,
            "waiting_for_response": True,
            "timeout_seconds": 60
        }
