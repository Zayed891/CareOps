#!/bin/bash

# Script to automatically fix common TypeScript errors in repository controllers

echo "Fixing TypeScript errors in all controllers..."

# Fix all TypeScript controllers at once by adding proper imports
for file in /Users/jayedakhtar/10xEngineer/CareOps/careops/backend/src/controllers/*.ts; do
  if grep -q "^import { Request, Response } from 'express';" "$file"; then
    echo "Fixing imports in $(basename "$file")..."
    sed -i.bak "s/^import { Request, Response } from 'express';/import { Response } from 'express';\nimport { AuthRequest } from '.\/..\/types\/express';/" "$file"
  fi
  
  if grep -q "async (req: Request, res: Response)" "$file"; then
    echo "Replacing Request with AuthRequest in $(basename "$file")..."
    sed -i.bak "s/async (req: Request, res: Response)/async (req: AuthRequest, res: Response)/g" "$file"
  fi
done

echo "Cleaning up backup files..."
rm -f /Users/jayedakhtar/10xEngineer/CareOps/careops/backend/src/controllers/*.bak

echo "Done! All controllers have been updated."
