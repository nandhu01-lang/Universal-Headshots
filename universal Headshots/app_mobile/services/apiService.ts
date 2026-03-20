import Constants from '../constants/Constants';

export interface GenerateParams {
  userId: string;
  images: string[]; // Base64 or URIs
  gender: string;
  styleId: string;
}

export const apiService = {
  /**
   * Trigger the AI generation process
   */
  generateHeadshots: async (params: GenerateParams) => {
    try {
      const response = await fetch(Constants.ENDPOINTS.GENERATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * Fetch user data and credits
   */
  getUserCredits: async (userId: string) => {
    try {
      const response = await fetch(`${Constants.API_URL}/user/${userId}/credits`);
      if (!response.ok) throw new Error('Failed to fetch credits');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * Check for batch status (polling or one-time)
   */
  getBatchStatus: async (batchId: string) => {
    try {
      const response = await fetch(`${Constants.API_URL}/batch/${batchId}/status`);
      if (!response.ok) throw new Error('Failed to fetch batch status');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * Trigger single-image refinement
   */
  refineImage: async (userId: string, imagePath: string, prompt: string) => {
    try {
      const response = await fetch(`${Constants.API_URL}/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, imagePath, prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Refinement failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};
