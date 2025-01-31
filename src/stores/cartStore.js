import { defineStore } from 'pinia';
import { carts as mockCarts } from '@/mock/carts';

export const useCartStore = defineStore('cartStore', {
  state: () => ({
    cart: [...mockCarts]
  }),
  actions: {
    addToCart(product) {
      const item = this.cart.find(p => p.id === product.id);
      if (item) {
        item.quantity++;
      } else {
        this.cart.push({ ...product, quantity: 1 });
      }
    },
    removeFromCart(id) {
      this.cart = this.cart.filter(p => p.id !== id);
    },
    clearCart() {
      this.cart = [];
    }
  }
});
