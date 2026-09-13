import type { HandlerEvent, HandlerResponse } from '@netlify/functions';

import { ConfigError } from './errors';

const JSON_CONTENT_TYPE = 'application/json';

/** Body-less response used for CORS pre-flight and empty payloads. */
export const emptyResponse = (): HandlerResponse => ({ statusCode: 204, body: '' });

export function jsonResponse(statusCode: number, payload: unknown): HandlerResponse {
  return {
    statusCode,
    headers: { 'Content-Type': JSON_CONTENT_TYPE },
    body: JSON.stringify(payload),
  };
}

export function errorResponse(statusCode: number, message: string): HandlerResponse {
  return jsonResponse(statusCode, { error: message });
}

/** Rejects every HTTP method except the one a function exposes. */
export function requirePost(event: HandlerEvent): HandlerResponse | null {
  return event.httpMethod === 'POST' ? null : errorResponse(405, 'Method Not Allowed');
}

export function isPreflight(event: HandlerEvent): boolean {
  return event.httpMethod === 'OPTIONS';
}

export function readBearerToken(event: HandlerEvent): string {
  const header = event.headers.authorization ?? event.headers.Authorization ?? '';
  return header.replace(/^Bearer\s+/i, '').trim();
}

/** Netlify sets `x-nf-client-connection-ip`; the fallback keeps local runs working. */
export function readClientIp(event: HandlerEvent): string {
  const candidate = event.headers['x-nf-client-connection-ip'] ?? event.headers['client-ip'] ?? '';
  return candidate.trim() || 'unknown-ip';
}

export function readJsonBody(event: HandlerEvent): unknown {
  if (!event.body) {
    return {};
  }

  try {
    return JSON.parse(event.body) as unknown;
  } catch {
    throw new MalformedBodyError();
  }
}

/** Raised when the request body is not valid JSON. */
export class MalformedBodyError extends Error {
  constructor() {
    super('Request body must be valid JSON');
    this.name = 'MalformedBodyError';
  }
}

/**
 * Single exit point for unexpected failures so that no stack trace or
 * credential detail ever leaks into an HTTP response.
 */
export function handleUnexpectedError(error: unknown): HandlerResponse {
  if (error instanceof ConfigError) {
    console.error('[config]', error.message);
    return errorResponse(500, 'Server misconfigured');
  }

  if (error instanceof MalformedBodyError) {
    return errorResponse(400, error.message);
  }

  console.error('[unhandled]', error);
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return errorResponse(500, message);
}