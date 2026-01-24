"""
AgentBuy - Voice Payment Demo Agent

A focused demo agent that processes voice commands for payments.
Uses AgentAuth for authorization and Stripe for payment execution.
"""
import asyncio
import logging
import os
from typing import Optional

from openai import AsyncOpenAI
import httpx

from src.tools.payments import StripePaymentTools
from src.tools.auth import AgentAuthTools

logger = logging.getLogger(__name__)


class PaymentDemoAgent:
    """
    Demo agent for voice-to-payment flow.
    
    Flow:
    1. Parse voice/text command
    2. Extract payment intent (amount, merchant)
    3. Request AgentAuth authorization
    4. Execute Stripe payment
    5. Log transaction
    """
    
    def __init__(
        self,
        openai_api_key: str = None,
        agentauth_url: str = None,
        agentauth_key: str = None,
        stripe_key: str = None
    ):
        # OpenAI for intent parsing
        api_key = openai_api_key or os.getenv("OPENAI_API_KEY")
        self.llm = AsyncOpenAI(api_key=api_key) if api_key else None
        
        # AgentAuth for authorization
        self.agentauth_url = agentauth_url or os.getenv("AGENTAUTH_API_URL", "http://localhost:8000")
        self.agentauth_key = agentauth_key or os.getenv("AGENTAUTH_API_KEY")
        self.auth_tools = AgentAuthTools(api_url=self.agentauth_url, api_key=self.agentauth_key)
        
        # Stripe for payments
        self.stripe = StripePaymentTools(api_key=stripe_key)
    
    async def parse_payment_intent(self, text: str) -> dict:
        """Parse payment intent from text using GPT-4."""
        if not self.llm:
            # Demo fallback parsing
            return self._demo_parse(text)
        
        try:
            response = await self.llm.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": """Extract payment intent from user message.
Return JSON with:
- action: "pay" or "subscribe" or "unknown"
- amount: number (in dollars)
- merchant: string (company/service name)
- description: string (what the payment is for)
- category: "saas" | "food" | "ecommerce" | "travel" | "other"

Examples:
"Pay $10 for Notion" -> {"action":"pay","amount":10,"merchant":"Notion","description":"Notion subscription","category":"saas"}
"Buy lunch from DoorDash for $25" -> {"action":"pay","amount":25,"merchant":"DoorDash","description":"Food order","category":"food"}"""
                    },
                    {"role": "user", "content": text}
                ],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            
            import json
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Intent parsing failed: {e}")
            return {"action": "unknown", "error": str(e)}
    
    def _demo_parse(self, text: str) -> dict:
        """Simple keyword-based parsing for demo."""
        text_lower = text.lower()
        
        # Extract amount (look for $XX or XX dollars)
        import re
        amount_match = re.search(r'\$?(\d+(?:\.\d{2})?)', text)
        amount = float(amount_match.group(1)) if amount_match else 10.0
        
        # Detect merchant
        merchants = {
            "notion": ("Notion", "saas"),
            "digitalocean": ("DigitalOcean", "saas"),
            "doordash": ("DoorDash", "food"),
            "uber": ("Uber", "travel"),
            "amazon": ("Amazon", "ecommerce"),
            "starbucks": ("Starbucks", "food"),
            "spotify": ("Spotify", "saas"),
            "netflix": ("Netflix", "saas"),
        }
        
        merchant_name = "Unknown Merchant"
        category = "other"
        
        for key, (name, cat) in merchants.items():
            if key in text_lower:
                merchant_name = name
                category = cat
                break
        
        return {
            "action": "pay",
            "amount": amount,
            "merchant": merchant_name,
            "description": f"Payment to {merchant_name}",
            "category": category
        }
    
    async def process_voice_command(
        self,
        audio_bytes: bytes = None,
        text: str = None,
        user_id: str = "demo_user"
    ) -> dict:
        """
        Process a voice or text command for payment.
        
        Args:
            audio_bytes: Raw audio data (will be transcribed)
            text: Text command (if no audio)
            user_id: User ID for authorization
            
        Returns:
            Complete payment result with authorization and payment details
        """
        # Step 1: Transcribe audio if provided
        if audio_bytes and self.llm:
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
                text = transcript.text
                logger.info(f"Transcribed: {text}")
            finally:
                os.unlink(temp_path)
        
        if not text:
            return {"success": False, "error": "No input provided"}
        
        # Step 2: Parse payment intent
        intent = await self.parse_payment_intent(text)
        logger.info(f"Parsed intent: {intent}")
        
        if intent.get("action") == "unknown":
            return {
                "success": False,
                "error": "Could not understand payment request",
                "parsed": intent
            }
        
        amount = intent.get("amount", 0)
        merchant = intent.get("merchant", "Unknown")
        category = intent.get("category", "other")
        description = intent.get("description", f"Payment to {merchant}")
        
        # Step 3: Request AgentAuth authorization
        logger.info(f"Requesting authorization for ${amount} to {merchant}")
        
        auth_result = await self.auth_tools.request_authorization(
            user_id=user_id,
            amount=amount,
            merchant=merchant,
            description=description,
            category=category
        )
        
        if not auth_result.get("allowed"):
            return {
                "success": False,
                "step": "authorization",
                "error": auth_result.get("reason", "Not authorized"),
                "amount": amount,
                "merchant": merchant,
                "message": f"Payment of ${amount:.2f} to {merchant} was DENIED: {auth_result.get('reason', 'Over budget')}"
            }
        
        auth_code = auth_result.get("authorization_code")
        logger.info(f"Authorized: {auth_code}")
        
        # Step 4: Process Stripe payment
        payment_result = await self.stripe.process_payment(
            amount=amount,
            merchant_name=merchant,
            description=description,
            authorization_code=auth_code
        )
        
        if not payment_result.get("success"):
            return {
                "success": False,
                "step": "payment",
                "error": payment_result.get("error"),
                "authorization_code": auth_code
            }
        
        # Step 5: Log transaction
        await self.auth_tools.log_transaction(
            user_id=user_id,
            authorization_code=auth_code,
            amount=amount,
            merchant=merchant,
            order_id=payment_result.get("payment_id"),
            status="completed"
        )
        
        return {
            "success": True,
            "message": f"✅ Paid ${amount:.2f} to {merchant}",
            "amount": amount,
            "merchant": merchant,
            "authorization_code": auth_code,
            "payment_id": payment_result.get("payment_id"),
            "receipt_url": payment_result.get("receipt_url"),
            "steps": [
                f"1. Parsed: '{text}' → ${amount} to {merchant}",
                f"2. AgentAuth: AUTHORIZED ({auth_code[:20]}...)",
                f"3. Stripe: Payment processed",
                f"4. Transaction logged"
            ]
        }


async def demo():
    """Run a quick demo of the payment agent."""
    logging.basicConfig(level=logging.INFO)
    
    print("\n" + "="*60)
    print("💳 VOICE PAYMENT DEMO")
    print("="*60 + "\n")
    
    agent = PaymentDemoAgent()
    
    # Test commands
    commands = [
        "Pay $10 for my Notion subscription",
        "Buy lunch from DoorDash for $25",
        "Pay $500 for something expensive",  # Should be denied
    ]
    
    for cmd in commands:
        print(f"\n🎤 Command: \"{cmd}\"")
        print("-"*50)
        
        result = await agent.process_voice_command(text=cmd, user_id="demo_user")
        
        if result.get("success"):
            print(f"✅ {result.get('message')}")
            for step in result.get("steps", []):
                print(f"   {step}")
        else:
            print(f"❌ {result.get('message', result.get('error'))}")
        
        await asyncio.sleep(0.5)
    
    print("\n" + "="*60)
    print("✨ DEMO COMPLETE")
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(demo())
