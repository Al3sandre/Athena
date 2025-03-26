<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Détails de l'Arrivage</h1>
        <div v-if="arrival" class="bg-white p-4 rounded shadow-md">
            <p><strong>ID :</strong> {{ arrival.id }}</p>
            <p><strong>Montant :</strong> {{ arrival.amount || 'Non spécifié' }} €</p>
            <p><strong>Date :</strong> {{ formatDate(arrival.created_at) }}</p>
            <p><strong>Status :</strong> {{ arrival.status || 'Non spécifié' }}</p>
            <ul class="mt-4 space-y-2">
                <li v-for="product in arrival.products" :key="product.id" class="flex items-center space-x-4">
                    <img :src="getImageUrl(product.product)" alt="Image du produit"
                        class="w-12 h-12 object-cover rounded" />
                    <span class="font-semibold">{{ product.product.name }}</span>
                    <span>Quantité :</span>
                    <span>{{ product.quantity }}</span>
                    <span>Coût unitaire : {{ product.unit_price }} €</span>
                    <span>Prix total : {{ (product.quantity * product.unit_price).toFixed(2) }} €</span>
                </li>
            </ul>
            <p class="mt-4"><strong>Montant total de l'arrivage :</strong> {{ totalAmount }} €</p>
            <button @click="toggleStatus"
                class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                {{ arrival.status === 'en cours' ? 'Réceptionner' : 'Revenir à en cours' }}
            </button>
            <router-link to="/arrivals"
                class="mt-4 inline-block bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-200">
                Retour aux Arrivages
            </router-link>
        </div>
        <div v-else>
            <p>Chargement des détails de l'arrivage...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useArrivalStore } from '@/stores/arrivalStore';

const route = useRoute();
const router = useRouter();
const arrivalStore = useArrivalStore();
const arrival = ref(null);

const formatDate = (dateString) => {
    if (!dateString) return 'Date invalide';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Date invalide' : date.toLocaleString();
};

const getImageUrl = (product) => {
    if (!product || !product.image) {
        return '/placeholder-image.png'; // Image par défaut si aucune image n'est disponible
    }
    return `${import.meta.env.VITE_BASE_IMAGE_URL}/storage/${product.image}`;
};

const toggleStatus = async () => {
    try {
        if (arrival.value.status === 'en cours') {
            await arrivalStore.receptionArrival(arrival.value.id);
        } else {
            await arrivalStore.unreceptionArrival(arrival.value.id);
        }
        arrival.value = await arrivalStore.fetchArrivalById(route.params.id);
    } catch (error) {
        console.error('Erreur lors de la modification du statut de l\'arrivage:', error);
    }
};

const totalAmount = computed(() => {
    if (!arrival.value || !Array.isArray(arrival.value.products)) {
        return 0; // Retourne 0 si products est undefined ou n'est pas un tableau
    }

    return arrival.value.products.reduce((total, product) => {
        const unitPrice = parseFloat(product.unit_price) || 0;
        return total + (unitPrice * product.quantity);
    }, 0).toFixed(2);
});

onMounted(async () => {
    try {
        const data = await arrivalStore.fetchArrivalById(route.params.id);
        console.log('Détails de l\'arrivage chargés :', data);
        arrival.value = {
            ...data,
            products: data.products || [], // Assurez-vous que products est un tableau
        };
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'arrivage:', error);
    }
});
</script>

<style scoped>
/* Vous pouvez supprimer les styles existants car nous utilisons Tailwind CSS */
</style>