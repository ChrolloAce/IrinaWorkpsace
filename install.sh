#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Permit Management Dashboard...${NC}"

# Check if npm is installed
if ! [ -x "$(command -v npm)" ]; then
  echo -e "${YELLOW}Error: npm is not installed.${NC}" >&2
  echo "Please install Node.js and npm first (https://nodejs.org/)"
  exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Create necessary directories
echo -e "${YELLOW}Creating project structure...${NC}"
mkdir -p public/images

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
  echo -e "${YELLOW}Creating environment file...${NC}"
  echo "NEXT_PUBLIC_APP_URL=http://localhost:3000" > .env.local
fi

echo -e "${GREEN}Setup completed!${NC}"
echo -e "You can now start the development server with: ${YELLOW}npm run dev${NC}"
echo -e "Then open ${YELLOW}http://localhost:3000${NC} in your browser." 