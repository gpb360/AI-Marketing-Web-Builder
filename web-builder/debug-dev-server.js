#!/usr/bin/env node

/**
 * Debug Development Server Startup Script
 * 
 * This script helps debug and fix Next.js development server startup issues
 * with detailed logging and error handling.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 AI Marketing Web Builder - Debug Server Startup');
console.log('══════════════════════════════════════════════════');

// Environment check
console.log('\n📋 Environment Check:');
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Architecture: ${process.arch}`);
console.log(`Working directory: ${process.cwd()}`);

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found in current directory');
  process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  console.log('⚠️ node_modules not found - running npm install...');
  
  const install = spawn('npm', ['install'], {
    stdio: 'inherit',
    shell: true
  });
  
  install.on('close', (code) => {
    if (code === 0) {
      console.log('✅ npm install completed successfully');
      startDevServer();
    } else {
      console.error(`❌ npm install failed with code ${code}`);
      process.exit(1);
    }
  });
  
  return;
}

function startDevServer() {
  console.log('\n🚀 Starting Next.js Development Server...');
  console.log('Port: 3003');
  console.log('Host: 0.0.0.0');
  
  // Add debug environment variables
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    DEBUG: 'next:*',
    NEXT_DEBUG: '1'
  };
  
  console.log('\n📝 Starting with debug mode enabled...');
  
  const devServer = spawn('npx', ['next', 'dev', '--hostname', '0.0.0.0', '--port', '3003'], {
    stdio: 'inherit',
    shell: true,
    env: env
  });
  
  devServer.on('error', (error) => {
    console.error('❌ Failed to start development server:', error);
  });
  
  devServer.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Development server stopped gracefully');
    } else {
      console.error(`❌ Development server exited with code ${code}`);
    }
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    devServer.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Terminating development server...');
    devServer.kill('SIGTERM');
  });
  
  // Log successful startup after delay
  setTimeout(() => {
    console.log('\n🌐 Development server should be running at:');
    console.log('   Local:    http://localhost:3003');
    console.log('   Network:  http://0.0.0.0:3003');
    console.log('\n💡 If the server fails to start, check the debug output above');
  }, 5000);
}

// Check package.json for obvious issues
function validatePackageJson() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    console.log('\n📦 Package.json validation:');
    console.log(`Name: ${packageJson.name}`);
    console.log(`Version: ${packageJson.version}`);
    
    if (!packageJson.scripts || !packageJson.scripts.dev) {
      console.error('❌ No dev script found in package.json');
      return false;
    }
    
    console.log(`Dev script: ${packageJson.scripts.dev}`);
    
    if (!packageJson.dependencies || !packageJson.dependencies.next) {
      console.error('❌ Next.js not found in dependencies');
      return false;
    }
    
    console.log(`Next.js version: ${packageJson.dependencies.next}`);
    console.log('✅ Package.json looks valid');
    
    return true;
  } catch (error) {
    console.error('❌ Error reading package.json:', error.message);
    return false;
  }
}

// Validate package.json first
if (!validatePackageJson()) {
  process.exit(1);
}

// Start the server
startDevServer();