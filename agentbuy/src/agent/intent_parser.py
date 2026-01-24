"""
AgentBuy - Intent Parser

Uses GPT-4 to extract structured purchase intent from natural language.
"""
import json
from dataclasses import dataclass
from typing import Optional
from openai import AsyncOpenAI


@dataclass
class ParsedIntent:
    """Structured representation of a purchase intent."""
    action: str  # "purchase", "cancel", "status", "find"
    platform: str  # "starbucks", "doordash", "amazon"
    items: list[dict]  # [{"name": "Iced Latte", "size": "grande", "quantity": 1}]
    delivery: bool
    location: Optional[str] = None
    time_preference: Optional[str] = None  # "now", "in 30 minutes", "for 3pm"
    special_instructions: Optional[str] = None
    raw_text: str = ""
    confidence: float = 0.0


SYSTEM_PROMPT = """You are an intent parser for a purchase agent. Extract structured information from user commands.

Output JSON with these fields:
- action: "purchase" | "cancel" | "status" | "find" | "unknown"
- platform: lowercase platform name (starbucks, doordash, amazon, etc.) or "unknown"
- items: array of {name, size, quantity, customizations}
- delivery: boolean (true if delivery, false if pickup)
- location: optional store/address preference
- time_preference: optional timing ("now", "asap", "in X minutes", specific time)
- special_instructions: any special requests
- confidence: 0.0-1.0 how confident you are in the parsing

For Starbucks, normalize drink sizes to: "tall", "grande", "venti", "trenta"

Examples:
"Buy me a large iced caramel macchiato" → platform: starbucks, items: [{name: "Iced Caramel Macchiato", size: "venti"}]
"Order pizza from DoorDash" → platform: doordash, items: [{name: "pizza"}], delivery: true"""


class IntentParser:
    """Parses natural language into structured purchase intents."""
    
    def __init__(self, openai_client: AsyncOpenAI):
        self.client = openai_client
    
    async def parse(self, text: str) -> ParsedIntent:
        """Parse user text into a structured intent."""
        response = await self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text}
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=500
        )
        
        try:
            data = json.loads(response.choices[0].message.content)
            return ParsedIntent(
                action=data.get("action", "unknown"),
                platform=data.get("platform", "unknown"),
                items=data.get("items", []),
                delivery=data.get("delivery", False),
                location=data.get("location"),
                time_preference=data.get("time_preference"),
                special_instructions=data.get("special_instructions"),
                raw_text=text,
                confidence=data.get("confidence", 0.5)
            )
        except (json.JSONDecodeError, KeyError) as e:
            return ParsedIntent(
                action="unknown",
                platform="unknown",
                items=[],
                delivery=False,
                raw_text=text,
                confidence=0.0
            )
