import { PublicClientApplication, AuthenticationResult } from '@azure/msal-browser';
import { AUTH_CONFIG } from '../config/auth';

class AuthService {
  private msalInstance: PublicClientApplication;
  private initialized: boolean = false;

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

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.msalInstance.initialize();
      this.initialized = true;
    }
  }

  async login(): Promise<AuthenticationResult> {
    try {
      await this.initialize();
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
      await this.initialize();
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
      await this.initialize();
      await this.msalInstance.logoutPopup();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    await this.initialize();
    return this.msalInstance.getAllAccounts().length > 0;
  }

  async handleRedirectPromise(): Promise<void> {
    await this.initialize();
    await this.msalInstance.handleRedirectPromise();
  }
}

export const authService = new AuthService();