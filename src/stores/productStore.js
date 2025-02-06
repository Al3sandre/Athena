import { defineStore } from 'pinia';
import pb from '@/api/pocketbase'; // Import de PocketBase

export const useProductStore = defineStore('productStore', {
  state: () => ({
    products: [] // On ne met plus les données mockées ici
  }),

  actions: {
    // ✅ Récupérer tous les produits depuis PocketBase
    async fetchProducts() {
      try {
        this.products = await pb.collection('products').getFullList();
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      }
    },

    // ✅ Ajouter un produit dans PocketBase
    async addProduct(productData) {
      try {
        const newProduct = await pb.collection('products').create(productData);
        this.products.push(newProduct); // Ajouter à la liste locale
      } catch (error) {
        console.error('Erreur lors de l’ajout du produit:', error);
      }
    },

    // ✅ Supprimer un produit dans PocketBase
    async deleteProduct(productId) {
      try {
        await pb.collection('products').delete(productId);
        this.products = this.products.filter(p => p.id !== productId);
      } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
      }
    },

    // ✅ Modifier un produit dans PocketBase
    async updateProduct(updatedProduct) {
      try {
        const product = await pb.collection('products').update(updatedProduct.id, updatedProduct);
        const index = this.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          this.products[index] = product; // Mettre à jour localement
        }
      } catch (error) {
        console.error('Erreur lors de la modification du produit:', error);
      }
    }
  }
});
