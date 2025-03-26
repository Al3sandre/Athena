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
            id: item.id, // ID unique de l'entrée dans la table cart_items
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
      } catch (error) {
        console.error("Erreur lors de la création du panier :", error);
      }
    },

    // ✅ Ajouter un article au panier
    async addToCart(productId, quantity) {
      try {
        const existingItem = this.cartItems.find(item => item.product_id === productId);
        if (existingItem) {
          existingItem.quantity += quantity;

          // Mettez à jour la quantité dans le backend
          await pb.put(`/cart-items/${existingItem.id}`, { quantity: existingItem.quantity });
        } else {
          const productResponse = await pb.get(`/products/${productId}`);
          const product = productResponse.data;

          // Ajoutez le produit au backend
          const response = await pb.post(`/cart-items`, {
            cart_id: this.cartId,
            product_id: productId,
            quantity,
          });

          // Ajoutez l'article au panier localement
          this.cartItems.push({
            id: response.data.id,
            product_id: productId,
            quantity,
            product,
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
      }
    },

    // ✅ Mettre à jour la quantité d'un article
    async updateCartItem(cartItemId, quantity) {
      try {
        const item = this.cartItems.find(item => item.id === cartItemId);
        if (!item) {
          throw new Error("Article introuvable dans le panier.");
        }

        const quantityChange = quantity - item.quantity;

        // Effectuez la requête PUT pour mettre à jour la quantité
        await pb.put(`/cart-items/${cartItemId}`, { quantity });

        // Mettez à jour localement la quantité dans le store
        item.quantity = quantity;
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'article du panier :", error);
      }
    },

    // ✅ Supprimer un article du panier
    async removeFromCart(cartItemId) {
      try {
        const item = this.cartItems.find(item => item.id === cartItemId);
        if (!item) {
          throw new Error("Article introuvable dans le panier.");
        }

        // Supprimez l'article du backend
        await pb.delete(`/cart-items/${cartItemId}`);

        // Supprimez l'article localement
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