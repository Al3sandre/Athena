import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';

export const useOrderStore = defineStore('orderStore', {
  state: () => ({
    orders: [],
    order: null,
    pagination: {
      page: 1,
      perPage: 30,
      totalPages: 1,
      totalItems: 0,
    },
  }),

  actions: {
    // ✅ Récupérer toutes les commandes
    async fetchOrders(page = 1, perPage = 30) {
      try {
        const response = await pb.get('/orders', {
          params: { page, perPage },
        });
        this.orders = response.data;
        this.pagination = {
          page: response.meta.current_page,
          perPage: response.meta.per_page,
          totalPages: response.meta.last_page,
          totalItems: response.meta.total,
        };
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
      }
    },

    // ✅ Récupérer une commande par ID
    async fetchOrderById(orderId) {
      try {
        const response = await pb.get(`/orders/${orderId}`);
        this.order = response.data;
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération de la commande:', error);
      }
    },

    // ✅ Créer une commande
    async createOrder(orderData) {
      try {
        const response = await pb.post('/orders', orderData);
        this.orders.push(response.data);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        throw error;
      }
    },

    // ✅ Mettre à jour une commande
    async updateOrder(orderId, updatedData) {
      try {
        const response = await pb.put(`/orders/${orderId}`, updatedData);
        const index = this.orders.findIndex(order => order.id === orderId);
        if (index !== -1) {
          this.orders[index] = response.data;
        }
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la commande:', error);
        throw error;
      }
    },

    // ✅ Supprimer une commande
    async deleteOrder(orderId) {
      try {
        await pb.delete(`/orders/${orderId}`);
        this.orders = this.orders.filter(order => order.id !== orderId);
      } catch (error) {
        console.error('Erreur lors de la suppression de la commande:', error);
      }
    },

    // ✅ Récupérer les items d'une commande
    async fetchOrderItems(orderId) {
      try {
        const response = await pb.get(`/order-items`, {
          params: { order_id: orderId },
        });
        return response.data; // Retourne les items de la commande
      } catch (error) {
        console.error('Erreur lors de la récupération des items de la commande:', error);
        throw error;
      }
    },

    // ✅ Ajouter un item à une commande
    async addOrderItem(orderId, itemData) {
      try {
        const response = await pb.post(`/order-items`, {
          ...itemData,
          order_id: orderId,
        });
        return response.data; // Retourne l'item ajouté
      } catch (error) {
        console.error('Erreur lors de l\'ajout d\'un item à la commande:', error);
        throw error;
      }
    },

    // ✅ Mettre à jour un item d'une commande
    async updateOrderItem(itemId, updatedData) {
      try {
        const response = await pb.put(`/order-items/${itemId}`, updatedData);
        return response.data; // Retourne l'item mis à jour
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'item de la commande:', error);
        throw error;
      }
    },

    // ✅ Supprimer un item d'une commande
    async deleteOrderItem(itemId) {
      try {
        await pb.delete(`/order-items/${itemId}`);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'item de la commande:', error);
        throw error;
      }
    },
  },
});