"""
JARVIS Demo Mode - Simulated Conversations

Demonstrates JARVIS interactions without requiring OpenAI API.
Uses pre-scripted responses for demo purposes.
"""
import asyncio
from datetime import datetime
from src.tools.payments import StripePaymentTools
from src.tools.auth import AgentAuthTools
import os


class JarvisDemo:
    """Simulated JARVIS for demo when OpenAI is unavailable."""
    
    def __init__(self):
        self.payments = StripePaymentTools()
        self.auth = AgentAuthTools()
        self.context = {
            "last_action": None,
            "user_name": "User"
        }
    
    async def respond(self, user_input: str) -> dict:
        """Generate a JARVIS-style response with real payment execution."""
        text = user_input.lower()
        
        # Greeting
        if any(word in text for word in ["morning", "hello", "hi", "hey"]):
            hour = datetime.now().hour
            if hour < 12:
                greeting = "Good morning"
            elif hour < 17:
                greeting = "Good afternoon"
            else:
                greeting = "Good evening"
            
            return {
                "response": f"{greeting}. I notice it's {datetime.now().strftime('%I:%M %p')}. "
                           "Shall I order your usual coffee from Starbucks?",
                "action": None
            }
        
        # Coffee/usual order
        if "usual" in text or ("coffee" in text and "order" in text) or "yes please" in text:
            # Execute real payment
            auth = await self.auth.request_authorization(
                user_id="demo_user",
                amount=6.75,
                merchant="Starbucks",
                description="Grande oat milk latte",
                category="coffee"
            )
            
            if auth.get("allowed"):
                payment = await self.payments.process_payment(
                    amount=6.75,
                    merchant_name="Starbucks",
                    authorization_code=auth.get("authorization_code")
                )
                
                if payment.get("success"):
                    return {
                        "response": f"Ordering one grande oat milk latte from Main Street Starbucks. "
                                   f"That's $6.75. Payment authorized and processing. "
                                   f"Your order will be ready in approximately 8 minutes.",
                        "action": "payment",
                        "payment_id": payment.get("payment_id"),
                        "amount": 6.75
                    }
            
            return {
                "response": "I was unable to process the coffee order. It may exceed your budget.",
                "action": "denied"
            }
        
        # Payment requests
        if "pay" in text or "payment" in text or "$" in text:
            import re
            # Extract amount
            amount_match = re.search(r'\$?(\d+(?:\.\d{2})?)', text)
            amount = float(amount_match.group(1)) if amount_match else 10.0
            
            # Extract merchant
            merchants = ["netflix", "spotify", "notion", "doordash", "amazon", "uber"]
            merchant = "Unknown Service"
            for m in merchants:
                if m in text:
                    merchant = m.title()
                    break
            
            # Execute real payment
            auth = await self.auth.request_authorization(
                user_id="demo_user",
                amount=amount,
                merchant=merchant,
                description=f"Payment to {merchant}",
                category="saas"
            )
            
            if auth.get("allowed"):
                payment = await self.payments.process_payment(
                    amount=amount,
                    merchant_name=merchant,
                    authorization_code=auth.get("authorization_code")
                )
                
                if payment.get("success"):
                    return {
                        "response": f"Processing ${amount:.2f} payment to {merchant}... "
                                   f"Done. Payment successful. Your {merchant} subscription is active.",
                        "action": "payment",
                        "payment_id": payment.get("payment_id"),
                        "amount": amount,
                        "merchant": merchant
                    }
            else:
                return {
                    "response": f"I'm afraid that payment of ${amount:.2f} exceeds your spending limit. "
                               f"Would you like me to request an override, or find an alternative?",
                    "action": "denied",
                    "reason": auth.get("reason")
                }
        
        # Budget check
        if "budget" in text or "spending" in text or "limit" in text:
            budget = await self.auth.check_budget("demo_user", "general")
            return {
                "response": f"Your current spending: ${50 - budget.get('remaining', 50):.2f} today. "
                           f"Remaining budget: ${budget.get('remaining', 50):.2f} of your ${budget.get('budget_limit', 50):.2f} daily limit.",
                "action": "budget_check"
            }
        
        # Thank you
        if "thank" in text:
            return {
                "response": "You're most welcome. Is there anything else I can assist you with?",
                "action": None
            }
        
        # Default
        return {
            "response": "I'm ready to help with payments, orders, or checking your spending. "
                       "Just let me know what you need.",
            "action": None
        }


async def run_demo():
    """Run interactive JARVIS demo."""
    print("\n" + "="*65)
    print("  🤖 JARVIS - AI Voice Assistant (Demo Mode)")
    print("  Powered by AgentAuth + Stripe")
    print("="*65)
    print("\n  Try saying:")
    print("    • 'Good morning JARVIS'")
    print("    • 'Pay $15 for Netflix'")
    print("    • 'Order my usual coffee'")
    print("    • 'What's my budget?'")
    print("    • 'quit' to exit")
    print("="*65 + "\n")
    
    jarvis = JarvisDemo()
    
    while True:
        try:
            user_input = input("You: ").strip()
            
            if user_input.lower() == 'quit':
                print("\nJARVIS: Goodbye. Have a pleasant day.\n")
                break
            
            if not user_input:
                continue
            
            result = await jarvis.respond(user_input)
            print(f"\nJARVIS: {result['response']}")
            
            if result.get('payment_id'):
                print(f"        [Payment ID: {result['payment_id']}]")
            
            print()
            
        except KeyboardInterrupt:
            print("\n\nJARVIS: Session terminated.\n")
            break
        except Exception as e:
            print(f"\nJARVIS: I encountered an issue: {e}\n")


async def scripted_demo():
    """Run a scripted demo showing JARVIS capabilities."""
    print("\n" + "="*65)
    print("  🤖 JARVIS - SCRIPTED DEMO")
    print("="*65 + "\n")
    
    jarvis = JarvisDemo()
    
    conversations = [
        "Good morning JARVIS",
        "Yes please, order my usual coffee",
        "Also pay $15 for my Netflix subscription",
        "What's my budget looking like?",
        "Thanks JARVIS"
    ]
    
    for msg in conversations:
        print(f"You: {msg}")
        result = await jarvis.respond(msg)
        print(f"JARVIS: {result['response']}")
        if result.get('payment_id'):
            print(f"        [Payment ID: {result['payment_id']}]")
        print()
        await asyncio.sleep(1)
    
    print("="*65)
    print("  ✨ Demo Complete - Real Stripe payments were processed!")
    print("="*65 + "\n")


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--scripted":
        asyncio.run(scripted_demo())
    else:
        asyncio.run(run_demo())
