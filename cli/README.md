# AgentAuth CLI

The official command-line interface for AgentAuth — the authorization layer for autonomous AI agents.

## Installation

```bash
npm install -g @agentauth/cli
```

Or with npx:

```bash
npx @agentauth/cli authorize --agent my-bot --action purchase --amount 100
```

## Quick Start

```bash
# 1. Login with your API key
agentauth login

# 2. Authorize an agent action
agentauth authorize --agent procurement-bot --action purchase --amount 249.99 --merchant aws.amazon.com

# 3. View the dashboard
agentauth dashboard

# 4. Run tests against your policies
agentauth test --scenario tests/basic.yaml
```

## Commands

### Authentication

```bash
agentauth login                    # Authenticate with API key
agentauth logout                   # Clear stored credentials
agentauth status                   # Show connection + account info
```

### Authorization

```bash
# Quick authorize
agentauth authorize --agent <id> --action <type> --amount <n> --merchant <name>

# Interactive mode
agentauth authorize --interactive
```

### Agents

```bash
agentauth agents list              # List all agents
agentauth agents register <name>   # Register new agent
agentauth agents inspect <id>      # View agent details
agentauth agents remove <id>       # Remove agent
```

### Policies

```bash
agentauth policies list            # List all policies
agentauth policies create          # Interactive policy builder
agentauth policies test <file>     # Test policy against scenarios
agentauth policies push <file>     # Deploy policy to AgentAuth
agentauth policies pull            # Download current policies
```

### Consents

```bash
agentauth consents list            # List all consents
agentauth consents approve <id>    # Approve pending consent
agentauth consents deny <id>       # Deny pending consent
agentauth consents revoke <id>     # Revoke active consent
```

### Logs

```bash
agentauth logs stream              # Real-time log streaming
agentauth logs search <query>      # Search logs
agentauth logs export              # Export to JSON/CSV
```

### API Keys

```bash
agentauth keys list                # List API keys
agentauth keys create <name>       # Create new key
agentauth keys revoke <id>         # Revoke key
agentauth keys rotate <id>         # Rotate key (revoke + create)
```

### Testing

```bash
# Run scenario file
agentauth test --scenario tests/basic.yaml --verbose

# Interactive testing
agentauth test --interactive
```

### Dashboard (TUI)

```bash
agentauth dashboard                # Full-screen terminal dashboard
```

Keyboard shortcuts in dashboard:
- `r` - Refresh
- `a` - Switch to agents
- `p` - Switch to policies
- `l` - Switch to logs
- `k` - Switch to keys
- `q` - Quit

## Configuration

Config is stored at `~/.config/agentauth-cli/config.json`.

```bash
# Set API URL (default: https://agentauth.in)
agentauth config set apiUrl https://your-instance.com

# Set output format
agentauth config set outputFormat json    # table | json | yaml
```

## Test Scenarios

Create YAML files to test your policies:

```yaml
name: "Basic Authorization Tests"
description: "Test core policies"

scenarios:
  - name: "Allow small purchase"
    request:
      agentId: "procurement-bot"
      action: "purchase"
      amount: 99.99
      merchant: "aws.amazon.com"
    expectedDecision: "ALLOWED"

  - name: "Block gambling"
    request:
      agentId: "procurement-bot"
      action: "purchase"
      amount: 50.00
      merchant: "online-casino.com"
    expectedDecision: "DENIED"
```

Run with:
```bash
agentauth test --scenario my-tests.yaml
```

## Global Options

```bash
--format <type>     Output format: table, json, yaml (default: table)
--no-color          Disable colors
--api-url <url>     Override API URL
```

## Environment Variables

```bash
AGENTAUTH_API_KEY=aa_live_...       # API key (alternative to login)
AGENTAUTH_API_URL=https://...       # API URL override
```

## License

MIT
