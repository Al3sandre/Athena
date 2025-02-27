import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';

export const useCategoryStore = defineStore('categoryStore', {
  state: () => ({
    categories: []
  }),

  actions: {
    // ✅ Récupérer toutes les catégories depuis PocketBase
    async fetchCategories() {
      try {
        this.categories = await pb.collection('categories').getFullList();
      } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
      }
    },

    // ✅ Ajouter une catégorie dans PocketBase
    async addCategory(categoryData) {
      try {
        const newCategory = await pb.collection('categories').create(categoryData);
        this.categories.push(newCategory); // Ajout localement
        return newCategory;
      } catch (error) {
        console.error('Erreur lors de l’ajout de la catégorie:', error);
        throw error;
      }
    },

    // ✅ Modifier une catégorie existante dans PocketBase
    async updateCategory(categoryId, updatedData) {
      try {
        const updatedCategory = await pb.collection('categories').update(categoryId, updatedData);
        const index = this.categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
      } catch (error) {
        console.error('Erreur lors de la modification de la catégorie:', error);
      }
    },

    // ✅ Supprimer une catégorie dans PocketBase
    async deleteCategory(categoryId) {
      try {
        await pb.collection('categories').delete(categoryId);
        this.categories = this.categories.filter(c => c.id !== categoryId);
      } catch (error) {
        console.error('Erreur lors de la suppression de la catégorie:', error);
      }
    },

    // ✅ Récupérer une seule catégorie par ID
    async fetchCategoryById(categoryId) {
      try {
        return await pb.collection('categories').getOne(categoryId);
      } catch (error) {
        console.error('Erreur lors de la récupération de la catégorie:', error);
        return null;
      }
    }
  }
});
