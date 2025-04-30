#!/bin/bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# defaults, use options to override
FS_FILE=/cryptfs_file_sparse.img  # -f, --file
MOUNT_PATH=/data                  # -m, --mount
DEV_MAP_NAME=cryptfs              # -n, --name
                                  # -key, --encryptionKeyFilepath (required - path to a file containing the decryption passphrase in the format DISK_ENCRYPTION_KEY=XXXX.)
# options
while [[ "$1" =~ ^- && ! "$1" == "--" ]]; do case $1 in
  -f | --file )
    shift; FS_FILE=$1
    ;;
  -m | --mount )
    shift; MOUNT_PATH=$1
    ;;
  -n | --dev-map-name )
    shift; DEV_MAP_NAME=$1
    ;;
  -key | --encryptionKeyFilepath )
    shift; ENCRYPTION_KEY_FILE_PATH=$1
    ;;
esac; shift; done
if [[ "$1" == '--' ]]; then shift; fi

# In this example, we load the disk encryption password from a file.
# We recommend that the encryption key is served via a secure API from a Hardware Security Module
if [[ -z "$ENCRYPTION_KEY_FILE_PATH" ]]; then
  echo "ERROR: Disk encrytion key file path is required. Use -key or --encryptionKeyFilepath."
  exit 1
fi

source $ENCRYPTION_KEY_FILE_PATH

# create a loop device from the data file if it doesn't already exist
LOOP_DEVICE=$(losetup -j /cryptfs_file_sparse.img | awk '{print substr($1, 1, length($1)-1)}' | head -1)
echo $LOOP_DEVICE
if [[ -z "$LOOP_DEVICE" ]]; then
  LOOP_DEVICE=$(losetup --find --show $FS_FILE)
  echo "Created new loop device $LOOP_DEVICE"
else
  echo "Using existing loop device $LOOP_DEVICE"
fi

# open the LUKS device and set a mapping name
echo $DISK_ENCRYPTION_KEY | cryptsetup -d - luksOpen $LOOP_DEVICE $DEV_MAP_NAME || true

# mount the device to a folder
mount /dev/mapper/$DEV_MAP_NAME $MOUNT_PATH || true
