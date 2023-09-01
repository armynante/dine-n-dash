#!/bin/bash

# Loop through the specified directories
for src_dir in apps/** packages/** tools/**; do
  # Skip the node_modules directory
  if [[ $src_dir == *"node_modules"* ]]; then
    continue
  fi

  # Determine the parent directory of the src directory
  parent_dir=$(dirname "$src_dir")

  # Remove .js and .d.ts files
  find $src_dir -type f \( -name "*.js" -o -name "*.d.ts" -o -name "*.js.map" -o -name "*.ts.map" \) -exec rm {} +

  # Remove tsconfig.tsbuildinfo in the parent directory
  # Remove /dist directory
  rm -rf $src_dir/dist 2> /dev/null || true # ignore errors
done

find ./apps ./packages ./tools -name 'tsconfig.tsbuildinfo' -type f -delete
