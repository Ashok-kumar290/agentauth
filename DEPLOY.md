# Railway Deployment Guide

## Prerequisites
- Railway account (railway.app)
- GitHub repo with AgentAuth code

## One-Click Deploy

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "AgentAuth MVP"
git remote add origin https://github.com/YOUR_USERNAME/agentauth.git
git push -u origin main
```

2. Go to railway.app → New Project → Deploy from GitHub

3. Select your repo

4. Add environment variables in Railway dashboard:
```
DATABASE_URL = your-neon-connection-string
SECRET_KEY = generate-a-secure-key
DEBUG = false
```

5. Deploy! Railway auto-detects Python.

## After Deploy

Your API will be at: `https://agentauth-xxxx.railway.app`

Test it:
```bash
curl https://agentauth-xxxx.railway.app/health
```

## Custom Domain

In Railway: Settings → Domains → Add custom domain

Example: `api.agentauth.io`
