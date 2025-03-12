<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Détails de l'Arrivage</h1>
        <div v-if="arrival" class="bg-white p-4 rounded shadow-md">
            <p><strong>ID :</strong> {{ arrival.id }}</p>
            <p><strong>Montant :</strong> {{ arrival.amount }}</p>
            <p><strong>Date :</strong> {{ formatDate(arrival.created) }}</p>
            <p><strong>Status :</strong> {{ arrival.status }}</p>
            <ul class="mt-4 space-y-2">
                <li v-for="product in arrival.products" :key="product.id" class="flex items-center space-x-4">
                    <img :src="getImageUrl(product)" alt="Image du produit" class="w-12 h-12 object-cover rounded" />
                    <span class="font-semibold">{{ product.name }}</span>
                    <span>Quantité :</span>
                    <span v-if="editableProductId === product.id">
                        <input v-model.number="product.quantity" @blur="saveQuantity(product)"
                            class="border rounded px-2 py-1" />
                    </span>
                    <span v-else @dblclick="editQuantity(product)" class="cursor-pointer">{{ product.quantity }}</span>
                    <span>Coût unitaire : {{ product.price }}€</span>
                </li>
            </ul>
            <p class="mt-4"><strong>Montant total de l'arrivage :</strong> {{ totalAmount }}€</p>
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
import { useProductStore } from '@/stores/productStore';

const route = useRoute();
const router = useRouter();
const arrivalStore = useArrivalStore();
const productStore = useProductStore();
const arrival = ref(null);
const editableProductId = ref(null);

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? 'Date invalide' : date.toLocaleString();
};

const getImageUrl = (product) => {
    return productStore.getImageUrl(product);
};

const editQuantity = (product) => {
    editableProductId.value = product.id;
};

const saveQuantity = async (product) => {
    editableProductId.value = null;
    await arrivalStore.updateProductQuantity(arrival.value.id, product.id, product.quantity);
};

const toggleStatus = async () => {
    if (arrival.value.status === 'en cours') {
        await arrivalStore.receptionArrival(arrival.value.id);
    } else {
        await arrivalStore.unreceptionArrival(arrival.value.id);
    }
    arrival.value = await arrivalStore.fetchArrivalById(route.params.id);
};

const totalAmount = computed(() => {
    return arrival.value.products.reduce((total, product) => total + (product.price * product.quantity), 0).toFixed(2);
});

onMounted(async () => {
    try {
        await productStore.fetchProducts();
        arrival.value = await arrivalStore.fetchArrivalById(route.params.id);
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'arrivage:', error);
    }
});
</script>

<style scoped>
/* Vous pouvez supprimer les styles existants car nous utilisons Tailwind CSS */
</style>