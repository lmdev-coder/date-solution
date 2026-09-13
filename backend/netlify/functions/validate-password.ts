import type { Handler } from '@netlify/functions';

import { readPasswordHash } from '../../src/config/env';
import {
  emptyResponse,
  errorResponse,
  handleUnexpectedError,
  isPreflight,
  jsonResponse,
  readBearerToken,
  requirePost,
} from '../../src/lib/http';
import { isAuthorized } from '../../src/services/auth.service';

/**
 * POST /.netlify/functions/validate-password
 * Header: `Authorization: Bearer <sha256-hex-of-password>`
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
      return errorResponse(401, 'Invalid password');
    }

    return jsonResponse(200, { valid: true });
  } catch (error) {
    return handleUnexpectedError(error);
  }
};