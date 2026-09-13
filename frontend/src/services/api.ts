import type { InvitationAnswer } from '@/types/invitation';

/** Functions are served from the same origin, both in production and via `netlify dev`. */
const API_BASE_URL = '/.netlify/functions';

/** Non-2xx response, carrying the HTTP status so callers can branch on it. */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface ValidatePasswordResult {
  valid: boolean;
}

export interface SaveResponseResult {
  success: boolean;
  objectKey: string;
  savedAt: string;
}

interface ApiErrorBody {
  error?: string;
}

export function validatePassword(authHash: string): Promise<ValidatePasswordResult> {
  return postJson<ValidatePasswordResult>('/validate-password', authHash, {});
}

export function saveInvitation(authHash: string, answer: InvitationAnswer): Promise<SaveResponseResult> {
  return postJson<SaveResponseResult>('/save-response', authHash, answer);
}

async function postJson<TResponse>(endpoint: string, authHash: string | null, body: unknown): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authHash ? { Authorization: `Bearer ${authHash}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  return (await response.json()) as TResponse;
}

/** Error bodies are JSON by contract, but a gateway failure may return HTML. */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const errorBody = (await response.json()) as ApiErrorBody;
    return errorBody.error ?? `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
}