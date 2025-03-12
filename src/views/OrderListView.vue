<!-- TODO Idée de developement -> Affichage et gestion en mode Kanban (type trello) -->
<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Liste des Commandes</h1>
        <div v-if="isAdmin">
            <div v-for="status in orderStatuses" :key="status" class="mb-6">
                <h2 class="text-xl font-semibold mb-2">{{ status }}</h2>
                <ul class="space-y-4">
                    <li v-for="order in categorizedOrders[status]" :key="order.id"
                        class="bg-white p-4 rounded shadow-md">
                        <router-link :to="{ name: 'OrderDetail', params: { id: order.id } }"
                            class="text-blue-500 hover:text-blue-700">
                            Commande #{{ order.id }} - {{ order.status }}
                        </router-link>
                        <p>Utilisateur : {{ getUserName(order.user_id) }}</p>
                        <p>Date : {{ new Date(order.created).toLocaleString() }}</p>
                        <select v-model="order.status" @change="updateOrderStatus(order)"
                            class="border rounded px-2 py-1 mt-2">
                            <option v-for="status in orderStatuses" :key="status" :value="status">{{ status }}</option>
                        </select>
                    </li>
                </ul>
            </div>
        </div>
        <div v-else>
            <ul class="space-y-4">
                <li v-for="order in orders" :key="order.id" class="bg-white p-4 rounded shadow-md">
                    <router-link :to="{ name: 'OrderDetail', params: { id: order.id } }"
                        class="text-blue-500 hover:text-blue-700">
                        Commande #{{ order.id }} - {{ order.created }}
                    </router-link>
                </li>
            </ul>
        </div>
        <div class="pagination mt-4 flex items-center justify-between">
            <button @click="prevPage" :disabled="pagination.page === 1"
                class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200 disabled:opacity-50">
                Précédent
            </button>
            <span>Page {{ pagination.page }} sur {{ pagination.totalPages }}</span>
            <button @click="nextPage" :disabled="pagination.page === pagination.totalPages"
                class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200 disabled:opacity-50">
                Suivant
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

const orderStatuses = ['en cours', 'préparé', 'en transfert', 'livré'];

const categorizedOrders = computed(() => {
    const categories = {
        'en cours': [],
        'préparé': [],
        'en transfert': [],
        'livré': []
    };
    orders.value.forEach(order => {
        if (categories[order.status]) {
            categories[order.status].push(order);
        }
    });
    return categories;
});

const fetchOrders = (page = 1) => {
    if (isAdmin.value) {
        orderStore.fetchOrders(page);
    } else {
        orderStore.fetchOrdersByUserId(userId.value, page);
    }
};

const updateOrderStatus = async (order) => {
    await orderStore.updateOrder(order.id, { status: order.status });
    fetchOrders(pagination.value.page);
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
    const users = await userStore.fetchAllUsers();
    users.forEach(user => {
        userNames.value[user.id] = user.name;
    });
};

const getUserName = (userId) => {
    return userNames.value[userId] || 'Utilisateur inconnu';
};

onMounted(async () => {
    await fetchUserNames();
    fetchOrders();
});
</script>