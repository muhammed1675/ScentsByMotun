/**
 * Authentication Module
 * Handles Supabase Auth operations (signup, login, logout, session management)
 */

import { CONFIG } from '../config.js';
import { supabase } from './supabase.js';

class AuthManager {
  constructor() {
    this.user = null;
    this.session = null;
    this.isAdmin = false;

    this.loadSession();
    this.setupAuthStateListener();
  }

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

  saveSession(session) {
    this.session = session;
    this.user = session.user;
    localStorage.setItem('auth_session', JSON.stringify(session));
    this.checkAdminStatus();
    this.dispatchAuthEvent('auth_state_changed', { user: this.user, isAdmin: this.isAdmin });
  }

  clearSession() {
    this.user = null;
    this.session = null;
    this.isAdmin = false;
    localStorage.removeItem('auth_session');
    localStorage.removeItem('cart');
    this.dispatchAuthEvent('auth_state_changed', { user: null, isAdmin: false });
  }

  checkAdminStatus() {
    if (!this.user) {
      this.isAdmin = false;
      return;
    }

    this.isAdmin = this.user.user_metadata?.role === 'admin';
  }

  setupAuthStateListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'auth_session') {
        this.loadSession();
      }
    });
  }

  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        }
      });

      if (error) throw error;

      // store session
      this.saveSession(data.session);

      return data;
    } catch (error) {
      console.error('[Auth] Signup error:', error);
      throw error;
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.saveSession(data.session);
      return data;
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  getUser() {
    return this.user;
  }

  getSession() {
    return this.session;
  }

  isAuthenticated() {
    return !!this.user && !!this.session?.access_token;
  }

  isUserAdmin() {
    return this.isAdmin && this.isAuthenticated();
  }

  dispatchAuthEvent(eventName, detail) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

export const auth = new AuthManager();
export default auth;
