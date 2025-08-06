#!/bin/bash

# Create necessary directories
mkdir -p src/app/\(app\)/\(tabs\)/\(home\)
mkdir -p src/app/\(app\)/\(tabs\)/challenges/\[id\]
mkdir -p src/app/\(app\)/\(tabs\)/settings

# Move files to correct locations
mv src/app/\(tabs\)/\(home\)/* src/app/\(app\)/\(tabs\)/\(home\)/
mv src/app/\(tabs\)/challenges/* src/app/\(app\)/\(tabs\)/challenges/
mv src/app/\(tabs\)/settings/* src/app/\(app\)/\(tabs\)/settings/
mv src/app/\(tabs\)/_layout.tsx src/app/\(app\)/\(tabs\)/_layout.tsx

# Remove old directories
rm -rf src/app/\(tabs\)
rm -rf src/app/\(app\)/challenges 