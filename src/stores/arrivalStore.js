import { defineStore } from 'pinia';
import pb from '@/api/pocketbase'; // Utilisation de l'instance Axios configurée

export const useArrivalStore = defineStore('arrivalStore', {
    state: () => ({
        arrivals: [], // Liste des arrivages
    }),

    actions: {
        // ✅ Récupérer tous les arrivages
        async fetchArrivals() {
            try {
                const response = await pb.get('/arrivals', {
                    params: { expand: 'arrival_products' }, // Ajout des relations pour inclure les produits
                });
                this.arrivals = Array.isArray(response.data) ? response.data : [];
            } catch (error) {
                console.error('Erreur lors de la récupération des arrivages:', error);
                this.arrivals = [];
            }
        },

        // ✅ Récupérer un arrivage par ID
        async fetchArrivalById(arrivalId) {
            try {
                const response = await pb.get(`/arrivals/${arrivalId}`, {
                    params: { expand: 'arrival_products' }, // Ajout des relations pour inclure les produits
                });
                console.log('Données récupérées pour l\'arrivage :', response.data);
                return response.data;
            } catch (error) {
                console.error('Erreur lors de la récupération de l’arrivage:', error);
                throw error;
            }
        },

        // ✅ Réceptionner un arrivage
        async receptionArrival(arrivalId) {
            try {
                const response = await pb.put(`/arrivals/${arrivalId}`, {
                    status: 'réceptionné', // Mise à jour du statut
                });
                return response.data;
            } catch (error) {
                console.error('Erreur lors de la réception de l’arrivage:', error);
                throw error;
            }
        },

        // ✅ Annuler la réception d’un arrivage
        async unreceptionArrival(arrivalId) {
            try {
                const response = await pb.put(`/arrivals/${arrivalId}`, {
                    status: 'en cours', // Mise à jour du statut
                });
                return response.data;
            } catch (error) {
                console.error('Erreur lors de la modification du statut de l’arrivage:', error);
                throw error;
            }
        },

        // ✅ Ajouter un produit à un arrivage
        async addArrivalProduct(productData) {
            try {
                const response = await pb.post('/arrival-products', { // Correction de l'URL
                    arrival_id: productData.arrival_id, // ID de l'arrivage
                    product_id: productData.product_id, // ID du produit
                    quantity: productData.quantity, // Quantité
                    unit_price: productData.unit_price, // Prix unitaire
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                return response.data;
            } catch (error) {
                console.error('Erreur lors de l’ajout du produit à l’arrivage:', error);
                throw error;
            }
        },

        // ✅ Ajouter un nouvel arrivage
        async addArrival(arrivalData) {
            try {
                const response = await pb.post('/arrivals', {
                    amount: arrivalData.amount, // Montant total de l'arrivage
                    status: arrivalData.status || 'en cours', // Statut par défaut
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                return response.data; // Retourne l'arrivage créé
            } catch (error) {
                console.error('Erreur lors de l’ajout de l’arrivage:', error);
                throw error;
            }
        },
    },
});