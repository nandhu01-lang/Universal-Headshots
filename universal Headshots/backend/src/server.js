import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import multer from 'multer';
import { db, bucket } from './config/firebase.js';
import { checkFraud } from './services/fraudService.js';
import { handleRevenueCatWebhook } from './handlers/paymentHandler.js';
import { createBatchJob } from './services/aiEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Multer for memory storage (we'll upload to GCS manually)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => res.send('Global Pro AI API is online 💎'));

/**
 * Generation Endpoint (Real Integration)
 */
app.post('/api/generate', upload.array('photos', 8), async (req, res) => {
  try {
    const { userId, deviceId, tier, gender } = req.body;
    const files = req.files;

    if (!files || files.length < 4) {
      return res.status(400).json({ error: 'Minimum 4 photos required' });
    }

    // 1. Fraud Check for Free Tier
    if (tier === 'FREE') {
      const fraudResult = await checkFraud(deviceId);
      if (!fraudResult.allowed) {
        return res.status(403).json(fraudResult);
      }
    }

    // 2. Upload photos to GCS
    const userPhotos = [];
    for (const file of files) {
      const gcsFile = bucket.file(`uploads/${userId}/${Date.now()}_${file.originalname}`);
      await gcsFile.save(file.buffer, { contentType: file.mimetype });
      userPhotos.push(`gs://${bucket.name}/${gcsFile.name}`);
    }

    // 3. Trigger Vertex AI Batch Job
    const result = await createBatchJob(userId, gender, userPhotos);
    res.json({ status: 'SUCCESS', ...result });

  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Fetch Batch History for a User
 */
app.get('/api/user/:userId/batches', async (req, res) => {
  try {
    const { userId } = req.params;
    const snapshot = await db.collection('Batches')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();

    const batches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(batches);
  } catch (error) {
    console.error('History Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * RevenueCat Webhook Listener
 */
app.post('/api/webhooks/revenuecat', handleRevenueCatWebhook);

app.listen(PORT, () => {
  console.log(`🚀 Global Pro AI Backend running on http://localhost:${PORT}`);
});
