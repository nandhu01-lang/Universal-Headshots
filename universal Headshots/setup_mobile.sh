#!/bin/bash

# Global Pro AI - Mobile Setup Script
# Purpose: Initialize Expo project with Router and NativeWind.

PROJECT_ROOT="/home/lazyclad/.gemini/antigravity/scratch/global-pro-ai"
MOBILE_DIR="$PROJECT_ROOT/mobile"

echo "🚀 Initializing Global Pro AI Mobile Project (Expo)..."

# 1. Create Mobile Module
mkdir -p "$MOBILE_DIR"

# 2. Use npx create-expo-app to initialize
npx create-expo-app@latest "$MOBILE_DIR" --template tabs --no-install --yes

echo "📂 Expo project base created."

# 3. Add NativeWind & Tailwind Dependencies
cd "$MOBILE_DIR"
npm install nativewind@4.0.0-alpha.22 tailwindcss@3.4.1 react-native-reanimated react-native-safe-area-context react-native-screens expo-router expo-linking expo-constants expo-status-bar lucide-react-native framer-motion@12.0.0-alpha.0

echo "📦 NativeWind & dependencies added."

# 4. Initialize NativeWind
npx tailwindcss init

cat <<EOT > tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#8b5cf6", // Violet 500
        background: "#0A0A0F",
      },
    },
  },
  plugins: [],
};
EOT

cat <<EOT > metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
EOT

cat <<EOT > global.css
@tailwind base;
@tailwind components;
@tailwind utilities;
EOT

echo "🎨 NativeWind configured."

# 5. Final Instructions
echo ""
echo "✅ Mobile Setup Complete!"
echo "Next Steps:"
echo "1. CD into '$MOBILE_DIR' and run 'npm install'"
echo "2. Start with 'npx expo start'"
EOT
