/** Bot IQ production URLs — override via VITE_* at build time. */
const trim = (u: string) => u.replace(/\/$/, '');

export const BOTIQ_PLATFORM_URL = trim(
  import.meta.env.VITE_PLATFORM_URL || 'https://app.botiq.kaana.in',
);

export const BOTIQ_INBOX_URL = trim(
  import.meta.env.VITE_BOTIQ_URL || 'https://inbox.botiq.kaana.in',
);

export const BOTIQ_API_URL = trim(
  import.meta.env.VITE_WHATSAPP_API || 'https://api.botiq.kaana.in/api',
);
