#!/bin/bash
# FMSS Platform Development Startup - WITH PORT CLEANUP
# This script kills existing Node.js processes on dev ports, then starts all services

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  FMSS Platform - Clean Startup (Killing Old Processes) ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Kill existing processes on development ports
echo -e "${YELLOW}[*] Cleaning up existing processes...${NC}"

for port in 8000 3000 3100; do
  # Find PID of process listening on this port
  pid=$(lsof -ti :$port 2>/dev/null)

  if [ ! -z "$pid" ]; then
    echo "  Killing process on port $port (PID: $pid)"
    kill -9 $pid 2>/dev/null || sudo kill -9 $pid 2>/dev/null
  fi
done

echo -e "${GREEN}  ✓ Cleanup complete${NC}"

echo ""
echo -e "${YELLOW}[*] Waiting 2 seconds before starting services...${NC}"
sleep 2

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}[!] Installing root dependencies...${NC}"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}[X] Failed to install dependencies${NC}"
    exit 1
  fi
fi

if [ ! -d "apps/sams/node_modules" ]; then
  echo -e "${YELLOW}[!] Installing SAMS dependencies...${NC}"
  npm run sams:install
  if [ $? -ne 0 ]; then
    echo -e "${RED}[X] Failed to install SAMS dependencies${NC}"
    exit 1
  fi
fi

if [ ! -d "apps/contracts/node_modules" ]; then
  echo -e "${YELLOW}[!] Installing Contracts dependencies...${NC}"
  npm run contracts:install
  if [ $? -ne 0 ]; then
    echo -e "${RED}[X] Failed to install Contracts dependencies${NC}"
    exit 1
  fi
fi

echo ""
echo -e "${GREEN}[+] Starting services...${NC}"
echo ""

# Create a temp directory for PIDs
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Function to handle cleanup
cleanup() {
  echo ""
  echo -e "${YELLOW}[*] Shutting down services...${NC}"
  kill $PROXY_PID 2>/dev/null
  kill $SAMS_PID 2>/dev/null
  kill $CONTRACTS_PID 2>/dev/null
  echo -e "${GREEN}[✓] Services stopped${NC}"
}

trap cleanup SIGINT SIGTERM

# Start services in background
echo -e "${GREEN}[1/3] Starting Main Proxy (port 8000)${NC}"
npm run dev > "$TEMP_DIR/proxy.log" 2>&1 &
PROXY_PID=$!

sleep 2

echo -e "${GREEN}[2/3] Starting SAMS (port 3000)${NC}"
npm run sams:dev > "$TEMP_DIR/sams.log" 2>&1 &
SAMS_PID=$!

sleep 2

echo -e "${GREEN}[3/3] Starting Contracts (port 3100)${NC}"
npm run contracts:dev > "$TEMP_DIR/contracts.log" 2>&1 &
CONTRACTS_PID=$!

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  All services started! Access at:                      ║"
echo "║  Main:      http://localhost:8000                      ║"
echo "║  SAMS:      http://localhost:3000                      ║"
echo "║  Contracts: http://localhost:3100                      ║"
echo "║                                                        ║"
echo "║  Press Ctrl+C to stop all services                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Wait for all processes
wait
