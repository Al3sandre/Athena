import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: null,
    users: [],
    token: localStorage.getItem('auth_token') || null,
  }),

  actions: {
    async login(email, password) {
      try {
        const response = await pb.post('/login', { email, password });
        console.log('Réponse de connexion:', response.data);
        this.token = response.data.access_token; // Assurez-vous d'utiliser le bon champ pour le token
        localStorage.setItem('auth_token', this.token);
        await this.loadUserFromSession(response.data.user.id); // Charger les informations de l'utilisateur après la connexion
        return true;
      } catch (error) {
        console.error('Erreur de connexion:', error);
        return false;
      }
    },

    async logout() {
      try {
        await pb.post('/logout', {}, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        this.user = null;
        this.token = null;
        localStorage.removeItem('auth_token');
      } catch (error) {
        console.error('Erreur de déconnexion:', error);
      }
    },

    async loadUserFromSession(userId) {
      if (!this.token) {
        console.error('Aucun token trouvé, utilisateur non connecté.');
        // Afficher un message de notification ici si nécessaire
        return;
      }
      try {
        const response = await pb.get(`/users/${userId}`, { // Utiliser le bon endpoint pour récupérer les informations de l'utilisateur connecté
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        this.user = response.data; // Assurez-vous que la réponse contient les informations de l'utilisateur
      } catch (error) {
        console.error('Erreur lors du chargement de l’utilisateur:', error);
        this.user = null;
      }
    },

    getRole() {
      return this.user ? this.user.role : null;
    },

    getUserId() {
      return this.user ? this.user.id : null;
    },

    isAdmin() {
      return this.getRole() === 'admin';
    },

    async createUser(userData) {
      try {
        const response = await pb.post('/users', userData, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        this.users.push(response.data);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la création de l’utilisateur:', error);
        throw error;
      }
    },

    async updateUser(id, data) {
      try {
        const response = await pb.put(`/users/${id}`, data, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        const index = this.users.findIndex(user => user.id === id);
        if (index !== -1) {
          this.users[index] = response.data;
        }
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l’utilisateur:', error);
        throw error;
      }
    },

    async fetchUserById(userId) {
      try {
        const response = await pb.get(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération de l’utilisateur:', error);
        throw error;
      }
    },

    async fetchAllUsers() {
      try {
        const response = await pb.get('/users', {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        this.users = response.data;
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return [];
      }
    }
  }
});