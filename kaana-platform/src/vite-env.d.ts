/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BOTIQ_URL: string;
  readonly VITE_CRM_URL: string;
  readonly VITE_LISTINGS_URL: string;
  readonly VITE_WHATSAPP_LINK: string;
  readonly VITE_PLAUSIBLE_DOMAIN: string;
  readonly VITE_PLAUSIBLE_SCRIPT_URL: string;
  readonly VITE_GA_MEASUREMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
