<template>
    <div class="p-6 bg-gray-100 min-h-screen">
        <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">Liste des Commandes</h1>

        <!-- Indicateur de chargement -->
        <div v-if="isLoading" class="flex justify-center items-center h-32">
            <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="text-center text-red-600 font-semibold bg-red-100 p-4 rounded">
            {{ errorMessage }}
        </div>

        <!-- Affichage des commandes -->
        <div v-else-if="orders.length > 0">
            <div v-for="status in orderStatuses" :key="status" class="mb-8">
                <h2 class="text-2xl font-semibold mb-4 text-gray-700">{{ status }}</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div v-for="order in categorizedOrders[status]" :key="order.id"
                        class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                        <router-link :to="{ name: 'OrderDetail', params: { id: order.id } }"
                            class="text-lg font-bold text-blue-600 hover:underline">
                            Commande #{{ order.id }}
                        </router-link>
                        <p class="text-sm text-gray-500 mt-2">Utilisateur : {{ getUserName(order.user_id) }}</p>
                        <p class="text-sm text-gray-500">Date : {{ formatDate(order.created_at) }}</p>
                        <div class="mt-4">
                            <span :class="getStatusClass(order.status)"
                                class="px-3 py-1 rounded-full text-sm font-semibold">
                                {{ order.status }}
                            </span>
                        </div>
                        <div class="mt-4">
                            <label for="status" class="block text-sm font-medium text-gray-700">Modifier le
                                statut</label>
                            <select v-model="order.status" @change="updateOrderStatus(order)"
                                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                <option v-for="status in orderStatuses" :key="status" :value="status">{{ status }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Aucune commande trouvée -->
        <div v-else class="text-center text-gray-500 text-lg">Aucune commande trouvée.</div>

        <!-- Pagination -->
        <div v-if="orders.length > 0" class="mt-8 flex justify-between items-center">
            <button @click="prevPage" :disabled="pagination.page === 1"
                class="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M12.707 14.707a1 1 0 01-1.414 0L7 10.414a1 1 0 010-1.414l4.293-4.293a1 1 0 111.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z"
                        clip-rule="evenodd" />
                </svg>
                Précédent
            </button>
            <span class="text-gray-700">Page {{ pagination.page }} sur {{ pagination.totalPages }}</span>
            <button @click="nextPage" :disabled="pagination.page === pagination.totalPages"
                class="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 disabled:opacity-50">
                Suivant
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4.293 4.293a1 1 0 010 1.414l-4.293 4.293a1 1 0 01-1.414 0z"
                        clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    </div>
</template>

<script setup>
import { useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted, ref } from 'vue';

const orderStore = useOrderStore();
const userStore = useUserStore();
const orders = computed(() => orderStore.orders);
const pagination = computed(() => orderStore.pagination);
const isAdmin = computed(() => userStore.isAdmin());
const userId = computed(() => userStore.getUserId());

const orderStatuses = ['en cours', 'en preparation', 'en transfert', 'livrer'];

const isLoading = ref(false);
const errorMessage = ref('');

const categorizedOrders = computed(() => {
    const categories = {
        'en cours': [],
        'préparé': [],
        'en transfert': [],
        'en preparation': [],
        'livrer': []
    };

    orders.value.forEach(order => {
        if (categories[order.status]) {
            categories[order.status].push(order);
        }
    });

    return categories;
});

// Fonction pour formater la date en dd/MM/yyyy
const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) {
        return 'Date invalide';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Fonction pour obtenir une classe CSS en fonction du statut
const getStatusClass = (status) => {
    switch (status) {
        case 'en cours':
            return 'bg-yellow-100 text-yellow-800';
        case 'préparé':
            return 'bg-blue-100 text-blue-800';
        case 'en transfert':
            return 'bg-purple-100 text-purple-800';
        case 'livré':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const fetchOrders = async (page = 1) => {
    isLoading.value = true;
    errorMessage.value = '';
    try {
        if (isAdmin.value) {
            await orderStore.fetchOrders(page);
        } else {
            await orderStore.fetchOrdersByUserId(userId.value, page);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        errorMessage.value = 'Impossible de récupérer les commandes. Veuillez réessayer.';
    } finally {
        isLoading.value = false;
    }
};

const updateOrderStatus = async (order) => {
    try {
        await orderStore.updateOrder(order.id, { status: order.status });
        fetchOrders(pagination.value.page);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de la commande:', error);
        errorMessage.value = 'Impossible de mettre à jour le statut de la commande.';
    }
};

const prevPage = () => {
    if (pagination.value.page > 1) {
        fetchOrders(pagination.value.page - 1);
    }
};

const nextPage = () => {
    if (pagination.value.page < pagination.value.totalPages) {
        fetchOrders(pagination.value.page + 1);
    }
};

const userNames = ref({});

const fetchUserNames = async () => {
    try {
        const users = await userStore.fetchAllUsers();
        users.forEach(user => {
            userNames.value[user.id] = user.name;
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        errorMessage.value = 'Impossible de récupérer les noms des utilisateurs.';
    }
};

const getUserName = (userId) => {
    return userNames.value[userId] || 'Utilisateur inconnu';
};

onMounted(async () => {
    await fetchUserNames();
    fetchOrders();
});
</script>