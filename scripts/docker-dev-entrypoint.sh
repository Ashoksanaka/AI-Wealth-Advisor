#!/bin/sh
set -e

./node_modules/.bin/prisma generate
./node_modules/.bin/prisma migrate deploy

exec npm run dev
