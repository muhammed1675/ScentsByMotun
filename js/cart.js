/**
 * Cart Module
 * Handles shopping cart operations (add, remove, update, retrieve)
 */

class CartManager {
  constructor() {
    this.cartKey = 'cart';
    this.cart = this.loadCart();
  }

  /**
   * Load cart from localStorage
   */
  loadCart() {
    try {
      const stored = localStorage.getItem(this.cartKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[Cart] Error loading cart:', error);
      return [];
    }
  }

  /**
   * Save cart to localStorage
   */
  saveCart() {
    localStorage.setItem(this.cartKey, JSON.stringify(this.cart));
    this.dispatchCartEvent('cart_updated', { cart: this.cart });
  }

  /**
   * Add product to cart
   */
  addToCart(product, quantity = 1) {
    if (!product || !product.id) {
      throw new Error('Invalid product');
    }

    const existingItem = this.cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity,
      });
    }

    this.saveCart();
    return this.cart;
  }

  /**
   * Remove product from cart
   */
  removeFromCart(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this.saveCart();
    return this.cart;
  }

  /**
   * Update quantity
   */
  updateQuantity(productId, quantity) {
    const item = this.cart.find((item) => item.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
    }

    return this.cart;
  }

  /**
   * Get cart
   */
  getCart() {
    return this.cart;
  }

  /**
   * Get cart item count
   */
  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Get cart total
   */
  getCartTotal() {
    return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * Clear cart
   */
  clearCart() {
    this.cart = [];
    this.saveCart();
    return this.cart;
  }

  /**
   * Check if product in cart
   */
  isInCart(productId) {
    return this.cart.some((item) => item.id === productId);
  }

  /**
   * Get cart item by product ID
   */
  getCartItem(productId) {
    return this.cart.find((item) => item.id === productId);
  }

  /**
   * Dispatch custom cart event
   */
  dispatchCartEvent(eventName, detail) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }
}

// Export singleton instance
export const cart = new CartManager();

export default cart;
