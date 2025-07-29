#!/bin/bash

# AI Marketing Web Builder Backend Setup Script

set -e

echo "🚀 Setting up AI Marketing Web Builder Backend..."

# Check if Python 3.11+ is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "✅ Found Python $PYTHON_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration"
fi

# Create upload directory
mkdir -p uploads

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database and Redis configuration"
echo "2. Start services: make up (Docker) or setup database manually"
echo "3. Run migrations: make migrate"
echo "4. Start development server: make dev"
echo ""
echo "Available commands:"
echo "  make help     - Show all available commands"
echo "  make dev      - Run development server"
echo "  make up       - Start with Docker"
echo "  make test     - Run tests"
echo ""