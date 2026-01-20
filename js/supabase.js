/**
 * Supabase Client Initialization
 * Provides utilities for interacting with Supabase
 */

import CONFIG from '../config.js';

class SupabaseClient {
  constructor() {
    this.url = CONFIG.SUPABASE_URL;
    this.anonKey = CONFIG.SUPABASE_ANON_KEY;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.anonKey}`,
      'apikey': this.anonKey,
    };
  }

  /**
   * Generic REST API call
   */
  async call(endpoint, options = {}) {
    const url = `${this.url}/rest/v1/${endpoint}`;
    const config = {
      headers: this.headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[Supabase Error]', error);
      throw error;
    }
  }

  /**
   * GET - Fetch data
   */
  async get(table, options = {}) {
    let endpoint = table;

    if (options.select) {
      endpoint += `?select=${options.select}`;
    }

    if (options.filter) {
      const separator = endpoint.includes('?') ? '&' : '?';
      endpoint += separator + options.filter;
    }

    if (options.order) {
      const separator = endpoint.includes('?') ? '&' : '?';
      endpoint += separator + options.order;
    }

    if (options.limit) {
      const separator = endpoint.includes('?') ? '&' : '?';
      endpoint += separator + `limit=${options.limit}`;
    }

    return this.call(endpoint, {
      method: 'GET',
    });
  }

  /**
   * POST - Create data
   */
  async create(table, data) {
    return this.call(table, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH - Update data
   */
  async update(table, data, filter) {
    let endpoint = table;
    if (filter) {
      endpoint += `?${filter}`;
    }

    return this.call(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE - Remove data
   */
  async delete(table, filter) {
    let endpoint = table;
    if (filter) {
      endpoint += `?${filter}`;
    }

    return this.call(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Call a Supabase Edge Function
   */
  async callFunction(functionName, payload) {
    const url = `${this.url}/functions/v1/${functionName}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.anonKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Function Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Edge Function Error]', error);
      throw error;
    }
  }
}

// Export singleton instance
export const supabase = new SupabaseClient();

export default supabase;
