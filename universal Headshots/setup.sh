#!/bin/bash

# Global Pro AI - Setup Script
# Purpose: Initialize project directory, dependencies, and environment templates.

PROJECT_ROOT="/home/lazyclad/.gemini/antigravity/scratch/global-pro-ai"

echo "🚀 Initializing Global Pro AI Project..."

# 1. Create Directory Structure
mkdir -p "$PROJECT_ROOT/backend/src/config"
mkdir -p "$PROJECT_ROOT/backend/src/handlers"
mkdir -p "$PROJECT_ROOT/backend/src/services"
mkdir -p "$PROJECT_ROOT/backend/src/routes"
mkdir -p "$PROJECT_ROOT/frontend/src/pages"
mkdir -p "$PROJECT_ROOT/frontend/src/components"
mkdir -p "$PROJECT_ROOT/docs"

echo "📂 Directory structure created."

# 2. Setup Backend package.json
cat <<EOT > "$PROJECT_ROOT/backend/package.json"
{
  "name": "global-pro-ai-backend",
  "version": "1.0.0",
  "type": "module",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.4.5",
    "firebase-admin": "^12.0.0",
    "@google/genai": "^0.3.0",
    "@google-cloud/storage": "^7.7.0",
    "sharp": "^0.33.2",
    "revenuecat-node": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.0"
  }
}
EOT

echo "📦 Backend package.json initialized."

# 3. Create .env Template
cat <<EOT > "$PROJECT_ROOT/backend/.env.template"
PORT=3001
FIREBASE_PROJECT_ID=your-project-id
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=config/service-account.json
REVENUECAT_API_KEY=your-api-key
VERTEX_AI_ENDPOINT=us-central1-aiplatform.googleapis.com
EOT

echo "🔑 .env template created. Please configure secrets before starting."

# 4. Setup Frontend vite.config.ts
cat <<EOT > "$PROJECT_ROOT/frontend/vite.config.ts"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
EOT

echo "🎨 Frontend Vite config initialized."

# 5. Final Instructions
echo ""
echo "✅ Setup Complete!"
echo "Next Steps:"
echo "1. CD into '$PROJECT_ROOT/backend' and run 'npm install'"
echo "2. CD into '$PROJECT_ROOT/frontend' and run 'npm install'"
echo "3. Add your Firebase service-account.json to '$PROJECT_ROOT/backend/src/config/'"
echo "4. Copy .env.template to .env and fill in the secrets."
echo "5. Run 'npm run dev' in both directories to start the app."
