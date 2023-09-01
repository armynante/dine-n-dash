#!/bin/bash

# Loop through the specified directories
for dir in apps/* packages/* tools/*; do
  # Skip the node_modules directory
  if [[ $dir == *"node_modules"* ]]; then
    continue
  fi

  # Remove .js and .d.ts files
  find $dir -type f \( -name "*.js" -o -name "*.d.ts" \) -exec rm {} +
done