/**
 * SHA-256 hex digest. The server compares this against its `PASSWORD_HASH`,
 * so the plain password never leaves the browser.
 */
export async function hashPassword(password: string): Promise<string> {
  const encodedPassword = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', encodedPassword);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}