import type { Handler } from '@netlify/functions';

import { readPasswordHash, readR2Config } from '../../src/config/env';
import {
  emptyResponse,
  errorResponse,
  handleUnexpectedError,
  isPreflight,
  jsonResponse,
  readBearerToken,
  readClientIp,
  readJsonBody,
  requirePost,
} from '../../src/lib/http';
import { describeValidationError, invitationAnswerSchema } from '../../src/schemas/invitation.schema';
import { isAuthorized } from '../../src/services/auth.service';
import { InvitationService } from '../../src/services/invitation.service';
import { R2StorageService } from '../../src/services/r2-storage.service';

/** Reused across warm invocations so the S3 client is built only once. */
let invitationService: InvitationService | null = null;

function getInvitationService(): InvitationService {
  invitationService ??= new InvitationService(new R2StorageService(readR2Config()));
  return invitationService;
}

/**
 * POST /.netlify/functions/save-response
 * Header: `Authorization: Bearer <sha256-hex-of-password>`
 * Body:   `{ countries: string[], hotel: string, dates: string }`
 */
export const handler: Handler = async (event) => {
  if (isPreflight(event)) {
    return emptyResponse();
  }

  const methodError = requirePost(event);
  if (methodError) {
    return methodError;
  }

  try {
    if (!isAuthorized(readBearerToken(event), readPasswordHash())) {
      return errorResponse(401, 'Unauthorized');
    }

    const parsed = invitationAnswerSchema.safeParse(readJsonBody(event));
    if (!parsed.success) {
      return errorResponse(400, describeValidationError(parsed.error));
    }

    const stored = await getInvitationService().save(parsed.data, readClientIp(event));

    return jsonResponse(200, {
      success: true,
      objectKey: stored.objectKey,
      savedAt: stored.savedAt,
    });
  } catch (error) {
    return handleUnexpectedError(error);
  }
};