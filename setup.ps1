# dineAR Setup Script
# Run this script to set up and start the dineAR application

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  dineAR - AR Menu Visualization Platform" -ForegroundColor Cyan
Write-Host "  Setup & Installation Script" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Check if MongoDB is running
Write-Host "[1/6] Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoStatus = & mongod --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MongoDB is installed" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ MongoDB not found. Please install MongoDB first." -ForegroundColor Red
    Write-Host "  Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
Write-Host "`n[2/6] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version 2>&1
    Write-Host "✓ Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    Write-Host "  Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Install backend dependencies
Write-Host "`n[3/6] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location server
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ server/package.json not found" -ForegroundColor Red
    exit 1
}

# Set up backend environment
Write-Host "`n[4/6] Setting up backend environment..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created server/.env from template" -ForegroundColor Green
    Write-Host "  ⚠ IMPORTANT: Edit server/.env and change JWT_SECRET!" -ForegroundColor Yellow
} else {
    Write-Host "✓ server/.env already exists" -ForegroundColor Green
}

Set-Location ..

# Install frontend dependencies
Write-Host "`n[5/6] Installing frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✗ package.json not found" -ForegroundColor Red
    exit 1
}

# Set up frontend environment
Write-Host "`n[6/6] Setting up frontend environment..." -ForegroundColor Yellow
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env from template" -ForegroundColor Green
} else {
    Write-Host "✓ .env already exists" -ForegroundColor Green
}

# Create uploads directory
Write-Host "`n[SETUP] Creating uploads directory..." -ForegroundColor Yellow
if (!(Test-Path "server/uploads")) {
    New-Item -ItemType Directory -Path "server/uploads" | Out-Null
    Write-Host "✓ Created server/uploads directory" -ForegroundColor Green
} else {
    Write-Host "✓ server/uploads directory already exists" -ForegroundColor Green
}

# Final instructions
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan

Write-Host "⚠ IMPORTANT NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Start MongoDB:" -ForegroundColor White
Write-Host "   mongod" -ForegroundColor Gray
Write-Host "`n2. Edit server/.env and change JWT_SECRET to a strong random value" -ForegroundColor White
Write-Host "`n3. Start the backend (in a new terminal):" -ForegroundColor White
Write-Host "   cd server" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "`n4. Start the frontend (in another terminal):" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "`n5. Open your browser to: http://localhost:5173" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - README.md    - Setup and usage guide" -ForegroundColor Gray
Write-Host "   - API.md       - API documentation" -ForegroundColor Gray
Write-Host "   - SECURITY.md  - Security best practices" -ForegroundColor Gray

Write-Host "`n✨ Happy coding!" -ForegroundColor Green
