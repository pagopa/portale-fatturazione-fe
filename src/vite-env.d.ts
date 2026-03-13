interface ImportMetaEnv {
  readonly VITE_APP_CLIENT_ID: string
  readonly VITE_APP_TENANT_ID: string
  readonly VITE_APP_URL: string
  readonly VITE_APP_REDIRECT_AZURE: string
  readonly VITE_APP_REDIRECT: string
  readonly VITE_APP_REDIRECT_ASSISTENZA: string
  readonly VITE_APP_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

