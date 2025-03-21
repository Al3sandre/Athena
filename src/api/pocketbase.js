import axios from 'axios';

// Définir la base URL en fonction de l'environnement
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const pb = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Intercepteur pour ajouter automatiquement le token d'authentification
pb.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optionnel : Intercepteur pour gérer les erreurs globales
pb.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Token expiré ou invalide. Déconnexion...');
            localStorage.removeItem('auth_token');
            window.location.href = '/login'; // Redirigez vers la page de connexion
        }
        return Promise.reject(error);
    }
);

export default pb;
