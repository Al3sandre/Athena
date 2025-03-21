<template>
    <div class="p-6 bg-gray-100 min-h-screen">
        <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">Détails de la Commande</h1>

        <!-- Détails de la commande -->
        <div v-if="order" class="bg-white p-6 rounded-lg shadow-md">
            <div class="mb-4">
                <p><strong>ID de la commande :</strong> {{ order.id }}</p>
                <p><strong>Utilisateur :</strong> {{ user?.name || 'Utilisateur inconnu' }}</p>
                <p><strong>Statut :</strong>
                    <span :class="getStatusClass(order.status)" class="px-3 py-1 rounded-full text-sm font-semibold">
                        {{ order.status }}
                    </span>
                </p>
                <p><strong>Montant total :</strong> {{ calculateTotalCost() }} €</p>
            </div>

            <!-- Modification du statut -->
            <div class="mt-4">
                <h2 class="text-xl font-semibold mb-2">Modifier le statut</h2>
                <div class="flex space-x-4">
                    <button v-for="status in orderStatuses" :key="status" @click="updateOrderStatus(status)" :class="[
                        'px-4 py-2 rounded text-white font-semibold',
                        order.status === status ? 'bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'
                    ]">
                        {{ status }}
                    </button>
                </div>
            </div>

            <!-- Produits -->
            <h2 class="text-xl font-semibold mt-6 mb-4">Produits</h2>
            <div v-if="orderItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="item in orderItems" :key="item.id" class="bg-gray-50 p-4 rounded-lg shadow-md">
                    <img :src="getProductImage(item.product?.image)" alt="Produit"
                        class="w-32 h-32 mx-auto object-contain rounded-md mb-4 bg-gray-100 border border-gray-300">
                    <p><strong>Produit :</strong> {{ item.product?.name || 'Produit inconnu' }}</p>
                    <p><strong>Quantité :</strong> {{ item.quantity }}</p>
                    <p><strong>Prix unitaire :</strong> {{ item.price }} €</p>
                    <p><strong>Sous-total :</strong> {{ (item.quantity * item.price).toFixed(2) }} €</p>
                </div>
            </div>
            <p v-else class="text-gray-500">Aucun produit dans cette commande.</p>
        </div>

        <!-- Chargement -->
        <div v-else>
            <p class="text-center text-gray-500">Chargement des détails de la commande...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore'; // Importez le store utilisateur si disponible

const route = useRoute();
const orderStore = useOrderStore();
const userStore = useUserStore(); // Store utilisateur
const order = ref(null);
const orderItems = ref([]);
const user = ref(null); // Stocke les informations de l'utilisateur
const orderStatuses = ['en cours', 'en transfert', 'en preparation', 'livrer'];

const fetchOrderDetails = async () => {
    try {
        // Récupère les détails de la commande
        order.value = await orderStore.fetchOrderById(route.params.id);

        // Utilise directement les items de la commande
        orderItems.value = order.value.items;

        // Récupère les informations de l'utilisateur
        user.value = await userStore.fetchUserById(order.value.user_id);
    } catch (error) {
        console.error('Erreur lors du chargement des détails de la commande :', error);
    }
};

const calculateTotalCost = () => {
    return orderItems.value.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2);
};

const updateOrderStatus = async (status) => {
    try {
        await orderStore.updateOrder(order.value.id, { status });
        order.value.status = status; // Met à jour localement le statut
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de la commande :', error);
    }
};

// Fonction pour obtenir une classe CSS en fonction du statut
const getStatusClass = (status) => {
    switch (status) {
        case 'en cours':
            return 'bg-yellow-100 text-yellow-800';
        case 'en transfert':
            return 'bg-purple-100 text-purple-800';
        case 'en preparation':
            return 'bg-blue-100 text-blue-800';
        case 'livrer':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// Fonction pour obtenir l'image du produit
const getProductImage = (imagePath) => {
    if (!imagePath) {
        return '/images/placeholder.png'; // Image par défaut si aucune image n'est disponible
    }
    return `${import.meta.env.VITE_BASE_IMAGE_URL}/storage/${imagePath}`; // Concatène l'URL de base avec le chemin de l'image
};
onMounted(() => {
    fetchOrderDetails();
});
</script>