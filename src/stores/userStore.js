import { defineStore } from 'pinia';

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: null, // L'utilisateur connecté
  }),
  actions: {
    login(userData) {
      this.user = userData; // Simule une connexion
      localStorage.setItem('user', JSON.stringify(userData));
    },
    logout() {
      this.user = null;
      localStorage.removeItem('user');
    },
    getRole() {
      return this.user ? this.user.role : null;
    }
  }
});
