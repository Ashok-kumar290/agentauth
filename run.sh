#!/bin/bash
# run.sh - Quick start script for AgentAuth

set -e

echo "🚀 AgentAuth Setup"
echo "=================="

# Check Python version
python3 --version || { echo "❌ Python 3 required"; exit 1; }

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -e . --quiet

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from example..."
    cp .env.example .env
    echo "📝 Please edit .env with your database URL"
    echo "   Get a free PostgreSQL at https://neon.tech"
    exit 1
fi

# Run migrations (if database is configured)
echo "🗄️  Running database migrations..."
alembic upgrade head 2>/dev/null || echo "⚠️  Migrations skipped (check DATABASE_URL)"

# Start server
echo ""
echo "✅ Starting AgentAuth..."
echo "   📖 Docs: http://localhost:8000/docs"
echo "   🔍 Health: http://localhost:8000/health"
echo ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
