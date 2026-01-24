# AgentBuy 🛒🤖

**Universal AI Purchase Agent** - Voice/text-first consumer app that executes purchases on your behalf.

> "Hey, buy me a coffee from Starbucks" → AI figures out HOW and does it

## Overview

AgentBuy is the consumer-facing execution layer that works with [AgentAuth](../README.md) to enable autonomous AI purchasing with human authorization controls.

```
User Voice/Text → Intent Parser → AgentAuth Check → Platform Connector → Order Execution
```

## Current Vertical: Coffee ☕

Starting with Starbucks mobile ordering to prove the concept:
- Voice command: "Get me a grande iced latte from the nearest Starbucks"
- Agent parses intent, checks budget limits via AgentAuth
- Places order via Starbucks mobile order API
- Tracks pickup/delivery status

## Project Structure

```
agentbuy/
├── src/
│   ├── agent/         # Core agent orchestration
│   ├── connectors/    # Platform integrations (Starbucks, etc.)
│   ├── voice/         # STT/TTS with Whisper
│   ├── api/           # FastAPI endpoints
│   └── models/        # Pydantic schemas
├── tests/             # Test suite
├── docs/              # Documentation
└── frontend/          # Mobile/web app
```

## Quick Start

```bash
# Install dependencies
pip install -e ".[dev]"

# Set environment variables
cp .env.example .env

# Run API server
uvicorn src.api.main:app --reload

# Test a command
curl -X POST http://localhost:8001/v1/command \
  -H "Content-Type: application/json" \
  -d '{"text": "Buy me a grande latte from Starbucks", "user_id": "user_123"}'
```

## Integration with AgentAuth

AgentBuy uses AgentAuth for authorization:

```python
from agentauth import AgentAuthClient

# Before executing any purchase
auth = agentauth_client.authorize(
    delegation_token=user_token,
    amount=5.75,
    merchant_id="starbucks"
)

if auth.decision == "ALLOW":
    # Proceed with Starbucks order
    connector.place_order(...)
```

## Roadmap

- [x] Project structure
- [ ] Intent parser (GPT-4)
- [ ] Starbucks connector
- [ ] Voice interface (Whisper)
- [ ] AgentAuth integration
- [ ] Order tracking
- [ ] Mobile app

## License

Proprietary © 2026
