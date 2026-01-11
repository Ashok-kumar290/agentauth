# AgentAuth

**Cryptographic proof that a human authorized an AI agent's purchase.**

## The Problem

AI agents are starting to make purchases. But when an agent buys something:
- ❌ No proof the user authorized it
- ❌ No spending controls
- ❌ Merchants face 100% chargeback liability

## The Solution

AgentAuth issues delegation tokens that cryptographically bind user consent to agent actions. Merchants can verify these tokens to prove authorization.

```
User: "Buy me a flight under $500"
  ↓
AgentAuth: Issues delegation token with $500 limit
  ↓
Agent: Finds $347 flight, requests authorization
  ↓
AgentAuth: Checks constraints → ALLOW + authorization code
  ↓
Merchant: Verifies code → Gets proof for chargeback defense
```

## Quick Start

### 1. Setup

```bash
# Clone
git clone https://github.com/yourusername/agentauth.git
cd agentauth

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -e .

# Copy environment file
cp .env.example .env
# Edit .env with your database URL
```

### 2. Database

```bash
# Create database on Neon (https://neon.tech - free tier)
# Update DATABASE_URL in .env

# Run migrations
alembic upgrade head
```

### 3. Run

```bash
uvicorn app.main:app --reload
```

Open http://localhost:8000/docs for interactive API documentation.

## API Usage

### Step 1: Create Consent

User authorizes agent to act on their behalf:

```bash
curl -X POST http://localhost:8000/v1/consents \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "intent": {
      "description": "Buy cheapest flight to NYC"
    },
    "constraints": {
      "max_amount": 500,
      "currency": "USD"
    },
    "options": {
      "expires_in_seconds": 3600
    },
    "signature": "user_signature",
    "public_key": "user_public_key"
  }'
```

Response:
```json
{
  "consent_id": "cons_abc123",
  "delegation_token": "eyJ0eXAi...",
  "expires_at": "2026-01-11T20:00:00Z",
  "constraints": {
    "max_amount": 500,
    "currency": "USD"
  }
}
```

### Step 2: Agent Requests Authorization

Agent wants to buy a $347 flight:

```bash
curl -X POST http://localhost:8000/v1/authorize \
  -H "Content-Type: application/json" \
  -d '{
    "delegation_token": "eyJ0eXAi...",
    "action": "payment",
    "transaction": {
      "amount": 347,
      "currency": "USD",
      "merchant_id": "delta_airlines",
      "merchant_name": "Delta Airlines"
    }
  }'
```

Response (authorized):
```json
{
  "decision": "ALLOW",
  "authorization_code": "authz_xyz789",
  "expires_at": "2026-01-11T15:05:00Z",
  "consent_id": "cons_abc123"
}
```

Response (denied - over limit):
```json
{
  "decision": "DENY",
  "reason": "amount_exceeded",
  "message": "Transaction amount $600 exceeds consent limit of $500"
}
```

### Step 3: Merchant Verifies

Merchant confirms authorization and gets proof:

```bash
curl -X POST http://localhost:8000/v1/verify \
  -H "Content-Type: application/json" \
  -d '{
    "authorization_code": "authz_xyz789",
    "transaction": {
      "amount": 347,
      "currency": "USD"
    }
  }'
```

Response:
```json
{
  "valid": true,
  "authorization_id": "auth_abc123",
  "consent_proof": {
    "consent_id": "cons_abc123",
    "user_authorized_at": "2026-01-11T14:00:00Z",
    "user_intent": "Buy cheapest flight to NYC",
    "max_authorized_amount": 500,
    "actual_amount": 347,
    "signature_valid": true
  },
  "verification_timestamp": "2026-01-11T15:02:00Z",
  "proof_token": "eyJ..."
}
```

The `proof_token` should be stored for chargeback defense.

## Project Structure

```
agentauth/
├── app/
│   ├── main.py           # FastAPI application
│   ├── config.py         # Settings and configuration
│   ├── api/              # API endpoints
│   │   ├── consents.py   # POST /v1/consents
│   │   ├── authorize.py  # POST /v1/authorize
│   │   └── verify.py     # POST /v1/verify
│   ├── services/         # Business logic
│   │   ├── token_service.py    # Token generation/verification
│   │   ├── consent_service.py  # Consent management
│   │   ├── auth_service.py     # Authorization logic
│   │   └── verify_service.py   # Verification logic
│   ├── models/           # Database models
│   │   ├── consent.py
│   │   ├── authorization.py
│   │   └── audit.py
│   └── schemas/          # Pydantic schemas
│       ├── consent.py
│       ├── authorize.py
│       └── verify.py
├── alembic/              # Database migrations
├── tests/                # Tests
├── pyproject.toml        # Dependencies
├── Dockerfile
└── README.md
```

## Configuration

Environment variables (see `.env.example`):

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `SECRET_KEY` | JWT signing key | Required in production |
| `DEBUG` | Enable debug mode | `false` |
| `TOKEN_EXPIRY_SECONDS` | Default token expiry | `3600` |
| `AUTH_CODE_EXPIRY_SECONDS` | Authorization code expiry | `300` |

## Deployment

### Railway (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add -p postgresql

# Deploy
railway up
```

### Docker

```bash
docker build -t agentauth .
docker run -p 8000:8000 --env-file .env agentauth
```

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black app/
ruff check app/

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

## License

MIT
