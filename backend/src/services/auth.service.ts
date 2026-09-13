import { createHash, timingSafeEqual } from 'node:crypto';

/** Hex-encoded SHA-256 digest, mirroring the client-side implementation. */
export function hashPassword(password: string): string {
  return createHash('sha256').update(password, 'utf8').digest('hex');
}

/**
 * Constant-time comparison of two hex digests. Length mismatch is rejected
 * up-front because `timingSafeEqual` throws on buffers of unequal size.
 */
export function isAuthorized(clientHash: string, expectedHash: string): boolean {
  if (!isHexDigest(clientHash) || !isHexDigest(expectedHash)) {
    return false;
  }

  return timingSafeEqual(Buffer.from(clientHash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

function isHexDigest(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}