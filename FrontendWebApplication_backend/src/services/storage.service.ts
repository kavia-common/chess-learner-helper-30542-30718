import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export interface UploadResult {
  url: string;
  key: string;
}

interface IStorageDriver {
  // PUBLIC_INTERFACE
  upload(buffer: Buffer, key: string, contentType?: string): Promise<UploadResult>;
}

class LocalDriver implements IStorageDriver {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(buffer: Buffer, key: string, _contentType?: string): Promise<UploadResult> {
    const safeKey = key.replace(/[^a-zA-Z0-9._/-]/g, '_');
    const filePath = path.join(this.uploadDir, safeKey);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await fs.promises.writeFile(filePath, buffer);
    // Expose via static in app.ts if desired; for now return file path
    const url = `${process.env.APP_BASE_URL || 'http://localhost:4000'}/static/${safeKey}`;
    return { url, key: safeKey };
  }
}

class S3Driver implements IStorageDriver {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: process.env.S3_ACCESS_KEY_ID
        ? { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' }
        : undefined,
      forcePathStyle: !!process.env.S3_ENDPOINT,
    });
    this.bucket = process.env.S3_BUCKET || 'chess-avatars';
  }

  async upload(buffer: Buffer, key: string, contentType?: string): Promise<UploadResult> {
    const safeKey = key.replace(/[^a-zA-Z0-9._/-]/g, '_');
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: safeKey,
        Body: buffer,
        ContentType: contentType || 'application/octet-stream',
        ACL: 'public-read',
      })
    );
    const endp = process.env.S3_ENDPOINT;
    const base =
      endp && endp.startsWith('http')
        ? `${endp.replace(/\/+$/, '')}/${this.bucket}`
        : `https://${this.bucket}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com`;
    const url = `${base}/${safeKey}`;
    return { url, key: safeKey };
  }
}

export class StorageService {
  private driver: IStorageDriver;

  constructor() {
    const type = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
    this.driver = type === 's3' ? new S3Driver() : new LocalDriver();
  }

  // PUBLIC_INTERFACE
  async uploadAvatar(userId: string, fileBuffer: Buffer, contentType?: string): Promise<UploadResult> {
    /** Uploads an avatar for a user and returns the public URL. */
    const key = `avatars/${userId}_${Date.now()}.png`;
    return this.driver.upload(fileBuffer, key, contentType);
  }
}

export const storageService = new StorageService();
