"""
JARVIS - AI Voice Assistant

A JARVIS-style conversational AI for voice-powered purchases.
Combines personality, memory, and real-time payments.
"""
import asyncio
import logging
import os
from datetime import datetime
from typing import Optional

from openai import AsyncOpenAI

from src.tools.payments import StripePaymentTools
from src.tools.auth import AgentAuthTools
from src.memory.memory import MemorySystem

logger = logging.getLogger(__name__)


JARVIS_SYSTEM_PROMPT = """You are JARVIS, an AI assistant for voice-powered purchases and daily tasks.

## Your Personality
- Polite, efficient, and slightly formal but warm
- Occasionally witty with understated humor
- Proactive in offering suggestions
- Address the user respectfully (use "sir" or "ma'am" sparingly, not every sentence)

## Your Capabilities
You can execute these actions via function calls:
1. **process_payment** - Make payments (requires amount, merchant)
2. **check_budget** - Check spending limits
3. **get_preferences** - Recall user preferences
4. **search_nearby** - Find stores/restaurants

## Response Style
- Keep responses conversational, not robotic
- Confirm actions clearly: "Payment of $15 to Spotify completed."
- Offer follow-ups: "Is there anything else you need?"
- Remember context from the conversation

## Examples

User: "Good morning"
JARVIS: "Good morning. I notice it's 8 AM - shall I order your usual coffee from Starbucks?"

User: "Pay $15 for Spotify"
JARVIS: "Processing $15 payment to Spotify... Done. Your subscription is renewed."

User: "What's my budget?"
JARVIS: "You've spent $35 today with $15 remaining in your daily limit."

User: "That's too expensive"
JARVIS: "I understand. That exceeds your daily limit. Would you like me to find a more affordable alternative, or shall I request an override?"

## Current Context
Time: {current_time}
User: {user_id}
Recent activity: {recent_activity}
"""


JARVIS_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "process_payment",
            "description": "Process a payment to a merchant via Stripe. Requires AgentAuth authorization.",
            "parameters": {
                "type": "object",
                "properties": {
                    "amount": {
                        "type": "number",
                        "description": "Payment amount in dollars"
                    },
                    "merchant": {
                        "type": "string",
                        "description": "Merchant or service name (e.g., Spotify, DoorDash)"
                    },
                    "description": {
                        "type": "string",
                        "description": "Brief description of the payment"
                    }
                },
                "required": ["amount", "merchant"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_budget",
            "description": "Check the user's remaining spending budget",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "description": "Budget category (e.g., coffee, food, saas)"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_user_preferences",
            "description": "Get saved user preferences for a category",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "description": "Preference category (e.g., coffee, food)"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "place_usual_order",
            "description": "Place the user's usual/default order for a category",
            "parameters": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "description": "Order category (e.g., coffee, lunch)"
                    }
                },
                "required": ["category"]
            }
        }
    }
]


class JarvisAssistant:
    """
    JARVIS - Voice-powered AI assistant.
    
    Features:
    - Natural conversation with personality
    - Memory for preferences and context
    - Payment execution via AgentAuth + Stripe
    - Proactive suggestions
    """
    
    def __init__(
        self,
        openai_api_key: str = None,
        user_id: str = "default_user"
    ):
        # Initialize OpenAI
        api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.llm = AsyncOpenAI(api_key=api_key) if api_key else None
        
        # Initialize tools
        self.payments = StripePaymentTools()
        self.auth = AgentAuthTools()
        self.memory = MemorySystem()
        
        # User context
        self.user_id = user_id
        self.conversation_history = []
        
        # Set default preferences
        self._setup_default_preferences()
    
    def _setup_default_preferences(self):
        """Set up default user preferences for demo."""
        self.memory.set_semantic(self.user_id, "coffee", {
            "usual_order": "grande oat milk latte",
            "preferred_store": "Main St Starbucks",
            "price": 6.75
        })
        self.memory.set_semantic(self.user_id, "name", "User")
    
    def _get_system_prompt(self) -> str:
        """Build the system prompt with current context."""
        # Get recent activity
        recent = self.memory.search_episodic("order", limit=3)
        recent_str = ", ".join([m.content[:50] for m in recent]) if recent else "No recent activity"
        
        return JARVIS_SYSTEM_PROMPT.format(
            current_time=datetime.now().strftime("%I:%M %p, %A"),
            user_id=self.user_id,
            recent_activity=recent_str
        )
    
    async def _execute_function(self, name: str, args: dict) -> str:
        """Execute a tool function and return result."""
        logger.info(f"JARVIS executing: {name}({args})")
        
        if name == "process_payment":
            # AgentAuth + Stripe payment
            auth_result = await self.auth.request_authorization(
                user_id=self.user_id,
                amount=args["amount"],
                merchant=args["merchant"],
                description=args.get("description", f"Payment to {args['merchant']}"),
                category="general"
            )
            
            if not auth_result.get("allowed"):
                return f"Payment denied: {auth_result.get('reason', 'Over budget')}"
            
            payment_result = await self.payments.process_payment(
                amount=args["amount"],
                merchant_name=args["merchant"],
                description=args.get("description"),
                authorization_code=auth_result.get("authorization_code")
            )
            
            if payment_result.get("success"):
                # Remember this order
                self.memory.remember_order(self.user_id, {
                    "merchant": args["merchant"],
                    "amount": args["amount"],
                    "time": datetime.now().isoformat()
                })
                return f"Payment successful. ${args['amount']:.2f} to {args['merchant']}. Payment ID: {payment_result.get('payment_id')}"
            else:
                return f"Payment failed: {payment_result.get('error')}"
        
        elif name == "check_budget":
            category = args.get("category", "general")
            budget = await self.auth.check_budget(self.user_id, category)
            return f"Budget for {category}: ${budget.get('remaining', 50):.2f} remaining of ${budget.get('budget_limit', 50):.2f}"
        
        elif name == "get_user_preferences":
            category = args.get("category", "general")
            prefs = self.memory.get_semantic(self.user_id, category)
            if prefs:
                return f"Preferences for {category}: {prefs}"
            return f"No saved preferences for {category}"
        
        elif name == "place_usual_order":
            category = args.get("category", "coffee")
            prefs = self.memory.get_semantic(self.user_id, category)
            
            if not prefs:
                return f"I don't have a usual order saved for {category}"
            
            # Execute the usual order
            return await self._execute_function("process_payment", {
                "amount": prefs.get("price", 10),
                "merchant": prefs.get("preferred_store", category.title()),
                "description": prefs.get("usual_order", f"Usual {category} order")
            })
        
        return f"Unknown function: {name}"
    
    async def chat(self, user_message: str) -> str:
        """
        Process a user message and return JARVIS's response.
        
        Args:
            user_message: The user's text (or transcribed voice)
            
        Returns:
            JARVIS's response text
        """
        if not self.llm:
            return "I apologize, but I'm not fully initialized. Please check the OpenAI API key."
        
        # Add to conversation history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })
        
        # Build messages with system prompt
        messages = [
            {"role": "system", "content": self._get_system_prompt()}
        ] + self.conversation_history[-10:]  # Keep last 10 messages
        
        try:
            # First call - may include tool calls
            response = await self.llm.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                tools=JARVIS_TOOLS,
                tool_choice="auto",
                temperature=0.7
            )
            
            assistant_message = response.choices[0].message
            
            # Check for tool calls
            if assistant_message.tool_calls:
                # Execute each tool call
                tool_results = []
                for tool_call in assistant_message.tool_calls:
                    import json
                    args = json.loads(tool_call.function.arguments)
                    result = await self._execute_function(
                        tool_call.function.name,
                        args
                    )
                    tool_results.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "content": result
                    })
                
                # Add assistant message and tool results to history
                self.conversation_history.append({
                    "role": "assistant",
                    "content": assistant_message.content,
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments
                            }
                        }
                        for tc in assistant_message.tool_calls
                    ]
                })
                
                for tr in tool_results:
                    self.conversation_history.append(tr)
                
                # Get final response after tool execution
                messages = [
                    {"role": "system", "content": self._get_system_prompt()}
                ] + self.conversation_history[-15:]
                
                final_response = await self.llm.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                    temperature=0.7
                )
                
                final_text = final_response.choices[0].message.content
                self.conversation_history.append({
                    "role": "assistant",
                    "content": final_text
                })
                
                return final_text
            
            else:
                # No tool calls, just return the response
                response_text = assistant_message.content
                self.conversation_history.append({
                    "role": "assistant",
                    "content": response_text
                })
                return response_text
        
        except Exception as e:
            logger.error(f"JARVIS error: {e}")
            return f"I apologize, I encountered an error: {str(e)}"
    
    async def transcribe_and_chat(self, audio_bytes: bytes) -> str:
        """
        Transcribe audio and respond.
        
        Args:
            audio_bytes: Raw audio data
            
        Returns:
            JARVIS's response text
        """
        if not self.llm:
            return "Voice processing unavailable."
        
        # Transcribe with Whisper
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
            f.write(audio_bytes)
            temp_path = f.name
        
        try:
            with open(temp_path, "rb") as audio_file:
                transcript = await self.llm.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
            
            user_text = transcript.text
            logger.info(f"Transcribed: {user_text}")
            
            return await self.chat(user_text)
        finally:
            os.unlink(temp_path)
    
    def reset_conversation(self):
        """Clear conversation history."""
        self.conversation_history = []


async def demo():
    """Interactive JARVIS demo."""
    print("\n" + "="*60)
    print("  🤖 JARVIS - AI Voice Assistant")
    print("  Type 'quit' to exit, 'reset' to clear history")
    print("="*60 + "\n")
    
    jarvis = JarvisAssistant()
    
    while True:
        try:
            user_input = input("You: ").strip()
            
            if user_input.lower() == 'quit':
                print("\nJARVIS: Goodbye. Have a pleasant day.")
                break
            elif user_input.lower() == 'reset':
                jarvis.reset_conversation()
                print("\nJARVIS: Conversation history cleared.\n")
                continue
            elif not user_input:
                continue
            
            response = await jarvis.chat(user_input)
            print(f"\nJARVIS: {response}\n")
            
        except KeyboardInterrupt:
            print("\n\nJARVIS: Session terminated.")
            break


if __name__ == "__main__":
    asyncio.run(demo())
