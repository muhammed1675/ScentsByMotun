/**
 * Authentication Module
 * Handles Supabase Auth operations (signup, login, logout, session management)
 */

import CONFIG from '../config.js';
import { supabase } from './supabase.js';

class AuthManager {
  constructor() {
    this.user = null;
    this.session = null;
    this.isAdmin = false;
    this.loadSession();
    this.setupAuthStateListener();
  }

  /**
   * Load session from localStorage
   */
  loadSession() {
    const stored = localStorage.getItem('auth_session');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        this.session = session;
        this.user = session.user;
        this.checkAdminStatus();
      } catch (error) {
        console.error('[Auth] Failed to load session:', error);
        localStorage.removeItem('auth_session');
      }
    }
  }

  /**
   * Save session to localStorage
   */
  saveSession(session) {
    this.session = session;
    this.user = session.user;
    localStorage.setItem('auth_session', JSON.stringify(session));
    this.checkAdminStatus();
    this.dispatchAuthEvent('auth_state_changed', { user: this.user, isAdmin: this.isAdmin });
  }

  /**
   * Clear session from localStorage
   */
  clearSession() {
    this.user = null;
    this.session = null;
    this.isAdmin = false;
    localStorage.removeItem('auth_session');
    localStorage.removeItem('cart');
    this.dispatchAuthEvent('auth_state_changed', { user: null, isAdmin: false });
  }

  /**
   * Check if user is admin (check user metadata or email)
   */
  checkAdminStatus() {
    if (!this.user) {
      this.isAdmin = false;
      return;
    }
    // Check user metadata for role
    this.isAdmin = this.user.user_metadata?.role === 'admin' || this.user.email?.includes('admin');
  }

  /**
   * Setup auth state listener
   */
  setupAuthStateListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'auth_session') {
        this.loadSession();
      }
    });
  }

  /**
   * Sign up with email and password
   */
  async signUp(email, password, metadata = {}) {
    try {
      const response = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email,
          password,
          data: metadata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Create user profile in public.users table
      await supabase.create('users', {
        id: data.user.id,
        email: data.user.email,
        created_at: new Date().toISOString(),
      });

      return { user: data.user, session: null };
    } catch (error) {
      console.error('[Auth] Signup error:', error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email, password) {
    try {
      const response = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error_description || 'Login failed');
      }

      const session = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          user_metadata: data.user.user_metadata || {},
        },
      };

      this.saveSession(session);
      return { user: session.user, session };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }
  }

  /**
   * Sign out
   */
  async signOut() {
    try {
      if (this.session?.access_token) {
        await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.session.access_token}`,
            'apikey': CONFIG.SUPABASE_ANON_KEY,
          },
        });
      }
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Get current user
   */
  getUser() {
    return this.user;
  }

  /**
   * Get current session
   */
  getSession() {
    return this.session;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.user && !!this.session?.access_token;
  }

  /**
   * Check if user is admin
   */
  isUserAdmin() {
    return this.isAdmin && this.isAuthenticated();
  }

  /**
   * Refresh access token
   */
  async refreshToken() {
    if (!this.session?.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          refresh_token: this.session.refresh_token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.clearSession();
        throw new Error('Token refresh failed');
      }

      this.session.access_token = data.access_token;
      localStorage.setItem('auth_session', JSON.stringify(this.session));
      return this.session;
    } catch (error) {
      console.error('[Auth] Token refresh error:', error);
      this.clearSession();
      throw error;
    }
  }

  /**
   * Dispatch custom auth event
   */
  dispatchAuthEvent(eventName, detail) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

// Export singleton instance
export const auth = new AuthManager();

export default auth;
