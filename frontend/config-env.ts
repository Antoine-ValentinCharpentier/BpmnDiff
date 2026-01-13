const env = window.__ENV__ ?? {}

export const config = {
  keycloak: {
    url: env.KEYCLOAK_URL || 'http://localhost:18080/',
    realm: env.KEYCLOAK_REALM || 'bpmn-diff',
    clientId: env.KEYCLOAK_CLIENT_ID || 'frontend-react',
  },
  backend: {
    url: env.BACKEND_URL || 'http://localhost:9000/',
  },
}
