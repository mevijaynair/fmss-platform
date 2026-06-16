@echo off
REM FMSS Platform Development Startup (Windows)
REM This script starts all three services in separate terminal windows

echo.
echo ╔════════════════════════════════════════════════╗
echo ║  FMSS Platform - Development Server Launcher   ║
echo ╚════════════════════════════════════════════════╝
echo.

REM Check if node_modules exists
if not exist "node_modules" (
  echo Installing root dependencies...
  call npm install
  if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
  )
)

REM Check if SAMS dependencies are installed
if not exist "apps\sams\node_modules" (
  echo Installing SAMS dependencies...
  call npm run sams:install
  if errorlevel 1 (
    echo Failed to install SAMS dependencies
    pause
    exit /b 1
  )
)

REM Check if Contracts dependencies are installed
if not exist "apps\contracts\node_modules" (
  echo Installing Contracts dependencies...
  call npm run contracts:install
  if errorlevel 1 (
    echo Failed to install Contracts dependencies
    pause
    exit /b 1
  )
)

echo.
echo Starting services...
echo.

REM Start main proxy server
echo [1/3] Starting Main Proxy (port 8000)...
start "FMSS Proxy" cmd /k npm run dev

timeout /t 2 /nobreak

REM Start SAMS
echo [2/3] Starting SAMS (port 3000)...
start "FMSS SAMS" cmd /k npm run sams:dev

timeout /t 2 /nobreak

REM Start Contracts
echo [3/3] Starting Contracts (port 3100)...
start "FMSS Contracts" cmd /k npm run contracts:dev

echo.
echo ╔════════════════════════════════════════════════╗
echo ║  All services started! Access at:              ║
echo ║  Main:      http://localhost:8000              ║
echo ║  SAMS:      http://localhost:3000              ║
echo ║  Contracts: http://localhost:3100              ║
echo ║  Quiz:      http://localhost:8000/quiz         ║
echo ║                                                ║
echo ║  Close windows to stop services                ║
echo ╚════════════════════════════════════════════════╝
echo.
