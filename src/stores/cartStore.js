import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';
import { useProductStore } from '@/stores/productStore';

export const useCartStore = defineStore('cartStore', {
  state: () => ({
    cart: [],
    products: [], // Ajouter un état pour stocker les détails des produits
    isLoading: false // Ajouter un état de chargement
  }),

  actions: {
    // ✅ Charger le panier depuis PocketBase (lié à l'utilisateur connecté)
    async fetchCart(userId) {
      this.isLoading = true; // Début du chargement
      try {
        const userCart = await pb.collection('carts').getFirstListItem(`user_id="${userId}"`);
        if (userCart) {
          this.cart = userCart.items; // Charger le panier existant
          await this.fetchProductDetails(); // Récupérer les détails des produits
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du panier :", error);
      } finally {
        this.isLoading = false; // Fin du chargement
      }
    },

    // ✅ Récupérer les détails des produits
    async fetchProductDetails() {
      try {
        const productStore = useProductStore();
        const productIds = this.cart.map(item => item.product_id);
        const products = await Promise.all(productIds.map(id => productStore.fetchProductById(id)));
        this.products = products;
      } catch (error) {
        console.error("Erreur lors de la récupération des détails des produits :", error);
      }
    },

    // ✅ Ajouter un produit au panier
    async addToCart(userId, product) {
      try {
        const existingItem = this.cart.find(p => p.product_id === product.id);
        if (existingItem) {
          existingItem.quantity++;
        } else {
          this.cart.push({ product_id: product.id, quantity: 1 });
        }

        // Sauvegarde dans PocketBase
        await this.saveCart(userId);
        await this.fetchProductDetails(); // Mettre à jour les détails des produits
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
      }
    },

    // ✅ Retirer un produit du panier
    async removeFromCart(userId, productId) {
      try {
        this.cart = this.cart.filter(p => p.product_id !== productId);
        await this.saveCart(userId);
        await this.fetchProductDetails(); // Mettre à jour les détails des produits
      } catch (error) {
        console.error("Erreur lors de la suppression du produit du panier :", error);
      }
    },

    // ✅ Vider entièrement le panier
    async clearCart(userId) {
      try {
        this.cart = [];
        await this.saveCart(userId);
        this.products = []; // Vider les détails des produits
      } catch (error) {
        console.error("Erreur lors de la suppression du panier :", error);
      }
    },

    // ✅ Sauvegarde du panier dans PocketBase
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
    }
  }
});