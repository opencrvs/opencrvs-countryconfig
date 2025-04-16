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

for NODE in "${NODES[@]}"; do
  if multipass list | grep -q "^$NODE "; then
    echo "Removing existing VM: $NODE"
    multipass delete "$NODE"
    multipass purge
  fi
done

# Create VMs
for NODE in "${NODES[@]}"; do
  multipass launch --name "$NODE" --cpus 2 --memory 2G --disk 10G "$IMG"
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
echo -e "\n\nThis is the SSH_KEY , copy this and store it in a file with 600 permission, You will need this to run the ansible playbook:\n\n"
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

# Clean up private keys on manager
multipass exec manager -- sudo rm -f /tmp/ssh-key /tmp/ssh-key.pub

# Update inventory file with new IP addresses
echo "Updating inventory file with new IP addresses..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
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