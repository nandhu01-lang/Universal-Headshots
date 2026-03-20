# 💎 Universal Headshots - Full-Stack Mobile App

A production-grade AI Headshot application powered by our proprietary **Neural Studio Engine**, **Node.js**, and **Expo (Universal Mobile)**.

## 🚀 One-Click Setup
Run the following command to initialize both the backend and mobile modules:
```bash
bash setup_fullstack.sh
```

## 📂 Project Structure
- **[/v2/server](file:///home/lazyclad/.gemini/antigravity/scratch/global-pro-ai/v2/server)**: Express.js server with Proprietary AI Batch Prediction, Firebase Admin, and RevenueCat webhooks.
- **[/v2/frontend](file:///home/lazyclad/.gemini/antigravity/scratch/global-pro-ai/v2/frontend)**: Vite-powered React dashboard with premium glassmorphism.
- **[/app_mobile](file:///home/lazyclad/.gemini/antigravity/scratch/global-pro-ai/app_mobile)**: Expo Router (SDK 55) mobile app with NativeWind (Tailwind), Moti animations, and Lucide icons.

## 📱 Mobile Features
- **Native Image Picker**: Optimized for 8-12 photos for AI training.
- **Glassmorphic UI**: High-end mobile-native dashboard with dark theme.
- **Real-time Rendering**: Moti animated progress tracker for AI batch processing.
- **Archives**: Dedicated gallery screen with native sharing functionality.

## 🔧 Backend Configuration
1.  **Firebase**: Add your `service-account.json` to `v2/server/src/config/`.
2.  **Environment**: Copy `v2/server/.env.template` to `v2/server/.env` and fill in your GCP secrets.
3.  **Run Backend**: `cd v2/server && npm run dev`

## 🛠 Mobile Development
1.  **Install dependencies**: `cd app_mobile && npm install --legacy-peer-deps`
2.  **Start Expo**: `npx expo start`
3.  **View via Expo Go**: Scan the QR code on your physical device.

---
**Status**: 🟢 Full-Stack Mobile Pivot Complete
