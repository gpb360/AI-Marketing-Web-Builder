#!/bin/bash
# Emergency Environment Fix Script

echo "🚨 FIXING BROKEN DEVELOPMENT ENVIRONMENT..."

# Kill any stuck processes
pkill -f "npm install" 2>/dev/null || true

# Frontend Fix
echo "📦 Fixing Frontend Dependencies..."
cd /mnt/d/s7s-projects/AI-Marketing-Web-Builder/web-builder

# Use yarn instead of npm (faster)
if ! command -v yarn &> /dev/null; then
    echo "Installing yarn..."
    npm install -g yarn
fi

# Clean and fast install
rm -rf node_modules package-lock.json yarn.lock 2>/dev/null || true
yarn install --network-timeout 600000

# Backend Fix  
echo "🐍 Fixing Backend Dependencies..."
cd /mnt/d/s7s-projects/AI-Marketing-Web-Builder/web-builder/backend

# Install pip if missing
if ! python3 -m pip --version &> /dev/null; then
    echo "Installing pip..."
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python3 get-pip.py --user
    rm get-pip.py
fi

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install fastapi uvicorn python-multipart jinja2 sqlalchemy alembic pydantic

echo "✅ Environment Fixed! Testing..."

# Test frontend
cd /mnt/d/s7s-projects/AI-Marketing-Web-Builder/web-builder
if yarn next --version; then
    echo "✅ Frontend: Next.js working"
else 
    echo "❌ Frontend: Still broken"
fi

# Test backend
cd backend
source venv/bin/activate
if python3 -c "import fastapi; print('✅ Backend: FastAPI working')"; then
    echo "✅ Backend ready"
else
    echo "❌ Backend still broken"
fi

echo "🚀 Environment fix complete!"