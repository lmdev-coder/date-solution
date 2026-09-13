import type { R2StorageService } from './r2-storage.service';
import type { InvitationAnswer, InvitationRecord, StoredInvitation } from '../types/invitation';

const JSON_CONTENT_TYPE = 'application/json';

/**
 * The bucket is shared with other applications, so objects are namespaced per
 * app: `<app>/<category>/<file>`. Everything this function writes lives under
 * `date-solution/answers/`.
 */
const OBJECT_KEY_PREFIX = 'date-solution/answers/';

/** Characters that are unsafe in an object key; runs collapse into a single `_`. */
const UNSAFE_KEY_CHARACTERS = /[^a-zA-Z0-9._-]+/g;

/** Turns a domain payload into a persisted storage object. */
export class InvitationService {
  constructor(private readonly storage: R2StorageService) {}

  async save(answer: InvitationAnswer, clientIp: string): Promise<StoredInvitation> {
    const submittedAt = new Date();
    const record: InvitationRecord = {
      ...answer,
      clientIp,
      submittedAt: submittedAt.toISOString(),
    };

    const objectKey = this.buildObjectKey(answer, submittedAt, clientIp);
    await this.storage.putObject(objectKey, JSON.stringify(record, null, 2), JSON_CONTENT_TYPE);

    return { objectKey, savedAt: record.submittedAt };
  }

  /**
   * `<prefix>v<version>_<YYYY-MM-DD>_<ip>_<timestamp>.json` — sortable,
   * collision-free, and version-visible straight from the bucket listing.
   */
  private buildObjectKey(answer: InvitationAnswer, submittedAt: Date, clientIp: string): string {
    const isoTimestamp = submittedAt.toISOString();
    const date = isoTimestamp.slice(0, 10);
    const time = isoTimestamp.slice(11).replace(/[:.]/g, '-');

    return `${OBJECT_KEY_PREFIX}v${answer.version}_${date}_${sanitizeKeyPart(clientIp)}_${time}.json`;
  }
}

function sanitizeKeyPart(value: string): string {
  const sanitized = value.replace(UNSAFE_KEY_CHARACTERS, '_');
  return sanitized || 'unknown-ip';
}