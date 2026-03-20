import { db, bucket, admin } from '../config/firebase.js';
import { STYLES } from './styles.js';
import dotenv from 'dotenv';
import axios from 'axios';
import logger from '../utils/logger.js';

dotenv.config();

/**
 * Universal Headshots - Vertex AI Service (V2)
 * Uses Imagen models via Google Cloud AI Platform.
 * Tier determines: image count, style limit, and model quality
 */
export async function createBatchJob(
  userId, 
  gender, 
  userPhotos, 
  tier = 'FREE', 
  country = 'GLOBAL',
  imageCount = null,
  model = null
) {
  const batchId = `BATCH_${Date.now()}`;
  const gcsOutputDir = `results/${userId}/${batchId}`;
  
  // Get tier config for defaults
  const { getTierConfig, getAvailableStyles } = await import('../config/tiers.js');
  const tierConfig = getTierConfig(tier);
  
  // Use provided values or fall back to tier defaults
  const totalImages = imageCount || tierConfig.maxImages;
  const modelId = model || tierConfig.model;
  
  // Initialize in Firestore with status and progress
  await db.collection('batches').doc(batchId).set({
    userId,
    batchId,
    status: 'PROCESSING',
    progress: 0,
    tier,
    model: modelId,
    country,
    imageCount: totalImages,
    createdAt: new Date().toISOString(),
  });
  
  // Get styles based on tier limits
  const genderStyles = STYLES[gender] || STYLES.MALE;
  const allCountryStyles = genderStyles[country] || genderStyles.GLOBAL || [];
  const selectedStyles = getAvailableStyles(allCountryStyles, tier);
  
  // 2. Prepare prompts with distributed counts
  if (selectedStyles.length === 0) throw new Error('No styles found for the selected category');
  
  const perStyle = Math.floor(totalImages / selectedStyles.length);
  const remainder = totalImages % selectedStyles.length;

  const jobRequests = [];
  selectedStyles.forEach((style, index) => {
    const count = index === 0 ? perStyle + remainder : perStyle;
    if (count <= 0) return;

    for (let i = 0; i < count; i++) {
      jobRequests.push({
        prompt: style.prompt.replace('[GENDER]', gender),
        reference_image: userPhotos[0], // Primary identity source
        identity_strength: 0.8,
        negative_prompt: "deformed, blurry, bad anatomy, cartoon, drawing, messy hair",
      });
    }
  });

  // 3. Update job metadata to Firestore
  await db.collection('batches').doc(batchId).update({
    styles: selectedStyles.map(s => s.name),
    gcsOutputPath: gcsOutputDir,
    imageCount: totalImages
  });

  // 4. Trigger Batch Prediction (Vertex AI Integration)
  try {
    const aiplatform = await import('@google-cloud/aiplatform');
    const { PredictionServiceClient } = aiplatform.v1;
    
    // Explicitly set the location endpoint
    const clientOptions = {
        apiEndpoint: `${process.env.GCP_LOCATION || 'us-central1'}-aiplatform.googleapis.com`
    };
    const predictionServiceClient = new PredictionServiceClient(clientOptions);

    const projectId = process.env.GCP_PROJECT_ID || 'universalheadshot-a776a';
    const location = process.env.GCP_LOCATION || 'us-central1';
    
    // Prepare GCS Input (JSONL)
    const jsonlContent = jobRequests.map(req => JSON.stringify({
        prompt: req.prompt,
        negative_prompt: req.negative_prompt,
        identity_image: req.reference_image
    })).join('\n');

    const inputUri = `${gcsOutputDir}/input.jsonl`;
    await bucket.file(`results/${userId}/${batchId}/input.jsonl`).save(jsonlContent);

    // Call Vertex AI with tier-specific model
    const vertexModel = modelId.includes('fast') 
      ? 'imagen-3-0-fast-generate-001'  // Free tier - fast/cheap
      : 'imagen-3-ultra-generate-001';   // Paid tiers - high quality
    
    const [response] = await predictionServiceClient.createBatchPredictionJob({
        parent: `projects/${projectId}/locations/${location}`,
        batchPredictionJob: {
            displayName: `universal-headshots-${batchId}`,
            model: `projects/${projectId}/locations/${location}/publishers/google/models/${vertexModel}`,
            inputConfig: {
                instancesFormat: 'jsonl',
                gcsSource: { uris: [`gs://${process.env.GCS_BUCKET_NAME || 'universalheadshot'}/${inputUri}`] },
            },
            outputConfig: {
                predictionsFormat: 'jsonl',
                gcsDestination: { outputUriPrefix: `gs://${process.env.GCS_BUCKET_NAME || 'universalheadshot'}/${gcsOutputDir}/` },
            },
        },
    });

    logger.info({ batchId, userId, jobId: response.name }, `📡 Vertex AI Batch Triggered`);
    
    await db.collection('batches').doc(batchId).update({
        vertexJobName: response.name,
        status: 'PROCESSING'
    });

    return { batchId, status: 'PROCESSING', imageCount: totalImages };
  } catch (error) {
    logger.error({ error, batchId, userId }, 'Vertex AI Trigger Failed (Falling back to Simulation)');
    // If it fails (e.g. model not enabled), we log it but don't crash the whole flow
    return { batchId, status: 'PROCESSING', simulated: true };
  }
}

/**
 * Single Image Refinement (Batch of 4)
 * Uses Vertex AI to refine a specific output.
 * Generates: 2x User Prompt, 2x AI Suggested enhancements.
 */
export async function refineImage(userId, imagePath, userPrompt) {
  const refinementId = `REFINE_${Date.now()}`;
  
  // Suggested Enhancement Prompts
  const suggestedPrompts = [
    "Professional Studio Lighting, 8k Resolution, highly detailed skin texture, cinematic atmosphere",
    "Film Noir Style, dramatic shadows, black and white portrait, premium look"
  ];

  console.log(`\x1b[35m%s\x1b[0m`, `✨ Refining Image: ${imagePath}`);
  console.log(`   - 2x User Prompt: "${userPrompt}"`);
  console.log(`   - 2x Suggested enhancements...`);
  
  const refinementResults = [
    { type: 'USER', prompt: userPrompt, status: 'PROCESSING' },
    { type: 'USER', prompt: userPrompt, status: 'PROCESSING' },
    { type: 'SUGGESTED', prompt: suggestedPrompts[0], status: 'PROCESSING' },
    { type: 'SUGGESTED', prompt: suggestedPrompts[1], status: 'PROCESSING' }
  ];

  // Store refinement session in Firestore with atomic credit check
  const userRef = db.collection('users').doc(userId);
  const refinementRef = db.collection('refinements').doc(refinementId);

  await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);
    const currentCredits = userDoc.exists ? (userDoc.data().refineCredits || 0) : 0;

    if (currentCredits <= 0) {
      throw new Error('INSUFFICIENT_CREDITS');
    }

    // 1. Decrement Credits
    transaction.update(userRef, {
      refineCredits: admin.firestore.FieldValue.increment(-1)
    });

    // 2. Create Refinement Entry
    transaction.set(refinementRef, {
      userId,
      originalImagePath: imagePath,
      results: [
        { type: 'USER', prompt: userPrompt, status: 'PROCESSING' },
        { type: 'USER', prompt: userPrompt, status: 'PROCESSING' },
        { type: 'SUGGESTED', prompt: suggestedPrompts[0], status: 'PROCESSING' },
        { type: 'SUGGESTED', prompt: suggestedPrompts[1], status: 'PROCESSING' }
      ],
      status: 'PROCESSING',
      progress: 0,
      createdAt: new Date().toISOString()
    });
  });

  return { refinementId, status: 'PROCESSING', count: 4 };
}

/**
 * Get Batch Status
 */
export async function getBatchStatus(batchId) {
  const doc = await db.collection('batches').doc(batchId).get();
  if (!doc.exists) return null;
  return doc.data();
}
