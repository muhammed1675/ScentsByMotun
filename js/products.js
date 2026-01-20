/**
 * Products Module
 * Handles product fetching, filtering, and searching
 */

import { supabase } from './supabase.js';

class ProductsManager {
  constructor() {
    this.products = [];
    this.categories = ['Men', 'Women', 'Unisex'];
    this.cache = {};
  }

  /**
   * Fetch all products from Supabase
   */
  async getAllProducts() {
    try {
      if (this.cache.all) {
        return this.cache.all;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      this.cache.all = data;
      return data;
    } catch (error) {
      console.error('[Products] Error fetching products:', error);
      return [];
    }
  }

  /**
   * Fetch products by category
   */
  async getProductsByCategory(category) {
    try {
      const cacheKey = `category_${category}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true });

      if (error) throw error;

      this.cache[cacheKey] = data;
      return data;
    } catch (error) {
      console.error('[Products] Error fetching products by category:', error);
      return [];
    }
  }

  /**
   * Get single product by ID
   */
  async getProductById(id) {
    try {
      const cacheKey = `product_${id}`;
      if (this.cache[cacheKey]) {
        return this.cache[cacheKey];
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      this.cache[cacheKey] = data;
      return data;
    } catch (error) {
      console.error('[Products] Error fetching product:', error);
      return null;
    }
  }

  /**
   * Search products by name or description
   */
  async searchProducts(query) {
    try {
      const products = await this.getAllProducts();
      const lowerQuery = query.toLowerCase();

      return products.filter((p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        (p.description && p.description.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('[Products] Error searching products:', error);
      return [];
    }
  }

  /**
   * Get featured products (limit 6)
   */
  async getFeaturedProducts(limit = 6) {
    try {
      const products = await this.getAllProducts();
      return products.slice(0, limit);
    } catch (error) {
      console.error('[Products] Error fetching featured products:', error);
      return [];
    }
  }

  /**
   * Create product (admin only)
   */
  async createProduct(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData]);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[Products] Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update product (admin only)
   */
  async updateProduct(id, productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id);

      if (error) throw error;

      delete this.cache[`product_${id}`];
      delete this.cache.all;
      return data;
    } catch (error) {
      console.error('[Products] Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product (admin only)
   */
  async deleteProduct(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      delete this.cache[`product_${id}`];
      delete this.cache.all;
      return data;
    } catch (error) {
      console.error('[Products] Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Get categories
   */
  getCategories() {
    return this.categories;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {};
  }
}

// Export singleton instance
export const products = new ProductsManager();

export default products;