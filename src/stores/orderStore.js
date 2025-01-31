import { defineStore } from 'pinia';
import { orders as mockOrders } from '@/mock/order';

export const useOrderStore = defineStore('orderStore', {
  state: () => ({
    orders: [...mockOrders]
  }),
  actions: {
    addOrder(order) {
      this.orders.push({ id: Date.now(), ...order });
    },
    updateOrderStatus(orderId, status) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
        order.status = status;
      }
    }
  }
});
