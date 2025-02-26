import { defineStore } from 'pinia';
import pb from '@/api/pocketbase';

// Ce fichier définit un store Pinia pour gérer les utilisateurs, y compris la connexion, la déconnexion, la création d'utilisateurs et la récupération des rôles.

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
    }
  }
});
