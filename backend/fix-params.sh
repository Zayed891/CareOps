#!/bin/bash

# Fix TypeScript errors related to req.params.id and where clauses
# These need to cast params as string to avoid 'string | string[]' errors

echo "Fixing parameter type errors in controllers..."

for file in /Users/jayedakhtar/10xEngineer/CareOps/careops/backend/src/controllers/*.ts; do
  echo "Processing $(basename "$file")..."
  # Fix req.params.id assignments
  sed -i'' -e 's/const { id } = req.params;/const id = req.params.id as string;/g' "$file"
  # Fix where clauses with id
  sed -i'' -e 's/where: { id,/where: { id: id as string,/g' "$file"
  sed -i'' -e 's/where: { id }/where: { id: id as string }/g' "$file"
  sed -i'' -e 's/where: id,/where: { id: id as string },/g' "$file"
  sed -i'' -e 's/serviceTypeId: id/serviceTypeId: id as string/g' "$file"
  sed -i'' -e 's/serviceTypeId: id }/serviceTypeId: id as string }/g' "$file"
done

echo "Cleaning up backup files..."
rm -f /Users/jayedakhtar/10xEngineer/CareOps/careops/backend/src/controllers/*-e

echo "Done! All controllers have been updated."
