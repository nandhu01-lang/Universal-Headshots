import * as FileSystem from 'expo-file-system/legacy';
import Constants from 'expo-constants';

/**
 * Universal Headshots - Identity & Fraud Service (Mobile)
 * Generates and persists a unique device ID for fraud prevention.
 */
export const idService = {
  getDeviceId: async (): Promise<string> => {
    const fs = FileSystem as any;
    const docDir = fs.documentDirectory || fs.cacheDirectory || '';
    const ID_FILE = `${docDir}device_id.txt`;
    
    try {
      const fileInfo = await fs.getInfoAsync(ID_FILE);
      
      if (fileInfo.exists) {
        const id = await fs.readAsStringAsync(ID_FILE);
        return id.trim();
      }

      const newId = Constants.installationId || `DEV-${Math.random().toString(36).substring(2, 15)}`;
      await fs.writeAsStringAsync(ID_FILE, newId);
      return newId;
    } catch (error) {
      console.error('ID Service Error:', error);
      return 'FALLBACK-DEVICE-ID';
    }
  }
};
