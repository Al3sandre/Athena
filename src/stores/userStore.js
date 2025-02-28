import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: pb.authStore.model // Récupérer l'utilisateur connecté depuis PocketBase
  }),

  actions: {
    // ✅ Connexion avec PocketBase
    async login(email, password) {
      try {
        const authData = await pb.collection('users').authWithPassword(email, password);
        this.user = authData.record; // Stocke l'utilisateur récupéré
        return true; // Succès
      } catch (error) {
        console.error('Erreur de connexion:', error);
        return false; // Échec
      }
    },

    // ✅ Déconnexion
    async logout() {
      pb.authStore.clear();
      this.user = null;
    },

    // ✅ Charger l'utilisateur connecté
    async loadUserFromSession() {
      if (pb.authStore.isValid) {
        this.user = pb.authStore.model;
      } else {
        this.user = null;
      }
    },

    // ✅ Récupérer le rôle de l'utilisateur
    getRole() {
      return this.user ? this.user.role : null;
    },

    // ✅ Récupérer l'ID de l'utilisateur
    getUserId() {
      return this.user ? this.user.id : null;
    },

    // ✅ Vérifier si l'utilisateur est administrateur
    isAdmin() {
      return this.getRole() === 'admin';
    },

    // ✅ Créer un nouvel utilisateur
    async createUser(userData) {
      try {
        const newUser = await pb.collection('users').create(userData);
        return newUser;
      } catch (error) {
        console.error('Erreur lors de la création de l’utilisateur:', error);
        throw error;
      }
    },

    // ✅ Mettre à jour un utilisateur
    async updateUser(id, data) {
      try {
        let updatedUser;
        if (data instanceof FormData) {
          updatedUser = await pb.collection('users').update(id, data);
        } else {
          updatedUser = await pb.collection('users').update(id, data);
        }
        this.user = updatedUser; // Mettre à jour l'utilisateur dans le store
        return updatedUser;
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l’utilisateur:', error);
        throw error;
      }
    },

    // ✅ Générer l'URL de l'avatar
    getImageUrl(user) {
      if (user.avatar) {
        return `http://127.0.0.1:8090/api/files/users/${user.id}/${user.avatar}`;
      }
      return 'https://w7.pngwing.com/pngs/205/731/png-transparent-default-avatar-thumbnail.png'; // Remplacez par l'URL de l'avatar par défaut
    },
    // ✅ Récupérer les détails d'un utilisateur par ID
    async fetchUserById(userId) {
      try {
        const response = await pb.collection('users').getOne(userId);
        return response;
      } catch (error) {
        console.error('Erreur lors de la récupération de l’utilisateur:', error);
        return null;
      }
    },
  }
});