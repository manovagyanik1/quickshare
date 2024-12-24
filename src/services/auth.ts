import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { msalConfig } from '../config/msal';

class AuthService {
  private msalInstance: PublicClientApplication;

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  async login() {
    try {
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
      await this.msalInstance.logoutRedirect();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
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
      const accounts = this.msalInstance.getAllAccounts();
      return accounts[0] || null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  }

  async handleRedirectPromise() {
    try {
      await this.msalInstance.handleRedirectPromise();
    } catch (error) {
      console.error('Handle redirect failed:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0;
  }
}

export const authService = new AuthService();