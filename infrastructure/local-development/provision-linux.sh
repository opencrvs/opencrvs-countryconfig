#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

#!/bin/bash
set -e

IMG="24.04"
NODES=("manager" "worker")

# Your local public key file
LOCAL_PUBKEY_FILE="$HOME/.ssh/id_rsa.pub"

# Check if public key exists
if [[ ! -f "$LOCAL_PUBKEY_FILE" ]]; then
  echo "Local SSH public key not found at $LOCAL_PUBKEY_FILE"
  echo "Generate one"
  exit 1
fi

LOCAL_PUBKEY=$(cat "$LOCAL_PUBKEY_FILE")

for NODE in "${NODES[@]}"; do
  if multipass list | grep -q "^$NODE "; then
    echo "Removing existing VM: $NODE"
    multipass delete "$NODE"
    multipass purge
  fi
done

# Create VMs
for NODE in "${NODES[@]}"; do
  multipass launch --name "$NODE" --cpus 2 --memory 2G --disk 15G "$IMG"
done

# Provision user setup script
PROVISION_CMDS=$(cat <<'EOF'
sudo addgroup --gid 1100 provision
sudo adduser --gecos "OpenCRVS Provisioning user" --disabled-password --uid 1100 --gid 1100 provision
sudo usermod -aG sudo provision
echo 'provision ALL=(ALL) NOPASSWD:ALL' | sudo tee -a /etc/sudoers
EOF
)

# Run user creation on both VMs
for NODE in "${NODES[@]}"; do
  echo "Provisioning user on $NODE..."
  echo "$PROVISION_CMDS" | multipass exec "$NODE" -- bash
done

# SSH keygen on manager
echo "Generating SSH key on manager..."
multipass exec manager -- bash -c '
sudo -u provision mkdir -p /home/provision/.ssh
sudo ssh-keygen -t rsa -f /tmp/ssh-key -N ""
sudo cat /tmp/ssh-key.pub | sudo tee -a /home/provision/.ssh/authorized_keys > /dev/null
sudo chmod 600 /home/provision/.ssh/authorized_keys
sudo chown -R provision:provision /home/provision/.ssh
echo -e "\n\nThis is the SSH_KEY , copy this and store it in a file with 600 permission, You may need this to run the ansible playbook:\n\n"
sudo cat /tmp/ssh-key
'

# Copy pub key from manager to worker
echo "Copying pubkey to worker..."
PUBKEY=$(multipass exec manager -- cat /tmp/ssh-key.pub)
multipass exec worker -- bash -c "
sudo -u provision mkdir -p /home/provision/.ssh
sudo -u provision bash -c 'echo \"$PUBKEY\" >> /home/provision/.ssh/authorized_keys'
sudo chmod 600 /home/provision/.ssh/authorized_keys
sudo chown -R provision:provision /home/provision/.ssh
"

# Copy local public key to all nodes and adding node IPs to known_hosts 
for NODE in "${NODES[@]}"; do
  echo "Setting up SSH key on $NODE..."
  multipass exec "$NODE" -- bash -c "
    echo \"$LOCAL_PUBKEY\" | sudo -u provision tee -a /home/provision/.ssh/authorized_keys > /dev/null
  "
  IP=$(multipass info "$NODE" | grep "IPv4:" | awk '{print $2}')
  echo "Adding $NODE ($IP) to known_hosts..."
  ssh-keyscan -H "$IP" >> ~/.ssh/known_hosts 2>/dev/null
done

# Clean up private keys on manager
multipass exec manager -- sudo rm -f /tmp/ssh-key /tmp/ssh-key.pub

# Update inventory file with new IP addresses
echo "Updating inventory file with new IP addresses..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "$SCRIPT_DIR/local.linux.yml.template" "$SCRIPT_DIR/local.linux.yml"
INVENTORY_FILE="$SCRIPT_DIR/local.linux.yml"

MANAGER_IP=$(multipass list | awk '/manager/ {print $3}')
WORKER_IP=$(multipass list | awk '/worker/ {print $3}')

if [[ -z "$MANAGER_IP" || -z "$WORKER_IP" ]]; then
  echo "Failed to retrieve IP addresses from multipass."
  exit 1
fi

sed -i "s/ansible_host: '.*'/ansible_host: '$MANAGER_IP'/" "$INVENTORY_FILE"
sed -i "0,/ansible_host: '$MANAGER_IP'/!s/ansible_host: '.*'/ansible_host: '$WORKER_IP'/" "$INVENTORY_FILE"

echo "Inventory updated successfully."