import { bucket, db } from '../config/firebase.js';
import { STYLES } from './styles.js';
import dotenv from 'dotenv';
import { createWriteStream } from 'fs';
import { join } from 'path';

dotenv.config();

/**
 * Global Pro AI - Vertex AI Service
 * Generates .jsonl for Batch Prediction jobs.
 */
export async function createBatchJob(userId, gender, userPhotos) {
  const batchId = `BATCH_${Date.now()}`;
  const gcsOutputDir = `results/${userId}/${batchId}`;
  
  // 1. Select styles based on gender
  const selectedStyles = gender === 'MALE' ? STYLES.MALE : STYLES.FEMALE;
  
  // 2. Build .jsonl content (Batch Prediction format)
  // Reference: Vertex AI Imagen 4 Batch Prediction Spec
  const jsonlLines = selectedStyles.map((style, index) => {
    return JSON.stringify({
      prompt: style.prompt,
      // Vertex uses 'instances' for Batch Prediction
      instance: {
        // Source image (reference point)
        source_image: userPhotos[0], // Use first photo as primary reference
        // Additional styles
        negative_prompt: "deformed, blurry, low-quality, bad anatomy, cartoon, drawing",
      },
      // Output parameters
      parameters: {
        sample_count: 1,
        seed: index * 1234,
      }
    });
  });

  const jsonlContent = jsonlLines.join('\n');
  const fileName = `${batchId}.jsonl`;
  const file = bucket.file(`jobs/${userId}/${fileName}`);

  // 3. Upload to GCS
  await file.save(jsonlContent, {
    contentType: 'application/jsonl',
  });

  // 4. Update Firestore Status
  await db.collection('Batches').doc(batchId).set({
    userId,
    batchId,
    status: 'BATCH_QUEUED',
    gcsPath: `gs://${bucket.name}/jobs/${userId}/${fileName}`,
    outputDir: gcsOutputDir,
    updatedAt: new Date().toISOString()
  });

  console.log(`📡 Vertex AI Batch Job Created: ${batchId}`);
  return { batchId, gcsPath: file.publicUrl() };
}

/**
 * Perform Face Refinement (In-painting)
 * $5 add-on feature.
 */
export async function refineHeadshot(photoUrl, maskUrl, prompt) {
  // Logic for Vertex AI In-painting task
  console.log(`🛠 Refining headshot with In-painting: ${photoUrl}`);
  return { status: 'REFINING', photoUrl };
}
