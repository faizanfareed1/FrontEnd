/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // add other VITE_... env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
