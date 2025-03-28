import { defineStore } from 'pinia';
import pb from '@/api/pocketbase'; // Utilisation de l'instance Axios configurée

export const useProductStore = defineStore('productStore', {
  state: () => ({
    products: [], // Liste des produits
    isLoading: false, // Indicateur de chargement
  }),

  actions: {
    // ✅ Récupérer tous les produits depuis l'API Laravel
    async fetchProducts() {
      this.isLoading = true;
      try {
        const response = await pb.get('/products');
        this.products = Array.isArray(response.data) ? response.data : []; // Assurez-vous que c'est un tableau
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        this.products = []; // Réinitialisez à un tableau vide en cas d'erreur
      } finally {
        this.isLoading = false;
      }
    },

    // ✅ Récupérer un produit par ID depuis l'API Laravel
    async fetchProductById(productId) {
      try {
        const response = await pb.get(`/products/${productId}`);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error);
        throw error;
      }
    },

    // ✅ Ajouter un produit via l'API Laravel
    async addProduct(productData) {
      try {
        const response = await pb.post('/products', productData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        this.products.push(response.data);

        // Synchroniser les produits après la création
        await this.fetchProducts();

        return response.data;
      } catch (error) {
        console.error('Erreur lors de l’ajout du produit :', error);
        throw error;
      }
    },

    // ✅ Modifier un produit via l'API Laravel
    async updateProduct(productId, data) {
      try {
        const response = await pb.post(`/products/${productId}?_method=PUT`, data, {
          headers: {
            'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
          },
        });
        return response.data.product;
      } catch (error) {
        console.error('Erreur lors de la modification du produit:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ Supprimer un produit via l'API Laravel
    async deleteProduct(productId) {
      try {
        await pb.delete(`/products/${productId}`);
        this.products = this.products.filter(p => p.id !== productId); // Suppression locale
      } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        throw error;
      }
    },

    // ✅ Générer l'URL de l'image
    getImageUrl(product) {
      if (product.image) {
        return `/storage/${product.image}`; // Assurez-vous que l'URL correspond à votre configuration Laravel
      }
      return 'default-image-url'; // Remplacez par l'URL de l'image par défaut
    },
  },
});