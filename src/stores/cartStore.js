import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';

export const useCartStore = defineStore('cartStore', {
  state: () => ({
    cart: []
  }),

  actions: {
    // ✅ Charger le panier depuis PocketBase (lié à l'utilisateur connecté)
    async fetchCart(userId) {
      try {
        const userCart = await pb.collection('carts').getFirstListItem(`userId="${userId}"`);
        if (userCart) {
          this.cart = userCart.items; // Charger le panier existant
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du panier :", error);
      }
    },

    // ✅ Ajouter un produit au panier
    async addToCart(userId, product) {
      try {
        const existingItem = this.cart.find(p => p.id === product.id);
        if (existingItem) {
          existingItem.quantity++;
        } else {
          this.cart.push({ ...product, quantity: 1 });
        }

        // Sauvegarde dans PocketBase
        await this.saveCart(userId);
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
      }
    },

    // ✅ Retirer un produit du panier
    async removeFromCart(userId, productId) {
      try {
        this.cart = this.cart.filter(p => p.id !== productId);
        await this.saveCart(userId);
      } catch (error) {
        console.error("Erreur lors de la suppression du produit du panier :", error);
      }
    },

    // ✅ Vider entièrement le panier
    async clearCart(userId) {
      try {
        this.cart = [];
        await this.saveCart(userId);
      } catch (error) {
        console.error("Erreur lors de la suppression du panier :", error);
      }
    },

    // ✅ Sauvegarde du panier dans PocketBase
    async saveCart(userId) {
      try {
        const existingCart = await pb.collection('carts').getFirstListItem(`userId="${userId}"`);
        if (existingCart) {
          await pb.collection('carts').update(existingCart.id, { items: this.cart });
        } else {
          await pb.collection('carts').create({ userId, items: this.cart });
        }
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du panier :", error);
      }
    }
  }
});
