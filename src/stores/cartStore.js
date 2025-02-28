import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';
import { useProductStore } from '@/stores/productStore';
import { useUserStore } from '@/stores/userStore';
// TODO Probleme de supression dans la panier dans le widget bouton retirer du panier non fonctionnel
export const useCartStore = defineStore('cartStore', {
  state: () => ({
    cart: [],
    products: [],
    isLoading: false,
  }),

  actions: {
    async fetchCart() {
      this.isLoading = true;
      const userStore = useUserStore();
      const userId = userStore.user.id; // Récupérez l'ID de l'utilisateur depuis le userStore
      try {
        const userCart = await pb.collection('carts').getFirstListItem(`user_id="${userId}"`);
        if (userCart) {
          this.cart = userCart.items;
          await this.fetchProductDetails();
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du panier :", error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProductDetails() {
      try {
        const productStore = useProductStore();
        const productIds = this.cart.map(item => item.product_id);
        const products = [];
        const controller = new AbortController(); // Créez un contrôleur d'abort unique pour toutes les requêtes
        for (const id of productIds) {
          const product = await productStore.fetchProductById(id, { signal: controller.signal });
          products.push(product);
        }
        this.products = products;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Erreur lors de la récupération des détails des produits :", error);
        }
      }
    },

    async addToCart(product, quantity) {
      const userStore = useUserStore();
      const userId = userStore.user.id; // Récupérez l'ID de l'utilisateur depuis le userStore
      try {
        const existingItem = this.cart.find(p => p.product_id === product.id);
        if (existingItem) {
          existingItem.quantity += quantity; // Ajoutez la quantité spécifiée
        } else {
          this.cart.push({ product_id: product.id, quantity });
        }

        await this.saveCart(userId);
        await this.fetchProductDetails();
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
      }
    },

    async removeFromCart(productId) {
      const userStore = useUserStore();
      const userId = userStore.user.id; // Récupérez l'ID de l'utilisateur depuis le userStore
      try {
        this.cart = this.cart.filter(p => p.product_id !== productId);
        await this.saveCart(userId);
        await this.fetchProductDetails();
      } catch (error) {
        console.error("Erreur lors de la suppression du produit du panier :", error);
      }
    },

    async clearCart() {
      const userStore = useUserStore();
      const userId = userStore.user.id; // Récupérez l'ID de l'utilisateur depuis le userStore
      try {
        this.cart = [];
        await this.saveCart(userId);
        this.products = [];
      } catch (error) {
        console.error("Erreur lors de la suppression du panier :", error);
      }
    },

    async saveCart(userId) {
      try {
        const existingCart = await pb.collection('carts').getFirstListItem(`user_id="${userId}"`);
        if (existingCart) {
          await pb.collection('carts').update(existingCart.id, { items: this.cart });
        } else {
          await pb.collection('carts').create({ user_id: userId, items: this.cart });
        }
      } catch (error) {
        console.error("Erreur lors de la sauvegarde du panier :", error);
      }
    },

    async updateQuantity(productId, quantity) {
      const userStore = useUserStore();
      const userId = userStore.user.id; // Récupérez l'ID de l'utilisateur depuis le userStore
      const item = this.cart.find(p => p.product_id === productId);
      if (item) {
        item.quantity = quantity;
        await this.saveCart(userId); // Utilisez userId pour obtenir l'ID de l'utilisateur
      }
    }
  }
});