import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';
import { useUserStore } from '@/stores/userStore';
import { useCartStore } from '@/stores/cartStore';

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

    // ✅ Mettre à jour une commande
    async updateOrder(orderId, data) {
      try {
        const response = await pb.collection('orders').update(orderId, data);
        return response;
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la commande:', error);
        throw error;
      }
    },

    // ✅ Créer une nouvelle commande
    async placeOrder() {
      const userStore = useUserStore();
      const cartStore = useCartStore();
      const userId = userStore.getUserId();

      try {
        const totalAmount = cartStore.cart.reduce((total, item) => {
          const product = cartStore.products.find(p => p.id === item.product_id);
          return total + (product.price * item.quantity);
        }, 0);

        const order = {
          user_id: userId,
          product: cartStore.cart,
          total_price: totalAmount,
          status: 'en cours',
        };

        const response = await pb.collection('orders').create(order);
        console.log('Commande créée:', response);

        // Vider le panier après la commande
        await cartStore.clearCart();
      } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        throw error;
      }
    }
  }
});