<template>
    <div>
        <h1>Gestion des Arrivages</h1>
        <button @click="goToNewArrival">Nouvel Arrivage</button>
        <h2>Historique des Arrivages</h2>
        <ul>
            <li v-for="arrival in paginatedArrivals" :key="arrival.id">
                <router-link :to="{ name: 'ArrivalDetail', params: { id: arrival.id } }">
                    ID : {{ arrival.id }} - Montant : {{ arrival.amount }} - Date : {{ formatDate(arrival.created) }}
                </router-link>
            </li>
        </ul>
        <div class="pagination">
            <button @click="prevPage" :disabled="currentPage === 1">Précédent</button>
            <span>Page {{ currentPage }} sur {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages">Suivant</button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useArrivalStore } from '@/stores/arrivalStore';

const router = useRouter();
const arrivalStore = useArrivalStore();
const arrivals = computed(() => arrivalStore.arrivals);
const currentPage = ref(1);
const itemsPerPage = 10;

const paginatedArrivals = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return arrivals.value.slice(start, end);
});

const totalPages = computed(() => {
    return Math.ceil(arrivals.value.length / itemsPerPage);
});

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
};

const goToNewArrival = () => {
    router.push({ name: 'NewArrival' });
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? 'Date invalide' : date.toLocaleString();
};

onMounted(async () => {
    await arrivalStore.fetchArrivals();
});
</script>