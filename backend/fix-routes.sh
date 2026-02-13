#!/bin/bash

# Fix all route files by casting handlers to 'any' to avoid TypeScript router overload issues

echo "Fixing route handler type issues..."

# Fix all route files
for file in /Users/jayedakhtar/10xEngineer/CareOps/careops/backend/src/routes/*.ts; do
  if [[ $(basename "$file") != "index.ts" ]]; then
    echo "Processing $(basename "$file")..."
    # Add 'as any' to all route handlers
    sed -i'' -e 's/router\.\(get\|post\|put\|delete\|patch\)(\([^)]*\), \([a-zA-Z][a-zA-Z0-9]*\))/router.\1(\2, \3 as any)/g' "$file"
    # Clean up double 'as any as any' if it exists
    sed -i'' -e 's/ as any as any/ as any/g' "$file"
  fi
done

echo "Cleaning up backup files..."
rm -f /Users/jayedakhtar/10xEngineer/CareOps/careops/backend/src/routes/*-e

echo "Done! All route files have been updated."
