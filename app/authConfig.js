// authConfig.js — Azure AD / Microsoft Entra ID settings
// clientId / tenantId are injected at Docker build time (see Dockerfile.frontend),
// the same way config.js gets its API_URL substituted.
const AUTH_CONFIG = {
  clientId: '__AZURE_CLIENT_ID__',
  tenantId: '__AZURE_TENANT_ID__',
};
