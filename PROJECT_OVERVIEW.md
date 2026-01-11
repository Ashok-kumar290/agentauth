# AgentAuth Project Overview

## What You Have

Complete, working codebase for AgentAuth - the authorization layer for AI agent purchases.

## File Structure Explained

```
agentauth/
│
├── app/                      # Main application code
│   │
│   ├── main.py              # FastAPI app entry point
│   │                         - Creates the app
│   │                         - Registers all routes
│   │                         - CORS configuration
│   │
│   ├── config.py            # Environment configuration
│   │                         - Database URL
│   │                         - Secret key
│   │                         - Token expiry settings
│   │
│   ├── api/                 # API endpoints (what clients call)
│   │   ├── consents.py      # POST /v1/consents
│   │   ├── authorize.py     # POST /v1/authorize  
│   │   └── verify.py        # POST /v1/verify
│   │
│   ├── services/            # Business logic (the brain)
│   │   ├── token_service.py    # JWT token creation/verification
│   │   ├── consent_service.py  # Consent CRUD operations
│   │   ├── auth_service.py     # Authorization decision logic
│   │   └── verify_service.py   # Merchant verification logic
│   │
│   ├── models/              # Database tables (SQLAlchemy)
│   │   ├── database.py      # DB connection setup
│   │   ├── consent.py       # Consent table
│   │   ├── authorization.py # Authorization table
│   │   └── audit.py         # Audit log table
│   │
│   └── schemas/             # Request/Response validation (Pydantic)
│       ├── consent.py       # Consent API schemas
│       ├── authorize.py     # Authorization API schemas
│       └── verify.py        # Verification API schemas
│
├── alembic/                 # Database migrations
│   ├── env.py               # Migration configuration
│   └── versions/            # Migration files go here
│
├── tests/                   # Test files
│   └── test_flow.py         # End-to-end flow tests
│
├── pyproject.toml           # Python dependencies
├── Dockerfile               # Container build
├── .env.example             # Environment template
├── .gitignore               # Git ignore rules
├── run.sh                   # Quick start script
└── README.md                # Documentation
```

## The Three Core Flows

### 1. Create Consent (consent_service.py + consents.py)
```
User says "buy flight under $500"
  → ConsentService.create_consent()
  → Saves to database
  → TokenService.create_delegation_token()
  → Returns consent_id + delegation_token
```

### 2. Authorize (auth_service.py + authorize.py)
```
Agent wants to pay $347
  → TokenService.verify_token() - checks JWT claims
  → Load consent from database
  → Check: amount ≤ max? currency match? merchant allowed?
  → If yes: generate authorization_code, return ALLOW
  → If no: return DENY with reason
```

### 3. Verify (verify_service.py + verify.py)
```
Merchant has authorization_code
  → Find authorization in database
  → Check: not used? not expired? amount matches?
  → Mark as used
  → Return consent_proof for chargeback defense
```

## Key Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Token format | JWT (for MVP) | Simple, well-understood. Later: Biscuit tokens |
| Database | PostgreSQL | Relational model fits auth data perfectly |
| Framework | FastAPI | Async, fast, auto-docs, type hints |
| Validation | Pydantic | Type safety, auto-validation |
| ORM | SQLAlchemy | Mature, async support |

## What to Do Next

### Today
```bash
# 1. Get a database
# Go to https://neon.tech → Create project → Copy connection string

# 2. Setup environment
cd agentauth
cp .env.example .env
# Edit .env, set DATABASE_URL to your Neon connection string

# 3. Run
chmod +x run.sh
./run.sh
```

### This Week
1. Test the API at http://localhost:8000/docs
2. Run the full flow: consent → authorize → verify
3. Deploy to Railway ($5/month)

### Next Week
1. Build simple demo UI (Streamlit or React)
2. Start design partner outreach
3. Record demo video

## Database Setup (Neon)

1. Go to https://neon.tech
2. Sign up (free)
3. Create project "agentauth"
4. Copy connection string
5. Replace `postgresql://...` with `postgresql+asyncpg://...`
6. Add to .env

Example:
```
DATABASE_URL=postgresql+asyncpg://user:pass@ep-xxx.us-east-2.aws.neon.tech/agentauth
```

## Test the API

After running `./run.sh`, open http://localhost:8000/docs

### Quick curl test:
```bash
# Health check
curl http://localhost:8000/health

# Create consent
curl -X POST http://localhost:8000/v1/consents \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_123",
    "intent": {"description": "Buy flight to NYC"},
    "constraints": {"max_amount": 500, "currency": "USD"},
    "options": {"expires_in_seconds": 3600},
    "signature": "sig",
    "public_key": "key"
  }'
```

## Questions You Should Be Able to Answer

1. **"How do you issue tokens?"**
   → TokenService.create_delegation_token() creates a JWT with consent constraints embedded. The constraints (max_amount, currency, merchants) become JWT claims.

2. **"How do you verify without hitting the database?"**
   → The JWT itself contains the constraints. We verify the signature and check claims. Database lookup is for audit only.

3. **"What if the agent tries to overspend?"**
   → token_service.verify_token() checks: is `request_amount_cents > max_amount_cents`? If yes, returns `{valid: false, reason: "amount exceeded"}`.

4. **"How do merchants defend chargebacks?"**
   → The proof_token from /verify contains: consent_id, user_intent, timestamp, amount, all signed. Merchant stores this and presents during dispute.

5. **"Why not use OAuth?"**
   → OAuth is for human sessions. No concept of spending limits, merchant restrictions, or delegation chains. We need financial-grade constraints.

## Files You'll Edit Most

| File | When |
|------|------|
| `app/services/auth_service.py` | Adding new authorization rules |
| `app/services/token_service.py` | Changing token format/claims |
| `app/schemas/*.py` | Adding new API fields |
| `app/models/*.py` | Adding database columns |
| `.env` | Configuration changes |

## Done!

You have a complete, working authorization system for AI agents. 

The code is production-structured (not a prototype) so it can grow with you.

Start here: `./run.sh`
