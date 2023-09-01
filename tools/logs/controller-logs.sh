#!/bin/bash

# Function to switch back to default context
cleanup() {
  echo "Switching back to default Docker context..."
  docker context use default
}

# Register the cleanup function to run on Ctrl+C
trap cleanup INT

# Switch to your remote context
echo "Switching to remote Docker context..."
docker context rm diner-controller
docker context create diner-controller --docker "host=ssh://ec2-23-20-128-165.compute-1.amazonaws.com"
docker context use diner-controller
docker logs -t diner-controller -f

# Switch back to default context when script is done
cleanup
