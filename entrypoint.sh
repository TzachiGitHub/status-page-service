#!/bin/sh
set -e

echo "Running Prisma migrations..."
node node_modules/prisma/build/index.js migrate deploy

# Seed only if no organizations exist (first run)
NEEDS_SEED=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.organization.count().then(c => { console.log(c === 0 ? 'yes' : 'no'); p.\$disconnect(); }).catch(() => { console.log('yes'); p.\$disconnect(); });
")

if [ "$NEEDS_SEED" = "yes" ]; then
  echo "Seeding database..."
  node dist/seed/seed.js
fi

echo "Starting server..."
exec node dist/index.js
