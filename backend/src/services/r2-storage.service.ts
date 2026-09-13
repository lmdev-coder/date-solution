import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import type { R2Config } from '../config/env';

/**
 * Thin infrastructure wrapper around the S3-compatible Cloudflare R2 API.
 * Knows nothing about the invitation domain — it only moves bytes.
 */
export class R2StorageService {
  private readonly client: S3Client;

  constructor(private readonly config: R2Config) {
    this.client = new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async putObject(objectKey: string, body: string, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucketName,
        Key: objectKey,
        Body: body,
        ContentType: contentType,
      }),
    );
  }
}