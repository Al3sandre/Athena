<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Gestion des Arrivages</h1>
        <button @click="goToNewArrival"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 mb-4">
            Nouvel Arrivage
        </button>
        <h2 class="text-xl font-semibold mb-2">Historique des Arrivages</h2>
        <ul class="space-y-2">
            <li v-for="arrival in paginatedArrivals" :key="arrival.id" class="bg-white p-4 rounded shadow-md">
                <router-link :to="{ name: 'ArrivalDetail', params: { id: arrival.id } }"
                    class="text-blue-500 hover:text-blue-700">
                    ID : {{ arrival.id }} - Montant : {{ arrival.amount }} € - Date : {{ formatDate(arrival.created_at)
                    }}
                </router-link>
            </li>
        </ul>
        <div class="pagination mt-4 flex items-center justify-between">
            <button @click="prevPage" :disabled="currentPage === 1"
                class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200 disabled:opacity-50">
                Précédent
            </button>
            <span>Page {{ currentPage }} sur {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages"
                class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200 disabled:opacity-50">
                Suivant
            </button>
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
    return arrivals.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() => Math.ceil(arrivals.value.length / itemsPerPage));

const prevPage = () => {
    if (currentPage.value > 1) currentPage.value--;
};

const nextPage = () => {
    if (currentPage.value < totalPages.value) currentPage.value++;
};

const goToNewArrival = () => {
    router.push({ name: 'NewArrival' });
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? 'Date invalide' : date.toLocaleString();
};

onMounted(async () => {
    try {
        await arrivalStore.fetchArrivals();
    } catch (error) {
        console.error('Erreur lors de la récupération des arrivages:', error);
    }
});
</script>