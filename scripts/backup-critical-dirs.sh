#!/bin/bash
# Backup script for critical project directories
# Run this before major changes or branch switches

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
CRITICAL_DIRS=(".bmad-core" ".claude" "docs" "scripts")

echo "🔄 Creating backup in: $BACKUP_DIR"

mkdir -p "$BACKUP_DIR"

for dir in "${CRITICAL_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "📦 Backing up $dir..."
        cp -r "$dir" "$BACKUP_DIR/"
        echo "✅ $dir backed up"
    else
        echo "⚠️  Directory $dir not found"
    fi
done

# Create manifest
cat > "$BACKUP_DIR/BACKUP_MANIFEST.txt" << EOF
Backup created: $(date)
Git commit: $(git rev-parse HEAD)
Branch: $(git branch --show-current)
User: $(git config user.name)

Backed up directories:
$(for dir in "${CRITICAL_DIRS[@]}"; do 
    if [ -d "$dir" ]; then 
        echo "✅ $dir ($(find "$dir" -type f | wc -l) files)"
    else 
        echo "❌ $dir (NOT FOUND)"
    fi
done)

To restore:
cp -r $BACKUP_DIR/.bmad-core .
cp -r $BACKUP_DIR/.claude .
cp -r $BACKUP_DIR/docs .
cp -r $BACKUP_DIR/scripts .
EOF

echo "✅ Backup complete: $BACKUP_DIR"
echo "📄 Manifest: $BACKUP_DIR/BACKUP_MANIFEST.txt"