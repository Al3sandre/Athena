import { defineStore } from 'pinia';
import { users as mockUsers } from '@/mock/users';

export const useUserStore = defineStore('userStore', {
  state: () => ({
    users: [...mockUsers],
    currentUser: null
  }),
  actions: {
    login(email) {
      const user = this.users.find(u => u.email === email);
      if (user) {
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    logout() {
      this.currentUser = null;
      localStorage.removeItem('user');
    }
  }
});
