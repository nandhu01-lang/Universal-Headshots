/**
 * Universal Headshots - Tier Configuration
 * Defines image limits, style limits, and model tiers
 */

export const TIERS = {
  FREE: {
    name: 'FREE',
    price: 0,
    maxImages: 2,
    maxStyles: 1,
    quality: 'fast', // Uses cheaper/faster model
    watermark: true,
    galleryHours: 24,
    priorityProcessing: false,
    model: 'imagen-3-0-fast-generate-001' // Low-cost model
  },
  STARTER: {
    name: 'STARTER',
    price: 9.99,
    maxImages: 20,
    maxStyles: 5,
    quality: 'ultra',
    watermark: false,
    galleryHours: -1, // Unlimited
    priorityProcessing: true,
    model: 'imagen-3-ultra-generate-001'
  },
  PRO: {
    name: 'PRO',
    price: 19.99,
    maxImages: 50,
    maxStyles: Infinity, // Unlimited
    quality: 'ultra',
    watermark: false,
    galleryHours: -1, // Unlimited
    priorityProcessing: true,
    model: 'imagen-3-ultra-generate-001'
  }
};

export const BONUS_PACKS = {
  SMALL: {
    name: 'SMALL',
    price: 7,
    editCount: 2,
    generateCount: 8
  },
  MEDIUM: {
    name: 'MEDIUM',
    price: 12,
    editCount: 5,
    generateCount: 20
  },
  LARGE: {
    name: 'LARGE',
    price: 18,
    editCount: 10,
    generateCount: 40
  }
};

/**
 * Get tier config by tier name
 */
export function getTierConfig(tier) {
  return TIERS[tier?.toUpperCase()] || TIERS.FREE;
}

/**
 * Get available styles for a tier
 * Filters the full style list based on tier limits
 */
export function getAvailableStyles(allStyles, tier) {
  const config = getTierConfig(tier);
  
  if (config.maxStyles === Infinity) {
    return allStyles; // All styles available
  }
  
  // Return only the first N styles based on tier limit
  // In production, you might want to prioritize popular styles
  return allStyles.slice(0, config.maxStyles);
}

/**
 * Validate image count for tier
 */
export function validateImageCount(requestedCount, tier) {
  const config = getTierConfig(tier);
  
  if (requestedCount > config.maxImages) {
    return {
      valid: false,
      maxAllowed: config.maxImages,
      message: `Maximum ${config.maxImages} images allowed for ${config.name} tier. Upgrade to get more!`
    };
  }
  
  return { valid: true };
}

/**
 * Get model for tier
 */
export function getModelForTier(tier) {
  const config = getTierConfig(tier);
  return config.model;
}
