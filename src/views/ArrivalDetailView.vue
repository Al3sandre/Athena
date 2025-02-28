<template>
    <div>
        <h1>Détails de l'Arrivage</h1>
        <div v-if="arrival">
            <p>ID : {{ arrival.id }}</p>
            <p>Montant : {{ arrival.amount }}</p>
            <p>Date : {{ formatDate(arrival.created) }}</p>
            <p>Status : {{ arrival.status }}</p>
            <ul>
                <li v-for="product in arrival.products" :key="product.id">
                    <img :src="getImageUrl(product)" alt="Image du produit" width="50" height="50" />
                    <span>{{ product.name }}</span>
                    <span>Quantité : </span>
                    <span v-if="editableProductId === product.id">
                        <input v-model.number="product.quantity" @blur="saveQuantity(product)" />
                    </span>
                    <span v-else @dblclick="editQuantity(product)">{{ product.quantity }}</span>
                    <span>Coût unitaire : {{ product.price }}€</span>
                </li>
            </ul>
            <p>Montant total de l'arrivage : {{ totalAmount }}€</p>
            <button @click="toggleStatus">{{ arrival.status === 'en cours' ? 'Réceptionner' : 'Revenir à en cours'
            }}</button>
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