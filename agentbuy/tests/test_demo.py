"""
AgentBuy - Quick Demo Test

Tests the intent parser and Starbucks connector without API server.
"""
import asyncio
import os
import sys

# Add src to path for direct execution
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()


async def test_intent_parser():
    """Test the intent parser with sample commands."""
    from src.agent.intent_parser import IntentParser
    
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    parser = IntentParser(client)
    
    test_commands = [
        "Buy me a grande iced caramel macchiato from Starbucks",
        "Get me a venti cold brew with oat milk",
        "Order a tall latte for pickup",
        "I want the cheapest coffee you can find",
    ]
    
    print("\n" + "="*60)
    print("🧠 INTENT PARSER TEST")
    print("="*60)
    
    for cmd in test_commands:
        print(f"\n📝 Command: {cmd}")
        intent = await parser.parse(cmd)
        print(f"   Platform: {intent.platform}")
        print(f"   Items: {intent.items}")
        print(f"   Delivery: {intent.delivery}")
        print(f"   Confidence: {intent.confidence:.2f}")


async def test_starbucks_connector():
    """Test the Starbucks connector."""
    from src.connectors.starbucks import StarbucksConnector
    
    connector = StarbucksConnector()
    
    print("\n" + "="*60)
    print("☕ STARBUCKS CONNECTOR TEST")
    print("="*60)
    
    # Test price estimation
    items = [
        {"name": "Iced Caramel Macchiato", "size": "grande", "quantity": 1},
        {"name": "Cold Brew", "size": "venti", "quantity": 1},
    ]
    
    price = await connector.estimate_price(items)
    print(f"\n💰 Estimated price for {len(items)} items: ${price:.2f}")
    
    # Test order creation (mock)
    order = await connector.create_order(
        items=items,
        authorization_code="test_auth_123",
        delivery=False,
        location="Downtown Starbucks"
    )
    
    print(f"\n📦 Order created:")
    print(f"   Order ID: {order.order_id}")
    print(f"   Summary: {order.summary}")
    print(f"   Status: {order.status.value}")
    print(f"   Pickup: {order.pickup_location}")
    
    # Test status
    status = await connector.get_order_status(order.order_id)
    print(f"\n📊 Order status: {status.status.value}")
    print(f"   Message: {status.message}")
    
    await connector.close()


async def test_full_flow():
    """Test the complete flow."""
    from src.agent.orchestrator import AgentOrchestrator
    from src.agent.intent_parser import IntentParser
    from src.connectors.starbucks import StarbucksConnector
    
    print("\n" + "="*60)
    print("🚀 FULL FLOW TEST")
    print("="*60)
    
    openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    starbucks = StarbucksConnector()
    
    # Mock AgentAuth
    class MockAgentAuth:
        async def authorize(self, delegation_token, amount, currency, merchant_id):
            class AuthResponse:
                decision = "ALLOW"
                authorization_code = f"auth_test_{os.urandom(4).hex()}"
                reason = None
            print(f"   ✅ Authorized ${amount:.2f} for {merchant_id}")
            return AuthResponse()
    
    orchestrator = AgentOrchestrator(
        openai_client=openai_client,
        agentauth_client=MockAgentAuth(),
        connectors={"starbucks": starbucks}
    )
    
    # Execute a command
    command = "Buy me a grande iced latte from Starbucks"
    print(f"\n🎤 User says: \"{command}\"")
    
    result = await orchestrator.execute_command(
        text=command,
        user_id="test_user",
        delegation_token="test_token"
    )
    
    print(f"\n📱 Agent response:")
    print(f"   Success: {result.success}")
    print(f"   Message: {result.message}")
    if result.order:
        print(f"   Order ID: {result.order.order_id}")
        print(f"   Total: ${result.order.total_price:.2f}")
    
    await starbucks.close()


async def main():
    """Run all tests."""
    print("\n" + "🤖 " * 20)
    print("    AGENTBUY MVP TEST SUITE")
    print("🤖 " * 20)
    
    if not os.getenv("OPENAI_API_KEY"):
        print("\n⚠️  OPENAI_API_KEY not set. Set it in .env file.")
        print("   Skipping tests that require OpenAI...")
        await test_starbucks_connector()
    else:
        await test_intent_parser()
        await test_starbucks_connector()
        await test_full_flow()
    
    print("\n" + "✨ " * 20)
    print("    ALL TESTS COMPLETE!")
    print("✨ " * 20 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
