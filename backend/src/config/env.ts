import { ConfigError } from '../lib/errors';

export interface R2Config {
  bucketName: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
}

/** Reads and validates a set of environment variables in one pass. */
class EnvReader {
  private readonly missing: string[] = [];

  required(name: string): string {
    const value = process.env[name]?.trim() ?? '';
    if (!value) {
      this.missing.push(name);
    }
    return value;
  }

  assertComplete(): void {
    if (this.missing.length > 0) {
      throw new ConfigError(this.missing);
    }
  }
}

export function readPasswordHash(): string {
  const env = new EnvReader();
  const passwordHash = env.required('PASSWORD_HASH');
  env.assertComplete();
  return passwordHash;
}

export function readR2Config(): R2Config {
  const env = new EnvReader();

  const accountId = env.required('R2_ACCOUNT_ID');
  const accessKeyId = env.required('R2_ACCESS_KEY_ID');
  const secretAccessKey = env.required('R2_SECRET_ACCESS_KEY');
  const bucketName = env.required('R2_BUCKET_NAME');

  env.assertComplete();

  return {
    bucketName,
    accessKeyId,
    secretAccessKey,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  };
}