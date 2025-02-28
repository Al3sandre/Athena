import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';

export const useProductStore = defineStore('productStore', {
  state: () => ({
    products: [],
  }),

  actions: {
    // ✅ Récupérer tous les produits depuis PocketBase
    async fetchProducts() {
      try {
        this.products = await pb.collection('products').getFullList({
          expand: 'category' // Assurez-vous que la catégorie est incluse
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
      }
    },

    // ✅ Récupérer un produit par ID depuis PocketBase
    async fetchProductById(id, options = {}) {
      try {
        const product = await pb.collection('products').getOne(id, {
          expand: 'category', // Assurez-vous que la catégorie est incluse
          ...options
        });
        return product;
      } catch (error) {
        console.error("Erreur lors de la récupération du produit :", error);
        throw error;
      }
    },
    // ✅ Ajouter un produit dans PocketBase
    async addProduct(productData) {
      try {
        let newProduct;
        if (productData instanceof FormData) {
          newProduct = await pb.collection('products').create(productData);
        } else {
          newProduct = await pb.collection('products').create(productData);
        }
        this.products.push(newProduct); // Ajouter à la liste locale
      } catch (error) {
        console.error('Erreur lors de l’ajout du produit:', error);
        throw error;
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
    async updateProduct(id, data) {
      try {
        const updatedProduct = await pb.collection('products').update(id, data);
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = updatedProduct; // Mettre à jour localement
        }
        return updatedProduct; // Retourner le produit mis à jour
      } catch (error) {
        console.error('Erreur lors de la modification du produit:', error);
        throw error;
      }
    },

    // ✅ Générer l'URL de l'image
    getImageUrl(product) {
      if (product.image) {
        return pb.files.getURL(product, product.image);
      }
      return 'default-image-url'; // Remplacez par l'URL de l'image par défaut
    }
  }
});