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

          // Mettez à jour la quantité dans le backend
          await pb.put(`/cart-items/${existingItem.id}`, { quantity: existingItem.quantity });
        } else {
          // Récupérez les informations complètes du produit depuis le backend
          const productResponse = await pb.get(`/products/${productId}`);
          const product = productResponse.data;

          // Ajoutez le produit au backend
          const response = await pb.post(`/cart-items`, {
            cart_id: this.cartId, // Assurez-vous que `cartId` est défini
            product_id: productId,
            quantity,
          });

          // Loggez la réponse pour voir l'objet retourné
          console.log("Réponse de l'API après ajout au panier :", response.data);

          // Ajoutez l'article au panier localement avec l'ID retourné
          this.cartItems.push({
            id: response.data.id, // ID unique de l'article du panier (retourné par l'API)
            product_id: productId,
            quantity,
            product, // Inclure les détails du produit
          });
        }
      } catch (error) {
        console.error("Erreur lors de l'ajout au panier :", error);
      }
    },

    // ✅ Mettre à jour la quantité d'un article
    async updateCartItem(cartItemId, quantity) {
      console.log('cartItemId:', cartItemId);
      console.log('quantity:', quantity);
      try {
        // Vérifiez que cartItemId est défini
        if (!cartItemId) {
          throw new Error("L'ID de l'article du panier est manquant.");
        }

        // Effectuez la requête PUT pour mettre à jour la quantité
        const response = await pb.put(`/cart-items/${cartItemId}`, { quantity });
        console.log("Réponse de la mise à jour :", response.data);

        // Mettez à jour localement la quantité dans le store
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
        // Supprimez l'article du backend
        await pb.delete(`/cart-items/${cartItemId}`);
        console.log(`Article avec l'ID ${cartItemId} supprimé du panier.`);

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