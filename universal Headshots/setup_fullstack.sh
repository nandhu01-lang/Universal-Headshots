#!/bin/bash

# Global Pro AI - Mobile Setup Script (v2)
# Purpose: Initialize project directory, backend, and Expo mobile frontend.

PROJECT_ROOT="/home/lazyclad/.gemini/antigravity/scratch/global-pro-ai"

echo "🚀 Initializing Global Pro AI Full-Stack Project..."

# 1. Setup Backend
cd "$PROJECT_ROOT/backend"
npm install

# 2. Setup Mobile App
cd "$PROJECT_ROOT/app_mobile"
npm install --legacy-peer-deps

echo "📂 Project initialized."

# 3. Final Instructions
echo ""
echo "✅ Full-Stack Setup Complete!"
echo "Next Steps:"
echo "1. Run 'npm run dev' inside '$PROJECT_ROOT/backend'"
echo "2. Run 'npx expo start' inside '$PROJECT_ROOT/app_mobile'"
echo "3. Ensure your Firebase service-account.json is in '$PROJECT_ROOT/backend/src/config/'"
EOT
