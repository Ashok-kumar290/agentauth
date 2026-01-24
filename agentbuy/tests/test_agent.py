"""
AgentBuy - Agentic Flow Test

Test the full ReAct reasoning loop with the Purchase Agent.
"""
import asyncio
import os
import sys
import logging

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)


async def test_demo_agent():
    """Test the agent in demo mode (without OpenAI)."""
    from src.agent.main import PurchaseAgent
    
    print("\n" + "="*70)
    print("🤖 AGENTIC AI TEST - Demo Mode")
    print("="*70)
    
    agent = PurchaseAgent(openai_api_key=None)  # Force demo mode
    
    # Test 1: Coffee order
    print("\n📝 Test 1: Simple coffee order")
    result = await agent.execute(
        command="Buy me a grande latte from Starbucks",
        user_id="test_user_1"
    )
    
    print(f"   Success: {result.get('success')}")
    print(f"   Trace:")
    for step in result.get('trace', []):
        print(f"      → {step}")
    
    if result.get('order'):
        print(f"   Order ID: {result['order'].get('order_id')}")
        print(f"   Total: ${result['order'].get('total', 0):.2f}")
    
    # Test 2: Non-coffee (should fail in demo)
    print("\n📝 Test 2: Non-supported command (demo mode)")
    result = await agent.execute(
        command="Order pizza from DoorDash",
        user_id="test_user_1"
    )
    
    print(f"   Success: {result.get('success')}")
    print(f"   Error: {result.get('error')}")
    
    await agent.close()
    print("\n✅ Demo mode tests complete!")


async def test_full_agent():
    """Test the agent with full LLM reasoning."""
    from src.agent.main import PurchaseAgent
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("\n⚠️  OPENAI_API_KEY not set. Skipping full agent test.")
        return
    
    print("\n" + "="*70)
    print("🧠 AGENTIC AI TEST - Full ReAct Loop")
    print("="*70)
    
    agent = PurchaseAgent(openai_api_key=api_key)
    
    # Test with full reasoning
    print("\n📝 Test: Coffee order with full reasoning")
    print("   This will show the agent's thinking process...")
    print()
    
    result = await agent.execute(
        command="I want to order my usual coffee from the nearest Starbucks",
        user_id="test_user_1"
    )
    
    print(f"\n{'='*70}")
    print("📊 RESULT")
    print(f"{'='*70}")
    print(f"   Success: {result.get('success')}")
    print(f"   Steps taken: {result.get('steps', 0)}")
    
    if result.get('trace'):
        print("\n📜 REASONING TRACE:")
        for i, step in enumerate(result.get('trace', []), 1):
            print(f"\n   --- Step {i} ---")
            for line in step.split('\n'):
                print(f"   {line}")
    
    if result.get('error'):
        print(f"\n   ❌ Error: {result.get('error')}")
    else:
        print(f"\n   ✅ Final result: {result.get('result')}")
    
    await agent.close()


async def test_tools_individually():
    """Test individual tools."""
    print("\n" + "="*70)
    print("🔧 TOOL TESTS")
    print("="*70)
    
    # Test Auth Tools
    from src.tools.auth import AgentAuthTools
    auth = AgentAuthTools()
    
    print("\n📝 Auth Tools:")
    
    budget = await auth.check_budget("user_1", "coffee", 10.0)
    print(f"   Budget check: {budget}")
    
    auth_result = await auth.request_authorization(
        user_id="user_1",
        amount=6.50,
        merchant="starbucks",
        description="Grande latte",
        category="coffee"
    )
    print(f"   Authorization: {auth_result}")
    
    # Test Context Tools
    from src.tools.context import ContextTools
    context = ContextTools()
    
    print("\n📝 Context Tools:")
    
    prefs = await context.get_user_preferences("user_1", "coffee")
    print(f"   Preferences: {prefs}")
    
    location = await context.get_user_location("user_1")
    print(f"   Location: {location}")
    
    nearby = await context.search_nearby("Starbucks")
    print(f"   Nearby stores: {len(nearby.get('results', []))} found")
    
    print("\n✅ Tool tests complete!")


async def main():
    """Run all tests."""
    print("\n" + "🧠 " * 20)
    print("    AGENTBUY - AGENTIC AI TEST SUITE")
    print("🧠 " * 20)
    
    await test_tools_individually()
    await test_demo_agent()
    await test_full_agent()
    
    print("\n" + "✨ " * 20)
    print("    ALL TESTS COMPLETE!")
    print("✨ " * 20 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
