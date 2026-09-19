/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AXIOS_BASE_URL: string;
  readonly VITE_KEYCLOAK_URL: string;
  readonly VITE_KEYCLOAK_REALM: string;
  readonly VITE_KEYCLOAK_CLIENT_ID: string;
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_ONE_SIGNAL_APP_ID: string;
  readonly VITE_STREAM_API_KEY: string;
  readonly VITE_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
