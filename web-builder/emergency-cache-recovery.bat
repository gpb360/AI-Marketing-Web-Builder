@echo off
echo 🔧 Emergency Cache Recovery for Lightning CSS Issues
echo ==================================================

echo 🧹 Step 1: Terminating hanging processes...
taskkill /f /im node.exe /t 2>nul
taskkill /f /im npm.exe /t 2>nul
timeout /t 2 /nobreak >nul

echo 🗑️ Step 2: Cleaning npm cache directories...
rmdir /s /q "%APPDATA%\npm-cache" 2>nul
rmdir /s /q "%LOCALAPPDATA%\npm-cache" 2>nul
npm cache clean --force 2>nul

echo 🧽 Step 3: Removing project build artifacts...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .next rmdir /s /q .next

echo 📝 Step 4: Creating .npmrc for stability...
echo fund=false > .npmrc
echo audit=false >> .npmrc
echo optional=false >> .npmrc
echo save-exact=true >> .npmrc

echo 📦 Step 5: Fresh dependency installation...
npm install --no-optional --no-fund --no-audit --progress=false

echo ✅ Emergency recovery complete!
echo 💡 You can now run: npm run dev
pause