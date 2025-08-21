#!/bin/bash

# Temporary script to resolve merge conflicts in context-aware-templates.ts
# by accepting HEAD version and removing conflict markers

cd /mnt/d/s7s-projects/AI-Marketing-Web-Builder

# Use git checkout --ours to accept our version
git checkout --ours web-builder/src/lib/api/context-aware-templates.ts
git checkout --ours web-builder/src/types/context-aware-templates.ts 2>/dev/null || echo "File doesn't exist or no conflicts"

echo "Resolved merge conflicts by accepting HEAD version"