import { defineStore } from 'pinia';
import axios from 'axios';

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    categories: []
  }),

  actions: {
    // ✅ Récupérer toutes les catégories depuis l'API Laravel
    async fetchCategories() {
      try {
        const response = await axios.get('/api/categories');
        this.categories = response.data; // Mise à jour de l'état local
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
      }
    },

    // ✅ Ajouter une catégorie via l'API Laravel
    async addCategory(categoryData) {
      try {
        const response = await axios.post('/api/categories', categoryData);
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
        const response = await axios.put(`/api/categories/${categoryId}`, updatedData);
        const index = this.categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
          this.categories[index] = response.data; // Mise à jour locale
        }
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la modification de la catégorie:', error);
        throw error;
      }
    },

    // ✅ Supprimer une catégorie via l'API Laravel
    async deleteCategory(categoryId) {
      try {
        await axios.delete(`/api/categories/${categoryId}`);
        this.categories = this.categories.filter(c => c.id !== categoryId); // Suppression locale
      } catch (error) {
        console.error('Erreur lors de la suppression de la catégorie:', error);
        throw error;
      }
    },

    // ✅ Récupérer une seule catégorie par ID via l'API Laravel
    async fetchCategoryById(categoryId) {
      try {
        const response = await axios.get(`/api/categories/${categoryId}`);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération de la catégorie:', error);
        return null;
      }
    }
  }
});
