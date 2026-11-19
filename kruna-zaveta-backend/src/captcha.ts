/**
 * Cloudflare Turnstile verification – https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 * The website's widget produces a one-time token; we ask Cloudflare whether it is valid.
 */

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/** Cloudflare's public test secrets: they accept every token, so they must never be used in production. */
export const TEST_SECRETS = new Set([
  '1x0000000000000000000000000000000AA', // always passes
  '2x0000000000000000000000000000000AA', // always fails
  '3x0000000000000000000000000000000AA', // "token already spent"
]);

export async function verifyCaptcha(
  secret: string,
  token: unknown,
  remoteIp: string | undefined,
  fetchFn: typeof fetch = fetch,
): Promise<boolean> {
  if (typeof token !== 'string' || !token || token.length > 2048) {
    return false;
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  try {
    const response = await fetchFn(SITEVERIFY_URL, { method: 'POST', body });
    const result = (await response.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!result.success) {
      console.warn('[captcha] Rejected:', result['error-codes']?.join(', ') || response.status);
    }
    return result.success === true;
  } catch (error) {
    // Cloudflare unreachable: fail closed – better a retry than an open door for spam.
    const cause = (error as Error & { cause?: { code?: string } }).cause?.code;
    console.error('[captcha] Verification failed:', (error as Error).message, cause ? `(${cause})` : '');
    return false;
  }
}
