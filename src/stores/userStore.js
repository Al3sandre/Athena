import { defineStore } from 'pinia';
import pb from '@/api/pocketbase'; // Utilisation de l'instance Axios configurée

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: null, // Utilisateur actuel
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
        localStorage.setItem('user_id', this.user.id); // Stocker l'ID de l'utilisateur
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
    async fetchUser() {
      try {
        const userId = localStorage.getItem('user_id'); // Récupérer l'ID de l'utilisateur depuis localStorage
        if (!userId) {
          throw new Error('Aucun utilisateur connecté.');
        }

        const response = await pb.get(`/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.user = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération de l’utilisateur :', error.response?.data || error.message);
        throw error;
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

    // ✅ Récupérer tous les utilisateurs (uniquement pour les administrateurs)
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
        console.error('Erreur lors de la récupération de l utilisateur : ', error);
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
        this.users.push(response.data); // Ajouter l'utilisateur à la liste
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la création de l utilisateur: ', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ Mettre à jour un utilisateur
    async updateUser(userId, data) {
      console.log(data)
      try {
        const response = await pb.post(`/users/${userId}?_method=PUT`, data, {
          headers: {
            'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
          },
        });
        // Mettre à jour l'utilisateur dans le store
        const updatedUserIndex = this.users.findIndex(user => user.id === userId);
        if (updatedUserIndex !== -1) {
          this.users[updatedUserIndex] = response.data.user; // Mettre à jour localement
        }
        return response.data.user;
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'utilisateur :', error.response?.data || error.message);
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
        console.error('Erreur lors de la suppression de l utilisateur: ', error.response?.data || error.message);
        throw error;
      }
    },

    // ✅ Récupérer le rôle de l'utilisateur connecté
    getRole() {
      return this.user ? this.user.role : null;
    },
  },

  getters: {
    isAdmin: (state) => state.user?.role === 'admin', // Vérifie si l'utilisateur est admin
    getUserId: (state) => state.user?.id, // Retourne l'ID de l'utilisateur connecté
    getImageUrl: (state) => (user) => {
      if (!user || !user.avatar) {
        return '/placeholder-image.png'; // Image par défaut si aucune image n'est disponible
      }
      return `${import.meta.env.VITE_BASE_IMAGE_URL}/storage/${user.avatar}`;
    },
  },
});