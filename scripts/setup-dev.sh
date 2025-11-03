#!/bin/bash

echo "🚀 Setting up Moria Backend - Development Environment"
echo "======================================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Create necessary directories
echo -e "\n${YELLOW}📁 Creating directories...${NC}"
mkdir -p apps/backend/logs
mkdir -p nginx/logs
mkdir -p nginx/ssl
mkdir -p docker/postgres/init

# Install backend dependencies
echo -e "\n${YELLOW}📦 Installing backend dependencies...${NC}"
cd apps/backend
npm install

# Generate Prisma client
echo -e "\n${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

# Start PostgreSQL
echo -e "\n${YELLOW}🐳 Starting PostgreSQL...${NC}"
cd ../../docker
docker-compose up -d postgres

echo -e "\n${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
sleep 10

# Run migrations
echo -e "\n${YELLOW}🗄️  Running database migrations...${NC}"
cd ../apps/backend
npx prisma migrate dev --name init

# Start all services
echo -e "\n${YELLOW}🚀 Starting all services...${NC}"
cd ../../docker
docker-compose up -d

echo -e "\n${GREEN}✅ Setup completed successfully!${NC}"
echo -e "\n${YELLOW}📝 Available services:${NC}"
echo -e "   - Frontend: ${GREEN}http://localhost${NC}"
echo -e "   - Backend API: ${GREEN}http://localhost/api${NC}"
echo -e "   - Backend Direct: ${GREEN}http://localhost:3001${NC}"
echo -e "   - PostgreSQL: ${GREEN}localhost:5432${NC}"
echo -e "\n${YELLOW}📋 Useful commands:${NC}"
echo -e "   - View logs: ${GREEN}docker-compose logs -f${NC}"
echo -e "   - Stop services: ${GREEN}docker-compose down${NC}"
echo -e "   - Restart services: ${GREEN}docker-compose restart${NC}"
echo -e "   - Prisma Studio: ${GREEN}cd apps/backend && npx prisma studio${NC}"
