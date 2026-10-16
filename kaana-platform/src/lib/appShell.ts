import { BOTIQ_INBOX_URL } from './botiqUrls';

/** App routes that use Bot IQ product chrome (no marketing nav/footer). */
const PRODUCT_SHELL_PREFIXES = [
  '/login',
  '/signup',
  '/dashboard',
  '/templates',
  '/onboarding',
  '/privacy',
  '/terms',
  '/admin',
] as const;

export function isProductShellPath(pathname: string): boolean {
  return PRODUCT_SHELL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export const INBOX_APP_URL = BOTIQ_INBOX_URL;
