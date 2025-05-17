#!/bin/bash

# Set up timestamp
DATE=$(date +"%Y-%m-%d_%H-%M-%S")

# Detect path to script and base directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$SCRIPT_DIR"
INSTANCE_DIR="$PROJECT_DIR/instance"
BACKUP_DIR="$PROJECT_DIR/backups"

# Ensure instance dir exists
if [ ! -d "$INSTANCE_DIR" ]; then
  echo "Error: instance/ folder not found."
  exit 1
fi

# Create backups dir if needed
mkdir -p "$BACKUP_DIR"

# Copy .db file(s)
cp "$INSTANCE_DIR"/*.db "$BACKUP_DIR/plantdb_$DATE.db"

echo "✅ Backup complete: $BACKUP_DIR/plantdb_$DATE.db"
