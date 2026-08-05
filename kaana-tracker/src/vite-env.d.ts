/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRACKER_API?: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
