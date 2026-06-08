// ─────────────────────────────────────────────────────────────
// TECHNOPROFIL — Azure AD sign-in (MSAL)
// Depends on: authConfig.js + the MSAL browser SDK loaded from CDN
// Access is restricted to the users assigned to the App Registration
// in Entra ID — this file only drives the sign-in flow and attaches
// the resulting token to API calls.
// ─────────────────────────────────────────────────────────────

const AUTH_IS_CONFIGURED = !!(AUTH_CONFIG.clientId && AUTH_CONFIG.tenantId
  && !AUTH_CONFIG.clientId.startsWith('__'));

const AUTH_SCOPES = ['openid', 'profile', 'email', 'User.Read'];

let msalInstance  = null;
let currentAccount = null;

async function authInit() {
  if (!AUTH_IS_CONFIGURED) return false;

  if (typeof msal === 'undefined') {
    throw new Error('MSAL SDK failed to load from CDN');
  }

  msalInstance = new msal.PublicClientApplication({
    auth: {
      clientId:    AUTH_CONFIG.clientId,
      authority:   `https://login.microsoftonline.com/${AUTH_CONFIG.tenantId}`,
      redirectUri: window.location.origin + window.location.pathname,
    },
    cache: { cacheLocation: 'sessionStorage' },
  });

  await msalInstance.initialize();

  const redirectResult = await msalInstance.handleRedirectPromise();
  if (redirectResult && redirectResult.account) {
    currentAccount = redirectResult.account;
  } else {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length) currentAccount = accounts[0];
  }

  return true;
}

function authIsSignedIn() {
  return !!currentAccount;
}

function authUserLabel() {
  if (!currentAccount) return '';
  return currentAccount.username || currentAccount.name || '';
}

function authSignIn() {
  if (!msalInstance) throw new Error('MSAL is not initialized — cannot sign in');
  return msalInstance.loginRedirect({ scopes: AUTH_SCOPES });
}

function authSignOut() {
  if (!msalInstance) throw new Error('MSAL is not initialized — cannot sign out');
  return msalInstance.logoutRedirect({ account: currentAccount });
}

// Returns a valid access token, refreshing silently when possible.
async function authGetToken() {
  if (!msalInstance || !currentAccount) throw new Error('Not signed in');
  try {
    const result = await msalInstance.acquireTokenSilent({ scopes: AUTH_SCOPES, account: currentAccount });
    return result.accessToken;
  } catch (e) {
    return msalInstance.acquireTokenRedirect({ scopes: AUTH_SCOPES });
  }
}
