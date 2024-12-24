import { PublicClientApplication, AccountInfo, Configuration } from '@azure/msal-browser';
import { msalConfig } from '../config/msal';

class AuthService {
  private msalInstance: PublicClientApplication;
  private initialized: boolean = false;
  private initPromise: Promise<void>;

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
    this.initPromise = this.initialize();
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
        scopes: ['User.Read', 'Files.ReadWrite']
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
        scopes: ['User.Read', 'Files.ReadWrite'],
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
      return accounts[0] || null;
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