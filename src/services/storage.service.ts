import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import path from 'path';

const REPLIT_SIDECAR_ENDPOINT = 'http://127.0.0.1:1106';

const storageClient = new Storage({
  credentials: {
    audience: 'replit',
    subject_token_type: 'access_token',
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: { type: 'json', subject_token_field_name: 'access_token' },
    },
    type: 'external_account',
    universe_domain: 'googleapis.com',
  },
  projectId: '',
} as any);

function getBucketName(): string {
  const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
  if (!bucketId) throw new Error('DEFAULT_OBJECT_STORAGE_BUCKET_ID is not set');
  return bucketId;
}

/**
 * Upload a file buffer to Replit App Storage.
 * Returns the storage key (relative path within the bucket) for the uploaded file.
 */
export async function uploadToStorage(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  prefix: string = 'publications'
): Promise<{ key: string; url: string }> {
  const ext = path.extname(originalName) || '';
  const filename = `${randomUUID()}${ext}`;
  const key = `public/${prefix}/${filename}`;

  const bucket = storageClient.bucket(getBucketName());
  const file = bucket.file(key);

  await file.save(buffer, {
    contentType: mimeType,
    metadata: { cacheControl: 'public, max-age=31536000' },
  });

  const url = `/api/v1/files/${key}`;
  return { key, url };
}

/**
 * Upload a Buffer directly to a specific key in the bucket.
 */
export async function uploadBufferToKey(
  buffer: Buffer,
  key: string,
  mimeType: string = 'application/octet-stream'
): Promise<void> {
  const bucket = storageClient.bucket(getBucketName());
  const file = bucket.file(key);
  await file.save(buffer, { contentType: mimeType });
}

/**
 * Stream a file from App Storage to an Express response.
 */
export async function streamFromStorage(key: string, res: import('express').Response): Promise<void> {
  const bucket = storageClient.bucket(getBucketName());
  const file = bucket.file(key);

  const [exists] = await file.exists();
  if (!exists) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const [metadata] = await file.getMetadata();
  res.setHeader('Content-Type', metadata.contentType || 'application/octet-stream');
  if (metadata.size) res.setHeader('Content-Length', String(metadata.size));
  res.setHeader('Cache-Control', 'public, max-age=31536000');

  file.createReadStream()
    .on('error', (err) => {
      console.error('Storage stream error:', err);
      if (!res.headersSent) res.status(500).json({ error: 'Failed to stream file' });
    })
    .pipe(res);
}

/**
 * Delete a file from App Storage by key.
 */
export async function deleteFromStorage(key: string): Promise<void> {
  try {
    const bucket = storageClient.bucket(getBucketName());
    await bucket.file(key).delete();
  } catch {
    // Ignore not-found errors on delete
  }
}

/**
 * List all files under a given prefix.
 */
export async function listStorageFiles(prefix: string = ''): Promise<string[]> {
  const bucket = storageClient.bucket(getBucketName());
  const [files] = await bucket.getFiles({ prefix });
  return files.map((f) => f.name);
}

/**
 * Download a file from App Storage as a Buffer.
 */
export async function downloadFromStorage(key: string): Promise<Buffer> {
  const bucket = storageClient.bucket(getBucketName());
  const [contents] = await bucket.file(key).download();
  return contents;
}
