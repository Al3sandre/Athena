import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';

export const useStockStore = defineStore('stock', {
  state: () => ({
    stockArrivals: []
  }),

  actions: {
    // ✅ Récupérer tous les arrivages depuis PocketBase
    async fetchStockArrivals() {
      try {
        this.stockArrivals = await pb.collection('stock_arrivals').getFullList();
      } catch (error) {
        console.error('Erreur lors de la récupération des arrivages:', error);
      }
    },

    // ✅ Ajouter un nouvel arrivage dans PocketBase
    async addStockArrival(arrivalData) {
      try {
        const newArrival = await pb.collection('stock_arrivals').create(arrivalData);
        this.stockArrivals.push(newArrival); // Met à jour localement
        return newArrival;
      } catch (error) {
        console.error('Erreur lors de l’ajout de l’arrivage:', error);
        throw error;
      }
    },

    // ✅ Modifier un arrivage existant dans PocketBase
    async updateStockArrival(arrivalId, updatedData) {
      try {
        const updatedArrival = await pb.collection('stock_arrivals').update(arrivalId, updatedData);
        const index = this.stockArrivals.findIndex(a => a.id === arrivalId);
        if (index !== -1) {
          this.stockArrivals[index] = updatedArrival;
        }
      } catch (error) {
        console.error('Erreur lors de la modification de l’arrivage:', error);
      }
    },

    // ✅ Supprimer un arrivage dans PocketBase
    async deleteStockArrival(arrivalId) {
      try {
        await pb.collection('stock_arrivals').delete(arrivalId);
        this.stockArrivals = this.stockArrivals.filter(a => a.id !== arrivalId);
      } catch (error) {
        console.error('Erreur lors de la suppression de l’arrivage:', error);
      }
    }
  }
});
