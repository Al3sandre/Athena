import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: []
  }),
  actions: {
    addNotification(message, type = 'info') {
      this.notifications.push({ message, type, id: Date.now() });
      setTimeout(() => {
        this.notifications.shift();
      }, 3000);
    }
  }
});
