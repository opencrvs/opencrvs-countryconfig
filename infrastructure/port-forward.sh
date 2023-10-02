#!/bin/bash
set -euo pipefail

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

if [ "$#" -ne 3 ]; then
  echo -e "${RED}Usage: ./port-forward <target server address> <container:port> <local port>${NC}"
  exit 1
fi

TARGET_SERVER="$1"
CONTAINER_PORT="$2"
LOCAL_PORT="$3"

TARGET_CONTAINER_NAME=$(echo $CONTAINER_PORT | cut -d: -f1)
PORT=$(echo $CONTAINER_PORT | cut -d: -f2)

# Generate the socat container's name
CONTAINER_NAME="tunnel_${TARGET_CONTAINER_NAME}_$(whoami)"

# Generate a random port between 30000 and 60000 for socat inside the host machine
SOCAT_PORT=$(( 30000 + RANDOM % 30001 ))

echo -e "${YELLOW}Setting up port forwarding...${NC}"
echo -e "Local Port: ${GREEN}$LOCAL_PORT${NC}"
echo -e "Target Server: ${GREEN}$TARGET_SERVER${NC}"
echo -e "Container and Port: ${GREEN}$TARGET_CONTAINER_NAME:$PORT${NC}"
echo -e "Internal socat Port on Host: ${GREEN}$SOCAT_PORT${NC}"
echo -e "Socat Container Name: ${GREEN}$CONTAINER_NAME${NC}"

ssh -tL $LOCAL_PORT:localhost:$SOCAT_PORT root@$TARGET_SERVER \
'docker run --rm --name '$CONTAINER_NAME' --network=opencrvs_overlay_net --publish '$SOCAT_PORT:$SOCAT_PORT' alpine/socat tcp-listen:'$SOCAT_PORT',fork,reuseaddr tcp-connect:'$TARGET_CONTAINER_NAME:$PORT''

echo -e "${GREEN}Port forwarding established and tunnel is online! Press Ctrl+C to close.${NC}"
