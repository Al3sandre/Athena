import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';
import { useStockStore } from '@/stores/stockstore';

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
    // ✅ Vérifier les stocks avant de créer une commande
    async validateStock(orderItems) {
      const stockStore = useStockStore();

      for (const item of orderItems) {
        const productStock = stockStore.stock.find(product => product.id === item.product_id);

        // Si le produit n'est pas trouvé dans le stock, récupérez-le depuis le backend
        if (!productStock) {
          await stockStore.updateProductStock(item.product_id, 0); // Met à jour localement le stock
        }

        const updatedProductStock = stockStore.stock.find(product => product.id === item.product_id);

        if (!updatedProductStock || updatedProductStock.stock < item.quantity) {
          throw new Error(
            `Le produit ${item.product_id} n'a pas assez de stock. Stock disponible : ${updatedProductStock?.stock || 0}`
          );
        }
      }
    },

    // ✅ Récupérer toutes les commandes
    async fetchOrders(page = 1, perPage = 30, userId = null, isAdmin = false) {
      try {
        const params = { page, perPage };

        // Si l'utilisateur n'est pas admin, ajoutez un filtre par user_id
        if (!isAdmin && userId) {
          params.user_id = userId;
        }

        const response = await pb.get('/orders', { params });

        // Vérifiez que les métadonnées existent
        if (!response.data.meta) {
          this.pagination = {
            page,
            perPage,
            totalPages: 1,
            totalItems: 0,
          };
          this.orders = response.data.data || [];
          return;
        }

        this.orders = response.data.data;
        this.pagination = {
          page: response.data.meta.current_page || 1,
          perPage: response.data.meta.per_page || 30,
          totalPages: response.data.meta.last_page || 1,
          totalItems: response.data.meta.total || 0,
        };
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ Récupérer une commande par ID
    async fetchOrderById(orderId) {
      try {
        const response = await pb.get(`/orders/${orderId}`);
        this.order = response.data;
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération de la commande:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ Créer une commande
    async createOrder(orderData) {
      const stockStore = useStockStore();

      try {
        // Vérifiez les stocks avant de créer la commande
        await this.validateStock(orderData.items);

        // Créez la commande dans le backend
        const response = await pb.post('/orders', orderData);
        this.orders.push(response.data);

        // Mettez à jour les stocks après la création de la commande
        for (const item of orderData.items) {
          await stockStore.updateProductStock(item.product_id, -item.quantity);
        }

        return response.data;
      } catch (error) {
        console.error('Erreur lors de la création de la commande :', error.response?.data || error.message);
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
        console.error('Erreur lors de la mise à jour de la commande:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ Supprimer une commande
    async deleteOrder(orderId) {
      try {
        await pb.delete(`/orders/${orderId}`);
        this.orders = this.orders.filter(order => order.id !== orderId);
      } catch (error) {
        console.error('Erreur lors de la suppression de la commande:', error.response?.data || error.message);
        throw error;
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

    // ✅ Récupérer les détails d'une commande
    async fetchOrderDetails() {
      try {
        this.order = await this.fetchOrderById(route.params.id);
        this.orderItems = await this.fetchOrderItems(this.order.id);
        this.userName = this.order.user?.name || 'Utilisateur inconnu';
      } catch (error) {
        console.error('Erreur lors du chargement des détails de la commande :', error);
        this.errorMessage = 'Impossible de charger les détails de la commande.';
      }
    },
    async fetchOrdersByUserId(userId, page = 1) {
      try {
        const response = await pb.get('/orders', {
          params: {
            user_id: userId, // Filtrer par l'ID de l'utilisateur
            page,
          },
        });
        this.orders = response.data.orders;
        this.pagination = response.data.pagination;
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes par utilisateur:', error);
        throw error;
      }
    },

    // ✅ Mettre à jour le statut d'une commande
    async updateOrderStatus(order) {
      try {
        // Mettre à jour le statut de la commande via le store
        await this.updateOrder(order.id, { status: order.status });
        console.log(`Statut de la commande ${order.id} mis à jour avec succès.`);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de la commande:', error);
        this.errorMessage = 'Impossible de mettre à jour le statut de la commande.';
      }
    },
  },
});