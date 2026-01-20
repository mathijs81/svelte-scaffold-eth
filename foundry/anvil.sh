#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Help: `anvil.sh --help`
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  echo "Anvil Helper Script - Start, stop, or restart local Foundry node"
  echo
  echo "Usage: ./anvil.sh [OPTION]"
  echo
  echo "Options:"
  echo "   (no args)        Start anvil if not already running"
  echo "   -r, --restart    Restart anvil"
  echo "   -k, --kill       Kill anvil"
  echo "   -h, --help       Show this help message"
  echo
  echo "Anvil runs on http://localhost:8545 by default"
  echo "Logs are written to anvil.log in the current directory"
  echo
  exit 0
fi

# Kill anvil: `anvil.sh --kill`
if [ "$1" = "-k" ] || [ "$1" = "--kill" ]; then
  if pkill -f "anvil"; then
    echo -e "${RED}✗${NC} Anvil killed"
  else
    echo -e "${YELLOW}⚠${NC} Anvil was not running"
  fi
  exit 0
fi

# Restart anvil: `anvil.sh --restart`
if [ "$1" = "-r" ] || [ "$1" = "--restart" ]; then
  if pkill -f "anvil"; then
    echo -e "${YELLOW}↻${NC} Restarting Anvil..."
  else
    echo -e "${YELLOW}⚠${NC} Anvil was not running, starting..."
  fi
  sleep 1
fi

# Test if anvil is already running
if command -v nc >/dev/null 2>&1; then
  # Use netcat to test port
  if nc -z localhost 8545 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Anvil already running on http://localhost:8545"
    exit 0
  fi
elif command -v lsof >/dev/null 2>&1; then
  # Fallback to lsof
  if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Anvil already running on http://localhost:8545"
    exit 0
  fi
fi

# Check if anvil is installed
if ! command -v anvil >/dev/null 2>&1; then
  echo -e "${RED}✗${NC} Error: anvil not found. Please install Foundry first:"
  echo "  curl -L https://foundry.paradigm.xyz | bash"
  echo "  foundryup"
  exit 1
fi

# Start anvil
echo -e "${YELLOW}⏳${NC} Starting Anvil..."
anvil > ./anvil.log 2>&1 &

# Wait for anvil to be ready (max 10 seconds)
COUNTER=0
while [ $COUNTER -lt 10 ]; do
  if grep -q "Listening" ./anvil.log 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Anvil started on http://localhost:8545"
    echo
    echo "Available test accounts (with 10000 ETH each):"
    echo "Run 'tail -f anvil.log' to see live logs"
    exit 0
  fi
  sleep 1
  COUNTER=$((COUNTER + 1))
done

# If we get here, anvil didn't start properly
echo -e "${RED}✗${NC} Failed to start Anvil. Check anvil.log for details:"
tail -20 ./anvil.log
exit 1
