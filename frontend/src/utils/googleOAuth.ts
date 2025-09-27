// Google OAuth utility functions
export interface GoogleOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

// Get Google OAuth configuration from environment or defaults
export const getGoogleOAuthConfig = (): GoogleOAuthConfig => {
  return {
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/auth/google/callback`,
    scope: 'openid profile email'
  };
};

// Generate Google OAuth authorization URL
export const getGoogleAuthUrl = (): string => {
  const config = getGoogleOAuthConfig();
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    access_type: 'offline',
    prompt: 'select_account'
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// Extract authorization code from URL
export const extractCodeFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
};

// Clear URL parameters after extracting code
export const clearUrlParams = (): void => {
  window.history.replaceState({}, document.title, window.location.pathname);
};

// Open Google OAuth in popup
export const openGoogleAuthPopup = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config = getGoogleOAuthConfig();
    const popup = window.open(
      getGoogleAuthUrl(),
      'google-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!popup) {
      reject(new Error('Failed to open popup. Please allow popups for this site.'));
      return;
    }

    // Listen for popup messages
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        popup.close();
        window.removeEventListener('message', messageListener);
        resolve(event.data.code);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        popup.close();
        window.removeEventListener('message', messageListener);
        reject(new Error(event.data.error || 'Google authentication failed'));
      }
    };

    window.addEventListener('message', messageListener);

    // Check if popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageListener);
        reject(new Error('Authentication cancelled'));
      }
    }, 1000);
  });
};

// Handle Google OAuth callback (for popup)
export const handleGoogleAuthCallback = (): void => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) {
    // Send error to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'GOOGLE_AUTH_ERROR',
        error: error
      }, window.location.origin);
    }
    window.close();
    return;
  }

  if (code) {
    // Send success to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'GOOGLE_AUTH_SUCCESS',
        code: code
      }, window.location.origin);
    }
    window.close();
  }
};
