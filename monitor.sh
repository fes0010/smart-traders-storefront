#!/bin/bash
# Monitor Smart Traders Storefront
# Usage: ./monitor.sh

CONTAINER_NAME="smart-traders-storefront"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📊 Smart Traders Storefront Monitoring${NC}"
echo "======================================="
echo ""

# Check if container exists
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo -e "${RED}❌ Container not found${NC}"
    exit 1
fi

# Container status
STATUS=$(docker inspect --format='{{.State.Status}}' $CONTAINER_NAME)
if [ "$STATUS" == "running" ]; then
    echo -e "${GREEN}✅ Status: Running${NC}"
else
    echo -e "${RED}❌ Status: $STATUS${NC}"
fi

# Health status
HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null || echo "no healthcheck")
if [ "$HEALTH" == "healthy" ]; then
    echo -e "${GREEN}✅ Health: Healthy${NC}"
elif [ "$HEALTH" == "unhealthy" ]; then
    echo -e "${RED}❌ Health: Unhealthy${NC}"
else
    echo -e "${YELLOW}⚠️  Health: $HEALTH${NC}"
fi

# Uptime
STARTED=$(docker inspect --format='{{.State.StartedAt}}' $CONTAINER_NAME)
echo -e "${BLUE}⏰ Started: $STARTED${NC}"

# Resource usage
echo ""
echo -e "${BLUE}💻 Resource Usage:${NC}"
docker stats $CONTAINER_NAME --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# Port mapping
echo ""
echo -e "${BLUE}🌐 Port Mapping:${NC}"
docker port $CONTAINER_NAME

# Recent logs
echo ""
echo -e "${BLUE}📝 Recent Logs (last 20 lines):${NC}"
docker logs $CONTAINER_NAME --tail 20

# Test endpoint
echo ""
echo -e "${BLUE}🔍 Testing Endpoint...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
    echo -e "${GREEN}✅ HTTP 200 OK${NC}"
else
    echo -e "${RED}❌ Endpoint not responding${NC}"
fi

# Container restart count
RESTART_COUNT=$(docker inspect --format='{{.RestartCount}}' $CONTAINER_NAME)
echo ""
echo -e "${BLUE}🔄 Restart Count: $RESTART_COUNT${NC}"

if [ "$RESTART_COUNT" -gt 3 ]; then
    echo -e "${RED}⚠️  High restart count detected!${NC}"
fi


