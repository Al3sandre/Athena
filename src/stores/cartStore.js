import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';
import { useUserStore } from '@/stores/userStore';

export const useCartStore = defineStore('cartStore', {
  state: () => ({
    cartId: null,
    cartItems: [],
    isLoading: false,
  }),

  actions: {
    // ✅ Récupérer le panier de l'utilisateur
    async fetchCart() {
      const userStore = useUserStore();
      if (!userStore.user) {
        console.error("Utilisateur non connecté.");
        return;
      }
      this.isLoading = true;
      try {
        const response = await pb.get(`/carts`, {
          params: { user_id: userStore.user.id },
        });
        if (response.data.length > 0) {
          this.cartId = response.data[0].id;
          this.cartItems = response.data[0].items.map(item => ({
            id: item.id,
            cart_id: item.cart_id,
            product_id: item.product_id,
            quantity: item.quantity,
            product: item.product || null, // Inclure les données du produit si disponibles
          }));
        } else {
          console.warn("Aucun panier trouvé. Création d'un nouveau panier.");
          await this.createCart(userStore.user.id);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du panier :", error);
      } finally {
        this.isLoading = false;
      }
    },

    // ✅ Créer un nouveau panier
    async createCart(userId) {
      try {
        const response = await pb.post(`/carts`, { user_id: userId });
        this.cartId = response.data.id;
        this.cartItems = [];
        console.log("Nouveau panier créé avec l'ID :", this.cartId);
      } catch (error) {
        console.error("Erreur lors de la création du panier :", error);
      }
    },

    // ✅ Ajouter un article au panier
    async addToCart(productId, quantity) {
      if (!this.cartId) {
        console.warn("Aucun panier trouvé. Création d'un nouveau panier.");
        const userStore = useUserStore();
        await this.createCart(userStore.user.id);
      }
      try {
        const existingItem = this.cartItems.find(item => item.product_id === productId);
        if (existingItem) {
          await this.updateCartItem(existingItem.id, existingItem.quantity + quantity);
        } else {
          const response = await pb.post(`/cart-items`, {
            cart_id: this.cartId,
            product_id: productId,
            quantity,
          });
          this.cartItems.push({
            id: response.data.id,
            cart_id: response.data.cart_id,
            product_id: response.data.product_id,
            quantity: response.data.quantity,
            product: response.data.product || null,
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
      }
    },

    // ✅ Mettre à jour la quantité d'un article
    async updateCartItem(cartItemId, quantity) {
      try {
        await pb.put(`/cart-items/${cartItemId}`, { quantity });
        const item = this.cartItems.find(item => item.id === cartItemId);
        if (item) {
          item.quantity = quantity;
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'article du panier :", error);
      }
    },

    // ✅ Supprimer un article du panier
    async removeFromCart(cartItemId) {
      try {
        await pb.delete(`/cart-items/${cartItemId}`);
        this.cartItems = this.cartItems.filter(item => item.id !== cartItemId);
      } catch (error) {
        console.error("Erreur lors de la suppression de l'article du panier :", error);
      }
    },

    // ✅ Vider le panier
    async clearCart() {
      try {
        for (const item of this.cartItems) {
          await this.removeFromCart(item.id);
        }
        this.cartItems = [];
      } catch (error) {
        console.error("Erreur lors du vidage du panier :", error);
      }
    },


  },
});