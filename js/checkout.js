/**
 * Checkout Module
 * Handles order creation, payment processing, and order management
 */

import CONFIG from '../config.js';
import { supabase } from './supabase.js';
import { auth } from './auth.js';
import { cart } from './cart.js';
import PaystackPop from 'paystack-pop'; // Declare the PaystackPop variable

class CheckoutManager {
  constructor() {
    this.currentOrder = null;
  }

  /**
   * Create order in Supabase
   */
  async createOrder(orderData) {
    try {
      if (!auth.isAuthenticated()) {
        throw new Error('User must be authenticated to create an order');
      }

      const user = auth.getUser();
      const cartItems = cart.getCart();

      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      const totalAmount = cart.getCartTotal();

      // Create order
      const orderPayload = {
        user_id: user.id,
        total_amount: totalAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
        ...orderData,
      };

      const [createdOrder] = await supabase.create('orders', orderPayload);

      if (!createdOrder || !createdOrder.id) {
        throw new Error('Failed to create order');
      }

      // Create order items
      for (const item of cartItems) {
        await supabase.create('order_items', {
          order_id: createdOrder.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          created_at: new Date().toISOString(),
        });
      }

      this.currentOrder = createdOrder;
      return createdOrder;
    } catch (error) {
      console.error('[Checkout] Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId) {
    try {
      const orders = await supabase.get('orders', {
        select: '*',
        filter: `id=eq.${orderId}`,
      });

      return orders.length > 0 ? orders[0] : null;
    } catch (error) {
      console.error('[Checkout] Error fetching order:', error);
      return null;
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId) {
    try {
      const orders = await supabase.get('orders', {
        select: '*',
        filter: `user_id=eq.${userId}`,
        order: 'order_by=created_at.desc',
      });

      return orders;
    } catch (error) {
      console.error('[Checkout] Error fetching user orders:', error);
      return [];
    }
  }

  /**
   * Get order items
   */
  async getOrderItems(orderId) {
    try {
      const items = await supabase.get('order_items', {
        select: '*',
        filter: `order_id=eq.${orderId}`,
      });

      return items;
    } catch (error) {
      console.error('[Checkout] Error fetching order items:', error);
      return [];
    }
  }

  /**
   * Get all orders (admin only)
   */
  async getAllOrders() {
    try {
      if (!auth.isUserAdmin()) {
        throw new Error('Admin access required');
      }

      const orders = await supabase.get('orders', {
        select: '*',
        order: 'order_by=created_at.desc',
      });

      return orders;
    } catch (error) {
      console.error('[Checkout] Error fetching all orders:', error);
      return [];
    }
  }

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(orderId, status) {
    try {
      if (!auth.isUserAdmin()) {
        throw new Error('Admin access required');
      }

      return await supabase.update(
        'orders',
        { status, updated_at: new Date().toISOString() },
        `id=eq.${orderId}`
      );
    } catch (error) {
      console.error('[Checkout] Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Get current order
   */
  getCurrentOrder() {
    return this.currentOrder;
  }

  /**
   * Initialize Paystack payment
   */
  initializePayment(orderId, email, amount) {
    return new Promise((resolve, reject) => {
      // Generate unique reference
      const reference = `SBM-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const handler = PaystackPop.setup({
        key: CONFIG.PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: amount * 100, // Convert to kobo
        currency: 'NGN',
        ref: reference,
        onClose: () => {
          reject(new Error('Payment window closed'));
        },
        onSuccess: async (response) => {
          try {
            // Verify payment with Edge Function
            const verification = await this.verifyPayment(response.reference, orderId);
            resolve(verification);
          } catch (error) {
            reject(error);
          }
        },
      });

      handler.openIframe();
    });
  }

  /**
   * Verify payment with Supabase Edge Function
   */
  async verifyPayment(reference, orderId) {
    try {
      const result = await supabase.callFunction('verify-payment', {
        reference,
        order_id: orderId,
      });

      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('[Checkout] Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Handle payment success
   */
  async handlePaymentSuccess(orderId) {
    try {
      // Update order status to paid
      await this.updateOrderStatus(orderId, 'paid');

      // Clear cart
      cart.clearCart();

      return await this.getOrder(orderId);
    } catch (error) {
      console.error('[Checkout] Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Handle payment failure
   */
  async handlePaymentFailure(orderId, error) {
    try {
      // Update order status to failed
      await this.updateOrderStatus(orderId, 'failed');

      return await this.getOrder(orderId);
    } catch (err) {
      console.error('[Checkout] Error handling payment failure:', err);
      throw err;
    }
  }
}

// Export singleton instance
export const checkout = new CheckoutManager();

export default checkout;
