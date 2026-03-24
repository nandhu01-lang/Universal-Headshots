const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://universal-headshots.onrender.com';
const API_URL = `${BASE_URL.replace(/\/$/, '')}/api`;

export default {
  API_URL,
  ENDPOINTS: {
    GENERATE: `${API_URL}/generate`,
    REFINE: `${API_URL}/refine`,
    STATUS: `${API_URL}/batch-status`,
    DOWNLOAD_ZIP: `${API_URL}/download-zip`,
    WEBHOOK: `${API_URL}/webhooks/revenuecat`,
  },
};
