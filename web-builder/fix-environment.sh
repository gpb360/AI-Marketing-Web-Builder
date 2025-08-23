#!/bin/bash

# Frontend Node.js Environment Fix Script
# This script addresses the critical dependency corruption issues

echo "🔧 Frontend Environment Fix Script"
echo "=================================="

# Check prerequisites
echo "📋 Checking prerequisites..."
node_version=$(node --version)
npm_version=$(npm --version)
echo "✅ Node.js: $node_version"
echo "✅ npm: $npm_version"

# Save current directory
WORK_DIR=$(pwd)
echo "📁 Working directory: $WORK_DIR"

# Backup current package.json
echo "💾 Backing up package.json..."
cp package.json package.json.backup

# Clean npm cache
echo "🧹 Cleaning npm cache..."
npm cache clean --force

# Remove corrupted node_modules and lock files
echo "🗑️  Removing corrupted installation..."
if [ -d "node_modules" ]; then
    echo "   Removing node_modules..."
    rm -rf node_modules 2>/dev/null || {
        echo "   ⚠️  Permission issue with node_modules removal"
        echo "   Moving to backup instead..."
        mv node_modules "node_modules_corrupted_$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
    }
fi

if [ -f "package-lock.json" ]; then
    echo "   Removing package-lock.json..."
    rm -f package-lock.json 2>/dev/null || {
        echo "   ⚠️  Permission issue with lock file"
        mv package-lock.json "package-lock.json.backup" 2>/dev/null || true
    }
fi

# Fresh installation
echo "📦 Installing dependencies..."
npm install --no-optional --no-audit --no-fund || {
    echo "❌ npm install failed, trying with different flags..."
    npm install --legacy-peer-deps --no-optional || {
        echo "❌ Installation failed. Trying yarn..."
        if command -v yarn &> /dev/null; then
            yarn install
        else
            echo "❌ yarn not available. Manual intervention required."
            exit 1
        fi
    }
}

# Verify critical binaries
echo "🔍 Verifying installation..."

check_binary() {
    local name=$1
    local path=$2
    if [ -f "$path" ] && [ -x "$path" ]; then
        echo "✅ $name: Found and executable"
        return 0
    else
        echo "❌ $name: Missing or not executable"
        return 1
    fi
}

check_binary "Next.js" "node_modules/.bin/next"
check_binary "TypeScript" "node_modules/.bin/tsc"
check_binary "Jest" "node_modules/.bin/jest"

# Test key commands
echo "🧪 Testing commands..."

test_command() {
    local cmd=$1
    local description=$2
    echo -n "   Testing $description... "
    if eval "$cmd" &>/dev/null; then
        echo "✅ PASS"
        return 0
    else
        echo "❌ FAIL"
        return 1
    fi
}

# Try the actual commands we need
test_command "npm run type-check" "TypeScript compilation"
test_command "npm test -- --passWithNoTests" "Jest testing framework"

# Try starting dev server (quick test)
echo "🚀 Testing development server startup..."
timeout 10s npm run dev &>/dev/null && {
    echo "✅ Development server can start"
} || {
    echo "❌ Development server startup failed"
    echo "   This may require manual debugging"
}

echo ""
echo "🎯 Environment Fix Summary:"
echo "   - Node.js: $node_version"  
echo "   - npm: $npm_version"
echo "   - Dependencies: $(ls node_modules 2>/dev/null | wc -l) packages installed"
echo "   - Critical binaries: $(ls node_modules/.bin 2>/dev/null | wc -l) binaries available"

echo ""
echo "📝 Next Steps:"
echo "   1. Run 'npm run dev' to start development server"
echo "   2. Run 'npm run type-check' to validate TypeScript"
echo "   3. Run 'npm test' to verify testing framework"
echo "   4. If issues persist, check individual package installations"

echo ""
echo "🔧 Common fixes if problems continue:"
echo "   - Use 'npx' prefix for commands: 'npx next dev'"
echo "   - Try 'npm rebuild' to rebuild native dependencies"
echo "   - Check file permissions: 'ls -la node_modules/.bin/'"
echo "   - Consider using yarn: 'yarn install && yarn dev'"

echo ""
echo "✨ Environment fix script completed!"