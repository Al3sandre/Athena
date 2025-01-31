import { defineStore } from 'pinia';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),
  actions: {
    async login(email, password) {
      try {
        const authData = await pb.collection('users').authWithPassword(email, password);
        this.user = authData.record;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        console.error('Login failed', error);
      }
    },
    logout() {
      this.user = null;
      localStorage.removeItem('user');
    }
  }
});
