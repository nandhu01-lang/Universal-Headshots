import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

if (process.env.VERTEX_CREDENTIALS_JSON) {
  try {
    // [THE LEAD ARCHITECT] Fixed: Write to /tmp for serverless compatibility (Vercel/Railway)
    const credsPath = path.join('/tmp', 'vertex-key-temp.json');
    fs.writeFileSync(credsPath, process.env.VERTEX_CREDENTIALS_JSON);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
    console.log('[Setup] Vertex AI credentials written to temp file');
  } catch (err) {
    console.error('Failed to write vertex credentials:', err.message);
  }
}

import { db as firebaseDb, bucket, auth as firebaseAuth } from './config/firebase.js';
import { db as supabaseDb, supabase } from './config/supabase.js';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { checkFraud, markFreeTrialUsed } from './services/fraudService.js';
import { createBatchJob, refineImage, getBatchStatus } from './services/aiEngine.js';
import { handleRevenueCatWebhook } from './handlers/paymentHandler.js';
import { handleSupportRequest } from './handlers/supportHandler.js';
import { createZipStream } from './services/zipService.js';
import { getTierConfig, validateImageCount, getModelForTier } from './config/tiers.js';
import { notifyHeadshotsReady } from './services/notificationService.js';
import logger from './utils/logger.js';

const db = supabase ? supabaseDb : firebaseDb;

// --- SECURITY MIDDLEWARE & CONFIG ---
// 1. Multer Validation
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB Limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  }
});

// 2. Auth Middleware
const verifyAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication Required' });

  try {
    if (supabase) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) throw new Error('Invalid Supabase Token');
      req.user = user;
    } else if (firebaseAuth) {
      const decodedToken = await firebaseAuth.verifyIdToken(token);
      req.user = decodedToken;
    } else {
      throw new Error('No Auth Provider Available');
    }
    next();
  } catch (error) {
    console.error('Auth Error:', error.message);
    res.status(401).json({ error: 'Invalid or Expired Token' });
  }
};

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later.' }
});

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use('/api/', limiter); // Apply rate limiting to all API routes

// Main Health/Info Route
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Universal Headshots Engine',
    version: '2.1.0'
  });
});

/**
 * Register Push Token
 * PROTECTED: Requires valid token
 * Saves the Expo push token for sending notifications
 */
app.post('/api/register-push-token', verifyAuth, async (req, res) => {
  try {
    const { userId, pushToken } = req.body;
    
    if (!pushToken) {
      return res.status(400).json({ error: 'Push token is required' });
    }

    // Save push token to user document
    if (supabase) {
      await db.users.update(userId, {
        push_token: pushToken
      });
    } else if (db && db.collection) {
      await db.collection('users').doc(userId).set({
        pushToken,
        pushTokenUpdatedAt: new Date().toISOString()
      }, { merge: true });
    }

    logger.info({ userId, token: pushToken.substring(0, 20) + '...' }, '📬 Push token registered');
    
    res.json({ success: true });
  } catch (error) {
    logger.error({ error: error.message }, '❌ Push token registration failed');
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

/**
 * Image Generation Endpoint (Batch V2)
 * PROTECTED: Requires valid token
 * 
 * Tier limits:
 * - FREE: 2 images, 1 style, fast model
 * - STARTER: 20 images, 5 styles, ultra model  
 * - PRO: 50 images, unlimited styles, ultra model
 */
app.post('/api/generate', verifyAuth, upload.array('photos', 12), async (req, res) => {
  try {
    const { userId, deviceId, tier, gender, country, imageCount } = req.body;
    const files = req.files;
    const selectedTier = (tier || 'FREE').toUpperCase();
    const tierConfig = getTierConfig(selectedTier);

    // 1. Validate minimum and maximum photos
    const minPhotos = 4;
    const maxPhotos = 8;
    if (!files || files.length < minPhotos) {
      return res.status(400).json({ 
        error: `Minimum ${minPhotos} photos required for neural training` 
      });
    }
    if (files.length > maxPhotos) {
      return res.status(400).json({ 
        error: `Maximum ${maxPhotos} photos allowed per batch` 
      });
    }

    // 2. Validate image count against tier limit
    const requestedCount = parseInt(imageCount) || tierConfig.maxImages;
    const validation = validateImageCount(requestedCount, selectedTier);
    if (!validation.valid) {
      return res.status(400).json({ 
        error: validation.message,
        maxImages: validation.maxAllowed,
        currentTier: selectedTier
      });
    }

    // 3. Senior Architect Fraud Prevention
    const fraudResult = await checkFraud(deviceId);
    if (!fraudResult.allowed && selectedTier === 'FREE') {
      return res.status(403).json(fraudResult);
    }

    // 4. Upload to GCS (or alternative storage)
    const userPhotos = [];
    if (bucket) {
      for (const file of files) {
        const gcsFile = bucket.file(`uploads/${userId}/${Date.now()}_${file.originalname}`);
        await gcsFile.save(file.buffer, { contentType: file.mimetype });
        userPhotos.push(`gs://${bucket.name}/${gcsFile.name}`);
      }
    } else {
      // [THE QC BOT] Fixed: Do not proceed without storage. AI engine will fail on empty gs:// paths.
      throw new Error("Storage bucket not configured. Cannot process images.");
    }

    // 5. Mark Trial Used if FREE
    if (selectedTier === 'FREE') {
      await markFreeTrialUsed(deviceId);
    }

    // 6. Get the model for this tier
    const model = getModelForTier(selectedTier);
    logger.info({ tier: selectedTier, model, imageCount: requestedCount }, '🎯 Using tier config');

    // 7. Trigger AI Batch Job
    const result = await createBatchJob(
      userId, 
      gender, 
      userPhotos, 
      selectedTier, 
      country || 'GLOBAL',
      requestedCount,
      model
    );
    
    res.json({ 
      status: 'SUCCESS', 
      ...result,
      tier: selectedTier,
      model,
      imageCount: requestedCount
    });

  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * RevenueCat Webhook
 */
app.post('/api/webhooks/revenuecat', handleRevenueCatWebhook);

/**
 * Support & Help Center
 */
app.post('/api/support', handleSupportRequest);

/**
 * Image Refinement ($5 Add-on)
 * PROTECTED: Requires valid token
 */
app.post('/api/refine', verifyAuth, async (req, res) => {
  try {
    const { userId, imagePath, prompt } = req.body;
    
    // Logic moved to atomic transaction in aiEngine
    const result = await refineImage(userId, imagePath, prompt);
    res.json(result);
  } catch (error) {
    if (error.message === 'INSUFFICIENT_CREDITS') {
      return res.status(403).json({ 
        error: 'Insufficient Refinement Credits',
        requiresUpgrade: true 
      });
    }
    res.status(500).json({ error: error.message });
  }
});

/**
 * Batch Status Polling
 * PROTECTED: Requires valid token
 */
app.get('/api/batch-status/:batchId', verifyAuth, async (req, res) => {
  try {
    const status = await getBatchStatus(req.params.batchId);
    if (!status) return res.status(404).json({ error: 'Batch not found' });
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Refinement Status Polling
 * PROTECTED: Requires valid token
 */
app.get('/api/refinement-status/:refineId', verifyAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await db.refinements.get(req.params.refineId);
      if (error || !data) return res.status(404).json({ error: 'Refinement not found' });
      return res.json(data);
    } else if (db && db.collection) {
      const doc = await db.collection('refinements').doc(req.params.refineId).get();
      if (!doc.exists) return res.status(404).json({ error: 'Refinement not found' });
      return res.json(doc.data());
    } else {
      return res.status(500).json({ error: 'Database not configured' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Download Batch as ZIP
 * PROTECTED: Requires valid token
 */
app.get('/api/download-zip', verifyAuth, async (req, res) => {
  try {
    const { userId, batchId } = req.query;
    if (!userId || !batchId) {
      return res.status(400).json({ error: 'Missing userId or batchId' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=UniversalHeadshots_${batchId}.zip`);

    await createZipStream(userId, batchId, res);
  } catch (error) {
    console.error('ZIP Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`💎 Universal Headshots V2 Backend running on port ${PORT}`);
});
