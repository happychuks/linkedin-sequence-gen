#!/bin/sh
# Exit on any error
set -e

# Run database migrations silently
npx prisma migrate deploy

# Execute the command passed to the script
exec "$@"
