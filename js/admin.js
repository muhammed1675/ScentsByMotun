/**
 * Admin Module
 * Handles admin operations (product management, order management, etc.)
 */

import { auth } from './auth.js';
import { supabase } from './supabase.js';
import { products } from './products.js';
import { checkout } from './checkout.js';

class AdminManager {
  constructor() {
    this.ensureAdminAccess();
  }

  /**
   * Ensure user has admin access
   */
  ensureAdminAccess() {
    if (!auth.isUserAdmin()) {
      throw new Error('Admin access required');
    }
  }

  /**
   * Get all products (admin)
   */
  async getAllProducts() {
    try {
      return await products.getAllProducts();
    } catch (error) {
      console.error('[Admin] Error fetching products:', error);
      return [];
    }
  }

  /**
   * Create product
   */
  async createProduct(productData) {
    try {
      this.ensureAdminAccess();

      // Validate required fields
      if (!productData.name || !productData.price || !productData.category) {
        throw new Error('Missing required fields: name, price, category');
      }

      const payload = {
        name: productData.name,
        price: parseFloat(productData.price),
        category: productData.category,
        description: productData.description || '',
        scent_notes: productData.scent_notes || '',
        image_url: productData.image_url || '',
        created_at: new Date().toISOString(),
      };

      const result = await products.createProduct(payload);
      return result;
    } catch (error) {
      console.error('[Admin] Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  async updateProduct(productId, productData) {
    try {
      this.ensureAdminAccess();

      const payload = {
        name: productData.name || undefined,
        price: productData.price ? parseFloat(productData.price) : undefined,
        category: productData.category || undefined,
        description: productData.description || undefined,
        scent_notes: productData.scent_notes || undefined,
        image_url: productData.image_url || undefined,
        updated_at: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key]);

      const result = await products.updateProduct(productId, payload);
      return result;
    } catch (error) {
      console.error('[Admin] Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId) {
    try {
      this.ensureAdminAccess();
      return await products.deleteProduct(productId);
    } catch (error) {
      console.error('[Admin] Error deleting product:', error);
      throw error;
    }
  }

  /**
   * Upload product image to Supabase Storage
   */
  async uploadProductImage(file, productId) {
    try {
      this.ensureAdminAccess();

      if (!file || !file.type.startsWith('image/')) {
        throw new Error('Please provide a valid image file');
      }

      const fileName = `products/${productId}-${Date.now()}.${file.type.split('/')[1]}`;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${supabase.url}/storage/v1/object/products/${fileName}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabase.anonKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      // Return public URL
      return `${supabase.url}/storage/v1/object/public/products/${fileName}`;
    } catch (error) {
      console.error('[Admin] Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders() {
    try {
      this.ensureAdminAccess();
      return await checkout.getAllOrders();
    } catch (error) {
      console.error('[Admin] Error fetching orders:', error);
      return [];
    }
  }

  /**
   * Get order details with items
   */
  async getOrderDetails(orderId) {
    try {
      this.ensureAdminAccess();

      const order = await checkout.getOrder(orderId);
      if (!order) {
        return null;
      }

      const items = await checkout.getOrderItems(orderId);
      order.items = items;

      return order;
    } catch (error) {
      console.error('[Admin] Error fetching order details:', error);
      return null;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status) {
    try {
      this.ensureAdminAccess();

      const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      return await checkout.updateOrderStatus(orderId, status);
    } catch (error) {
      console.error('[Admin] Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats() {
    try {
      this.ensureAdminAccess();

      const orders = await this.getAllOrders();
      const allProducts = await this.getAllProducts();

      const totalRevenue = orders
        .filter((o) => o.status === 'paid')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      const paidOrders = orders.filter((o) => o.status === 'paid').length;
      const pendingOrders = orders.filter((o) => o.status === 'pending').length;

      return {
        totalOrders: orders.length,
        paidOrders,
        pendingOrders,
        totalRevenue,
        totalProducts: allProducts.length,
      };
    } catch (error) {
      console.error('[Admin] Error fetching dashboard stats:', error);
      return {
        totalOrders: 0,
        paidOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
      };
    }
  }
}

// Export singleton instance (note: will throw if not admin)
export const createAdminManager = () => new AdminManager();

export default createAdminManager;
