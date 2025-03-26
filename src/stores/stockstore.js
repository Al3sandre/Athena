import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';

export const useStockStore = defineStore('stock', {
  state: () => ({
    stock: [],
  }),

  actions: {
    // ✅ Mettre à jour uniquement le stock d'un produit
    async updateProductStock(productId, quantityChange) {
      try {
        // Récupérez les informations actuelles du produit pour obtenir le stock actuel
        const response = await pb.get(`/products/${productId}`);
        const product = response.data;

        if (!product.stock && product.stock !== 0) {
          throw new Error(`Le produit ${productId} n'a pas de stock défini.`);
        }

        const updatedStock = product.stock + quantityChange;

        if (updatedStock < 0) {
          throw new Error(`Le stock du produit ${productId} ne peut pas être négatif.`);
        }

        // Envoyer uniquement la mise à jour du stock au backend
        await pb.put(`/products/${productId}/stock`, { stock: updatedStock });

        // Mettre à jour localement le stock dans le store
        const productIndex = this.stock.findIndex(item => item.id === productId);
        if (productIndex !== -1) {
          this.stock[productIndex].stock = updatedStock;
        } else {
          this.stock.push({ id: productId, stock: updatedStock });
        }

      } catch (error) {
        console.error("Erreur lors de la mise à jour du stock :", error.response?.data || error.message);
      }
    },
  },
});
