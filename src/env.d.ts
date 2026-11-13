/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Build id (git commit) set by CI; the world server checks it (M7). */
  readonly VITE_BUILD?: string;
}
