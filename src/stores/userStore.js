import { defineStore } from 'pinia';
import { users as mockUsers } from '@/mock/users';

export const useUserStore = defineStore('userStore', {
  state: () => ({
    users: [...mockUsers], // Récupère les utilisateurs depuis le fichier mock
    user: null // Utilisateur actuellement connecté
  }),
  actions: {
    login(email, password) {
      const foundUser = this.users.find(u => u.email === email && u.password === password);
      if (foundUser) {
        this.user = { ...foundUser, password: undefined }; // Ne pas stocker le mot de passe
        localStorage.setItem('user', JSON.stringify(this.user));
        return true; // Connexion réussie
      }
      return false; // Échec de connexion
    },
    logout() {
      this.user = null;
      localStorage.removeItem('user');
    },
    loadUserFromStorage() {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.user = JSON.parse(savedUser);
      }
    },
    getRole() {
      return this.user ? this.user.role : null;
    }
  }
});
