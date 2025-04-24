#!/bin/bash

set -e

# Check if a domain is provided
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <domain> <port>"
  exit 1
fi

DOMAIN=$1
PORT=$2
IP=$(dig +short $DOMAIN)

if [ -z "$IP" ]; then
  IP=$DOMAIN
fi

KNOWN_HOSTS_FILE="infrastructure/known-hosts"

# Ensure the known-hosts file exist
touch "$KNOWN_HOSTS_FILE"

# Remove existing entry for the domain from the known-hosts file
ssh-keygen -R "[$DOMAIN]:$PORT" -f "$KNOWN_HOSTS_FILE" || true
ssh-keygen -R "[$IP]:$PORT" -f "$KNOWN_HOSTS_FILE" || true

# Initialize keyscan result variable
KEYSCAN_RESULT=""

# Attempt to fetch the new SSH public key for the domain
while [ -z "$KEYSCAN_RESULT" ]; do

  if [ "$DOMAIN" == "$IP" ]; then
    # Use `|| true` to prevent script exit if ssh-keyscan fails
    KEYSCAN_RESULT=$(ssh-keyscan -p $PORT "$IP" 2>/dev/null) || true
  else
    # Use `|| true` to prevent script exit if ssh-keyscan fails
    KEYSCAN_RESULT=$(ssh-keyscan -p $PORT "$DOMAIN" "$IP" 2>/dev/null) || true
  fi

  # Check if ssh-keyscan was successful
  if [ -z "$KEYSCAN_RESULT" ]; then
    echo "Error: Could not obtain SSH public key for $DOMAIN."
    echo "This usually means the domain is not reachable which might be because your VPN client is not running."

    # Ask user if they want to try again
    read -p "Do you want to try again (y/n)? " answer
    case $answer in
      [Yy]* ) KEYSCAN_RESULT="";; # Clear KEYSCAN_RESULT to retry
      * ) echo "Exiting."; exit 1;;
    esac
  fi
done

# Append the new key to the known-hosts file
echo "$KEYSCAN_RESULT" >> "$KNOWN_HOSTS_FILE"

echo "Updated known hosts entry for $DOMAIN in $KNOWN_HOSTS_FILE"
rm -f $KNOWN_HOSTS_FILE.old
