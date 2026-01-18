# AgentAuth Self-Hosted Deployment

Enterprise on-premise deployment for financial institutions.

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/agentauth-io/agentauth.git
cd agentauth

# 2. Configure environment
cp deploy/.env.example .env
# Edit .env with your settings

# 3. Start services
docker-compose up -d

# 4. Run database migrations
docker-compose exec agentauth python -m alembic upgrade head

# 5. Verify deployment
curl http://localhost:8000/health
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Load Balancer                  │
│                  (Nginx/Cloud)                   │
└───────────────────────┬─────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────┐
│                AgentAuth API                     │
│            (Python/FastAPI)                      │
└─────────────────────┬───────────────────────────┘
          ┌───────────┼───────────┐
          │           │           │
    ┌─────▼────┐ ┌────▼────┐ ┌────▼────┐
    │PostgreSQL│ │  Redis  │ │   OPA   │
    │   (RLS)  │ │ (Cache) │ │(Policies)│
    └──────────┘ └─────────┘ └─────────┘
```

## Components

| Service | Purpose | Port |
|---------|---------|------|
| agentauth | API Server | 8000 |
| postgres | Database with RLS | 5432 |
| redis | Cache, Rate Limiting | 6379 |
| opa | Policy Engine (optional) | 8181 |
| jaeger | Tracing (optional) | 16686 |

## Profiles

```bash
# Basic deployment (API + DB + Redis)
docker-compose up -d

# With OPA policy engine
docker-compose --profile with-opa up -d

# With tracing (Jaeger)
docker-compose --profile with-tracing up -d

# Full deployment (all services)
docker-compose --profile with-opa --profile with-tracing --profile with-nginx up -d
```

## Security Checklist

- [ ] Change default DB password
- [ ] Generate strong SECRET_KEY
- [ ] Enable TLS (use nginx profile)
- [ ] Configure firewall rules
- [ ] Set up backup for PostgreSQL
- [ ] Review RLS policies

## Compliance

| Regulation | Status |
|------------|--------|
| SOX | ✅ 7-year audit retention |
| FINRA | ✅ Immutable audit logs |
| PCI-DSS | ✅ Secure logging |
| GDPR | ✅ Data access tracking |

## Support

Enterprise support: enterprise@agentauth.in
