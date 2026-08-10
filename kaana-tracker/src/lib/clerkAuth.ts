/** Kaana Tracker Clerk routes (Faralin uses /sign-in — Tracker uses /login). */
export const CLERK_SIGN_IN_URL = '/login';
export const CLERK_SIGN_UP_URL = '/sign-up';
export const CLERK_AFTER_AUTH_URL = '/';

export function safeRedirectUrl(input: string | null) {
  if (!input) return CLERK_AFTER_AUTH_URL;
  return input.startsWith('/') ? input : CLERK_AFTER_AUTH_URL;
}

export function authUrlWithRedirect(basePath: string, redirectUrl: string) {
  if (redirectUrl === CLERK_AFTER_AUTH_URL) return basePath;
  return `${basePath}?redirect_url=${encodeURIComponent(redirectUrl)}`;
}
