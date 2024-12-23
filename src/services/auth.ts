import { PublicClientApplication, AuthenticationResult } from '@azure/msal-browser';
import { AUTH_CONFIG } from '../config/auth';

class AuthService {
  private msalInstance: PublicClientApplication;

  constructor() {
    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: AUTH_CONFIG.clientId,
        authority: AUTH_CONFIG.authority,
        redirectUri: AUTH_CONFIG.redirectUri,
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
      },
    });
  }

  async login(): Promise<AuthenticationResult> {
    try {
      return await this.msalInstance.loginPopup({
        scopes: AUTH_CONFIG.scopes,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const account = this.msalInstance.getAllAccounts()[0];
      if (!account) return null;

      const response = await this.msalInstance.acquireTokenSilent({
        scopes: AUTH_CONFIG.scopes,
        account,
      });

      return response.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.msalInstance.logoutPopup();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.msalInstance.getAllAccounts().length > 0;
  }
}

export const authService = new AuthService();