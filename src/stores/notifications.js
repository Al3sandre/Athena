import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notificationStore', {
  state: () => ({
    notifications: JSON.parse(localStorage.getItem('notifications')) || [] // Chargement persistant
  }),

  actions: {
    // ✅ Ajouter une notification avec persistance
    addNotification(message, type = 'info', duration = 3000) {
      const notification = { id: Date.now(), message, type };
      this.notifications.push(notification);
      this.saveNotifications();

      // Suppression automatique après la durée spécifiée
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    },

    // ✅ Supprimer une notification spécifique
    removeNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.saveNotifications();
    },

    // ✅ Vider toutes les notifications
    clearNotifications() {
      this.notifications = [];
      localStorage.removeItem('notifications');
    },

    // ✅ Sauvegarder les notifications dans le localStorage
    saveNotifications() {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }
  }
});
