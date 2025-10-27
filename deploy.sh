#!/bin/bash
# Smart Traders Storefront - Production Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="fes0010/smart-traders-storefront:latest"
CONTAINER_NAME="smart-traders-storefront"
PORT="3001"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Pull latest image
echo -e "${YELLOW}📥 Pulling latest image...${NC}"
docker pull $IMAGE_NAME

# Stop old container
echo -e "${YELLOW}🛑 Stopping old container...${NC}"
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# Start new container
echo -e "${YELLOW}🚀 Starting new container...${NC}"
docker run -d \
  --name $CONTAINER_NAME \
  --restart unless-stopped \
  -p $PORT:3000 \
  --memory="512m" \
  --cpus="1.0" \
  --health-cmd="wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  --health-start-period=40s \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_SUPABASE_URL=https://supabase.munene.shop \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE} \
  -e NEXT_PUBLIC_STORE_NAME="Smart Traders Store" \
  -e NEXT_PUBLIC_CURRENCY=KES \
  -e NEXT_PUBLIC_ENABLE_REAL_TIME=true \
  -e NEXT_PUBLIC_SHOW_STOCK_COUNT=true \
  -e NEXT_PUBLIC_LOW_STOCK_THRESHOLD=10 \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  $IMAGE_NAME

# Wait for health check
echo -e "${YELLOW}⏳ Waiting for health check...${NC}"
sleep 5

# Check container status
if docker ps | grep -q $CONTAINER_NAME; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 Store is running on port $PORT${NC}"
    echo ""
    docker ps --filter name=$CONTAINER_NAME --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo -e "${GREEN}📊 View logs: docker logs -f $CONTAINER_NAME${NC}"
    echo -e "${GREEN}🔍 Health: docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME${NC}"
else
    echo -e "${RED}❌ Deployment failed${NC}"
    docker logs $CONTAINER_NAME --tail 50
    exit 1
fi

