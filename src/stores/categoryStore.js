import { defineStore } from 'pinia';
import pb from '@/api/pocketbase'; // Utilisation de l'instance pb configurée

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    categories: [], // Liste des catégories
    isLoading: false, // Indicateur de chargement
  }),

  actions: {
    // ✅ Récupérer toutes les catégories depuis l'API Laravel
    async fetchCategories() {
      this.isLoading = true;
      try {
        const response = await pb.get('/categories');
        this.categories = Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        this.categories = [];
      } finally {
        this.isLoading = false;
      }
    },

    // ✅ Ajouter une catégorie via l'API Laravel
    async addCategory(categoryData) {
      try {
        const response = await pb.post('/categories', categoryData);
        this.categories.push(response.data); // Ajout localement
        return response.data;
      } catch (error) {
        console.error('Erreur lors de l’ajout de la catégorie:', error);
        throw error;
      }
    },

    // ✅ Modifier une catégorie existante via l'API Laravel
    async updateCategory(categoryId, updatedData) {
      try {
        const response = await pb.put(`/categories/${categoryId}`, updatedData);
        const index = this.categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
          this.categories[index] = response.data; // Mise à jour locale
        }
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // ✅ Supprimer une catégorie via l'API Laravel
    async deleteCategory(categoryId) {
      try {
        await pb.delete(`/categories/${categoryId}`);
        this.categories = this.categories.filter(c => c.id !== categoryId); // Suppression locale
      } catch (error) {
        throw error;
      }
    },

    // ✅ Récupérer une seule catégorie par ID via l'API Laravel
    async fetchCategoryById(categoryId) {
      try {
        const response = await pb.get(`/categories/${categoryId}`);
        return response.data;
      } catch (error) {
        return null;
      }
    },

    // ✅ Associer un produit à une catégorie
    async attachProductToCategory(categoryId, productId) {
      try {
        const response = await pb.post(`/categories/${categoryId}/products`, {
          product_id: productId,
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // ✅ Dissocier un produit d'une catégorie
    async detachProductFromCategory(categoryId, productId) {
      try {
        await pb.delete(`/categories/${categoryId}/products/${productId}`);
      } catch (error) {
        throw error;
      }
    },
  }, // Fin du bloc actions
});
