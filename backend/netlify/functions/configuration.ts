import type { Handler, HandlerEvent, HandlerResponse } from '@netlify/functions';

import { readPasswordHash, readR2Config } from '../../src/config/env';
import {
  emptyResponse,
  errorResponse,
  handleUnexpectedError,
  isPreflight,
  jsonResponse,
  readBearerToken,
  readJsonBody,
  requireGet,
  requirePost,
} from '../../src/lib/http';
import {
  configurationSchema,
  configurationUpdateSchema,
  describeConfigurationError,
} from '../../src/schemas/configuration.schema';
import { isAuthorized } from '../../src/services/auth.service';
import { ConfigurationService } from '../../src/services/configuration.service';
import { R2StorageService } from '../../src/services/r2-storage.service';

/** Reused across warm invocations so the S3 client is built only once. */
let configurationService: ConfigurationService | null = null;

function getConfigurationService(): ConfigurationService {
  configurationService ??= new ConfigurationService(new R2StorageService(readR2Config()));
  return configurationService;
}

/**
 * GET  /.netlify/functions/configuration
 * POST /.netlify/functions/configuration  body: `{ id: "gift" }`
 * Header: `Authorization: Bearer <sha256-hex-of-password>`
 * → `{ games: [{ id, freshLabel, doneLabel, active, done }] }`
 *
 * GET reads the single `configuration.json` object from R2, creating the default
 * (all games active) when it does not exist yet. POST marks the given game as
 * `done: true` and persists it back to R2, returning the updated configuration.
 */
export const handler: Handler = async (event) => {
  if (isPreflight(event)) {
    return emptyResponse();
  }

  try {
    if (!isAuthorized(readBearerToken(event), readPasswordHash())) {
      return errorResponse(401, 'Unauthorized');
    }

    if (event.httpMethod === 'POST') {
      return handleCompleteGame(event);
    }

    const methodError = requireGet(event);
    if (methodError) {
      return methodError;
    }

    const configuration = await getConfigurationService().getOrCreate();
    const parsed = configurationSchema.safeParse(configuration);
    if (!parsed.success) {
      return errorResponse(500, describeConfigurationError(parsed.error));
    }

    return jsonResponse(200, parsed.data);
  } catch (error) {
    return handleUnexpectedError(error);
  }
};

async function handleCompleteGame(event: HandlerEvent): Promise<HandlerResponse> {
  const methodError = requirePost(event);
  if (methodError) {
    return methodError;
  }

  const parsed = configurationUpdateSchema.safeParse(readJsonBody(event));
  if (!parsed.success) {
    return errorResponse(400, describeConfigurationError(parsed.error));
  }

  const configuration = await getConfigurationService().markDone(parsed.data.id);
  const validated = configurationSchema.safeParse(configuration);
  if (!validated.success) {
    return errorResponse(500, describeConfigurationError(validated.error));
  }

  return jsonResponse(200, validated.data);
}