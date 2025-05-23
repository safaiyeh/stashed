import { supabase } from './supabase';

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export class AuthService {
  private static instance: AuthService;
  private session: Session | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async getSession(): Promise<Session | null> {
    if (this.session) {
      if (this.session.expires_at < Date.now()) {
        await this.refreshSession();
      }
      return this.session;
    }

    const { session } = await chrome.storage.local.get(['session']);
    if (session) {
      this.session = session;
      return session;
    }

    return null;
  }

  async setSession(session: Session): Promise<void> {
    this.session = session;
    await chrome.storage.local.set({ session });
  }

  async clearSession(): Promise<void> {
    this.session = null;
    await chrome.storage.local.remove(['session']);
  }

  async refreshSession(): Promise<void> {
    if (!this.session?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      await this.clearSession();
      throw error;
    }

    if (data.session) {
      await this.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: Date.now() + (data.session.expires_in * 1000)
      });
    }
  }

  async redirectToLogin(): Promise<void> {
    chrome.tabs.create({ 
      url: chrome.runtime.getURL('pages/login/index.html')
    });
  }
}

export const authService = AuthService.getInstance(); 