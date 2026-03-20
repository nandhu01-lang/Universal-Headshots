import archiver from 'archiver';
import { bucket } from '../config/firebase.js';

/**
 * Universal Headshots - ZIP Service
 * Streams images from GCS into a ZIP archive for the user.
 */
export async function createZipStream(userId, batchId, res) {
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  archive.on('error', (err) => {
    throw err;
  });

  // Pipe the archive data to the response
  archive.pipe(res);

  // Get all files for the user/batch from GCS
  const prefix = `results/${userId}/${batchId}/`;
  const [files] = await bucket.getFiles({ prefix });

  if (files.length === 0) {
    throw new Error('No files found for this batch');
  }

  // Append each file to the archive
  for (const file of files) {
    const fileName = file.name.split('/').pop();
    const readStream = file.createReadStream();
    archive.append(readStream, { name: fileName });
  }

  await archive.finalize();
}
