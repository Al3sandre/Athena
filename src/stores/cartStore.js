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
      try {
        // Vérifiez si le produit est déjà dans le panier
        const existingItem = this.cartItems.find(item => item.product_id === productId);
        if (existingItem) {
          // Si le produit est déjà dans le panier, mettez simplement à jour la quantité
          existingItem.quantity += quantity;
        } else {
          // Récupérez les informations complètes du produit depuis le backend
          const response = await pb.get(`/products/${productId}`);
          const product = response.data;

          // Ajoutez le produit avec ses informations complètes au panier
          this.cartItems.push({
            product_id: productId,
            quantity,
            product, // Inclure les détails du produit
          });
        }
      } catch (error) {
        console.error('Erreur lors de l\'ajout au panier :', error);
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

    async removeFromCart(productId) {
      try {
        // Supprimez l'article du backend si nécessaire
        await pb.delete(`/cart-items/${productId}`);

        // Supprimez l'article localement
        this.cartItems = this.cartItems.filter(item => item.product_id !== productId);
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

    // ✅ Synchroniser les items du panier
    async syncCartItems() {
      try {
        const updatedItems = await Promise.all(
          this.cartItems.map(async (item) => {
            const response = await pb.get(`/products/${item.product_id}`);
            return {
              ...item,
              product: response.data, // Met à jour les informations du produit
            };
          })
        );
        this.cartItems = updatedItems; // Met à jour le panier avec les nouvelles données
      } catch (error) {
        console.error('Erreur lors de la synchronisation des items du panier:', error);
      }
    },
  },
});