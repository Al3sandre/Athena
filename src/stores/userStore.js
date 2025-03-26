import { defineStore } from 'pinia';
import pb from '@/api/pocketbase'; // Utilisation de l'instance Axios configurée

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: null,
    users: [],
    token: localStorage.getItem('auth_token') || null,
  }),

  actions: {
    // ✅ Connexion de l'utilisateur
    async login(email, password) {
      try {
        const response = await pb.post('/login', { email, password });

        this.token = response.data.access_token;
        localStorage.setItem('auth_token', this.token);

        this.user = response.data.user;
        localStorage.setItem('user_id', this.user.id);
        return true;
      } catch (error) {
        console.error('Erreur de connexion:', error.response?.data || error.message);
        return false;
      }
    },

    // ✅ Déconnexion de l'utilisateur
    async logout() {
      this.user = null;
      this.token = null;

      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');

      window.location.href = '/login'; // Redirigez vers la page de connexion
    },

    // ✅ Charger les informations de l'utilisateur connecté
    async loadUserFromSession() {
      if (!this.token) {
        console.warn('Aucun token trouvé, utilisateur non connecté.');
        return;
      }

      try {
        const userId = this.user?.id || localStorage.getItem('user_id');
        if (!userId) {
          console.warn('Aucun ID utilisateur trouvé.');
          return;
        }

        const response = await pb.get(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.user = response.data;
      } catch (error) {
        console.warn('Erreur lors du chargement de l’utilisateur:', error.response?.data || error.message);
        this.logout(); // Déconnectez l'utilisateur si le token est invalide
      }
    },

    // ✅ Vérifier la validité du token
    async verifyToken() {
      if (!this.token) {
        console.warn('Aucun token trouvé, utilisateur non connecté.');
        return false;
      }

      try {
        const response = await pb.get('/verify-token', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        return true; // Le token est valide
      } catch (error) {
        console.warn('Token invalide ou expiré:', error.response?.data || error.message);
        this.logout(); // Déconnectez l'utilisateur si le token est invalide
        return false;
      }
    },

    // ✅ Récupérer tous les utilisateurs
    async fetchAllUsers() {
      if (!this.token) {
        console.error('Aucun token trouvé. Veuillez vous connecter.');
        return [];
      }

      try {
        const response = await pb.get('/users', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.users = response.data;
        return response.data;
      } catch (error) {
        if (error.response?.status === 401) {
          console.warn('Token invalide ou expiré. Déconnexion en cours...');
          this.logout(); // Déconnectez l'utilisateur si le token est invalide
        }
        console.error('Erreur lors de la récupération des utilisateurs:', error.response?.data || error.message);
        return [];
      }
    },

    // ✅ Récupérer un utilisateur par ID
    async fetchUserById(userId) {
      try {
        const response = await pb.get(`/users/${userId}`);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur :', error);
        throw error;
      }
    },

    // ✅ Créer un utilisateur
    async createUser(userData) {
      try {
        const response = await pb.post('/users', userData, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.users.push(response.data);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la création de l’utilisateur:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ Mettre à jour un utilisateur
    async updateUser(userId, updatedData) {
      try {
        const response = await pb.put(`/users/${userId}`, updatedData, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        const index = this.users.findIndex(user => user.id === userId);
        if (index !== -1) {
          this.users[index] = response.data;
        }
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l’utilisateur:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ Supprimer un utilisateur
    async deleteUser(userId) {
      try {
        await pb.delete(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.users = this.users.filter(user => user.id !== userId);
      } catch (error) {
        console.error('Erreur lors de la suppression de l’utilisateur:', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ Récupérer le rôle de l'utilisateur connecté
    getRole() {
      return this.user ? this.user.role : null;
    },

    // ✅ Vérifier si l'utilisateur est administrateur
    isAdmin() {
      return this.getRole() === 'admin';
    },
  },
}); // Assurez-vous que cette accolade fermante est correcte