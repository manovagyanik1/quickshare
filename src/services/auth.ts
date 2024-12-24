import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { msalConfig } from '../config/msal';

const DEFAULT_SCOPES = ['User.Read', 'Files.ReadWrite'];

class AuthService {
  private msalInstance: PublicClientApplication;
  private initialized: boolean = false;
  private initPromise: Promise<void>;
  private scopes: string[];

  constructor() {
    // Use redirect URI and scopes from environment variables
    const config = {
      ...msalConfig,
      auth: {
        ...msalConfig.auth,
        redirectUri: import.meta.env.VITE_REDIRECT_URI
      }
    };

    this.msalInstance = new PublicClientApplication(config);
    this.initPromise = this.initialize();
    this.scopes = (import.meta.env.VITE_SCOPES?.split(',') || DEFAULT_SCOPES).map(s => s.trim());
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Load auth state from storage
      await this.msalInstance.initialize();
      // Handle redirect promise in case this is a redirect callback
      await this.msalInstance.handleRedirectPromise();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize MSAL:', error);
      throw error;
    }
  }

  async login() {
    try {
      await this.initPromise;
      await this.msalInstance.loginRedirect({
        scopes: this.scopes
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await this.initPromise;
      await this.msalInstance.logoutRedirect();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      await this.initPromise;
      const account = this.msalInstance.getAllAccounts()[0];
      if (!account) return null;

      const response = await this.msalInstance.acquireTokenSilent({
        scopes: this.scopes,
        account
      });

      return response.accessToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  async getUser(): Promise<AccountInfo | null> {
    try {
      await this.initPromise;
      const accounts = this.msalInstance.getAllAccounts();
      const account = accounts[0];
      
      // Log the account details to debug
      console.log('MSAL Account:', account);
      
      if (!account) return null;

      // Return the account with guaranteed id
      return {
        ...account,
        id: account.localAccountId || account.homeAccountId || account.username
      };
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async handleRedirectPromise() {
    try {
      await this.initPromise;
      const response = await this.msalInstance.handleRedirectPromise();
      return response;
    } catch (error) {
      console.error('Handle redirect failed:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    await this.initPromise;
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0;
  }
}

export const authService = new AuthService();