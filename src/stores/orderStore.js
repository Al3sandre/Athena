import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';
import { useUserStore } from '@/stores/userStore';

export const useOrderStore = defineStore('orderStore', {
  state: () => ({
    orders: [],
    order: null,
    pagination: {
      page: 1,
      perPage: 30,
      totalPages: 1,
      totalItems: 0
    }
  }),

  actions: {
    // ✅ Récupérer toutes les commandes avec pagination et tri
    async fetchOrders(page = 1, perPage = 30, sort = 'status') {
      try {
        const userStore = useUserStore();
        const userRole = userStore.getRole();
        const userId = userStore.getUserId();
        
        let filter = '';
        if (userRole === 'shop') {
          filter = `user_id='${userId}'`;
        }

        const response = await pb.collection('orders').getList(page, perPage, { sort, filter });
        this.orders = response.items;
        this.pagination = {
          page: response.page,
          perPage: response.perPage,
          totalPages: response.totalPages,
          totalItems: response.totalItems
        };
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
      }
    },

    // ✅ Récupérer les commandes spécifiques à un utilisateur avec pagination et tri
    async fetchOrdersByUserId(userId, page = 1, perPage = 30, sort = 'status') {
      try {
        const filter = `user_id='${userId}'`;
        const response = await pb.collection('orders').getList(page, perPage, { sort, filter });
        this.orders = response.items;
        this.pagination = {
          page: response.page,
          perPage: response.perPage,
          totalPages: response.totalPages,
          totalItems: response.totalItems
        };
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
      }
    },

    // ✅ Récupérer les détails d'une commande par ID
    async fetchOrderById(orderId) {
      try {
        const response = await pb.collection('orders').getOne(orderId);
        this.order = response;
        return response;
      } catch (error) {
        console.error('Erreur lors de la récupération de la commande:', error);
      }
    },

    // Autres actions existantes...
  }
});