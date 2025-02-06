import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';

export const useOrderStore = defineStore('orderStore', {
  state: () => ({
    orders: []
  }),

  actions: {
    // ✅ Récupérer toutes les commandes depuis PocketBase
    async fetchOrders() {
      try {
        this.orders = await pb.collection('orders').getFullList();
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
      }
    },

    // ✅ Ajouter une commande dans PocketBase
    async addOrder(orderData) {
      try {
        const newOrder = await pb.collection('orders').create(orderData);
        this.orders.push(newOrder); // Ajouter dans l'état local
        return newOrder;
      } catch (error) {
        console.error('Erreur lors de l’ajout de la commande:', error);
        throw error;
      }
    },

    // ✅ Modifier une commande existante dans PocketBase
    async updateOrder(orderId, updatedData) {
      try {
        const updatedOrder = await pb.collection('orders').update(orderId, updatedData);
        const index = this.orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
      } catch (error) {
        console.error('Erreur lors de la modification de la commande:', error);
      }
    },

    // ✅ Supprimer une commande dans PocketBase
    async deleteOrder(orderId) {
      try {
        await pb.collection('orders').delete(orderId);
        this.orders = this.orders.filter(o => o.id !== orderId);
      } catch (error) {
        console.error('Erreur lors de la suppression de la commande:', error);
      }
    },

    // ✅ Récupérer une seule commande par ID
    async fetchOrderById(orderId) {
      try {
        return await pb.collection('orders').getOne(orderId);
      } catch (error) {
        console.error('Erreur lors de la récupération de la commande:', error);
        return null;
      }
    }
  }
});
