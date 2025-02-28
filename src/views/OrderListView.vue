<template>
    <div>
        <h1>Liste des Commandes</h1>
        <div v-if="isAdmin">
            <div v-for="status in orderStatuses" :key="status">
                <h2>{{ status }}</h2>
                <ul>
                    <li v-for="order in categorizedOrders[status]" :key="order.id">
                        <router-link :to="{ name: 'OrderDetail', params: { id: order.id } }">
                            Commande #{{ order.id }} - {{ order.status }}
                        </router-link>
                    </li>
                </ul>
            </div>
        </div>
        <div v-else>
            <ul>
                <li v-for="order in orders" :key="order.id">
                    <router-link :to="{ name: 'OrderDetail', params: { id: order.id } }">
                        Commande #{{ order.id }} - {{ order.created }}
                    </router-link>
                </li>
            </ul>
        </div>
        <div class="pagination">
            <button @click="prevPage" :disabled="pagination.page === 1">Précédent</button>
            <span>Page {{ pagination.page }} sur {{ pagination.totalPages }}</span>
            <button @click="nextPage" :disabled="pagination.page === pagination.totalPages">Suivant</button>
        </div>
    </div>
</template>

<script setup>
import { useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import { computed, onMounted } from 'vue';

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

onMounted(() => {
    fetchOrders();
});
</script>