@echo off
REM FMSS Platform Development Startup - WITH PORT CLEANUP
REM This script kills existing Node.js processes on dev ports, then starts all services

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  FMSS Platform - Clean Startup (Killing Old Processes) ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Kill existing processes on development ports
echo [*] Cleaning up existing processes...

for %%P in (8000 3000 3100) do (
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr :%%P') do (
    echo   Killing process on port %%P (PID: %%A)
    taskkill /PID %%A /F >nul 2>&1
  )
)

echo   ✓ Cleanup complete

echo.
echo [*] Waiting 2 seconds before starting services...
timeout /t 2 /nobreak

REM Check if node_modules exists
if not exist "node_modules" (
  echo [!] Installing root dependencies...
  call npm install
  if errorlevel 1 (
    echo [X] Failed to install dependencies
    pause
    exit /b 1
  )
)

if not exist "apps\sams\node_modules" (
  echo [!] Installing SAMS dependencies...
  call npm run sams:install
  if errorlevel 1 (
    echo [X] Failed to install SAMS dependencies
    pause
    exit /b 1
  )
)

if not exist "apps\contracts\node_modules" (
  echo [!] Installing Contracts dependencies...
  call npm run contracts:install
  if errorlevel 1 (
    echo [X] Failed to install Contracts dependencies
    pause
    exit /b 1
  )
)

echo.
echo [+] Starting services...
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
echo ╔════════════════════════════════════════════════════════╗
echo ║  All services started! Access at:                      ║
echo ║  Main:      http://localhost:8000                      ║
echo ║  SAMS:      http://localhost:3000                      ║
echo ║  Contracts: http://localhost:3100                      ║
echo ║                                                        ║
echo ║  Close windows to stop services                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
