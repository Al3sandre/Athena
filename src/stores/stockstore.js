import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';

export const useStockStore = defineStore('stock', {
  state: () => ({
    stock: [], // Liste des stocks des produits
  }),

  actions: {
    // ✅ Récupérer le stock d'un produit par ID
    async fetchStockByProductId(productId) {
      try {
        const response = await pb.get(`/products/${productId}`);
        const product = response.data;

        if (!product.stock && product.stock !== 0) {
          throw new Error(`Le produit ${productId} n'a pas de stock défini.`);
        }

        // Mettre à jour localement le stock dans le store
        const productIndex = this.stock.findIndex(item => item.id === productId);
        if (productIndex !== -1) {
          this.stock[productIndex].stock = product.stock;
        } else {
          this.stock.push({ id: productId, stock: product.stock });
        }

        return product.stock; // Retourne le stock actuel
      } catch (error) {
        console.error(`Erreur lors de la récupération du stock pour le produit ${productId} :`, error.response?.data || error.message);
        throw error;
      }
    },

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

        return updatedStock; // Retourne le stock mis à jour
      } catch (error) {
        console.error("Erreur lors de la mise à jour du stock :", error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ Récupérer tous les stocks
    async fetchAllStocks() {
      try {
        const response = await pb.get('/products');
        const products = response.data;

        // Mettre à jour localement les stocks dans le store
        this.stock = products.map(product => ({
          id: product.id,
          stock: product.stock || 0,
        }));

        return this.stock; // Retourne la liste des stocks
      } catch (error) {
        console.error("Erreur lors de la récupération des stocks :", error.response?.data || error.message);
        throw error;
      }
    },
  },
});
