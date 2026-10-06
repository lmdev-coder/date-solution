import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import type { R2Config } from '../config/env';

/** Thrown when a read is requested for a key that does not exist in the bucket. */
export class ObjectNotFoundError extends Error {
  constructor(objectKey: string) {
    super(`Object not found: ${objectKey}`);
    this.name = 'ObjectNotFoundError';
  }
}

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

  /** Reads an object's UTF-8 text content. Throws if the key is missing. */
  async getObject(objectKey: string): Promise<string> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.config.bucketName,
        Key: objectKey,
      }),
    );

    if (!response.Body) {
      throw new ObjectNotFoundError(objectKey);
    }

    return response.Body.transformToString('utf8');
  }

  /** Returns `true` when a key points to an existing object. */
  async objectExists(objectKey: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucketName,
          Key: objectKey,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }
}