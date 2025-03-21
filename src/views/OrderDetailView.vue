<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Détails de la Commande</h1>
        <div v-if="order" class="bg-white p-4 rounded shadow-md">
            <p><strong>ID de la commande :</strong> {{ order.id }}</p>
            <p><strong>Utilisateur :</strong> {{ userName }}</p>
            <p><strong>Statut :</strong> {{ order.status }}</p>
            <p><strong>Montant total :</strong> {{ order.total_amount }} €</p>

            <h2 class="text-xl font-semibold mt-4">Produits</h2>
            <ul class="space-y-4">
                <li v-for="item in orderItems" :key="item.id" class="flex items-center justify-between">
                    <div>
                        <p><strong>Produit :</strong> {{ item.product.name }}</p>
                        <p><strong>Quantité :</strong> {{ item.quantity }}</p>
                        <p><strong>Prix unitaire :</strong> {{ item.price }} €</p>
                    </div>
                    <button @click="removeItem(item.id)" class="text-red-500 hover:text-red-700">Supprimer</button>
                </li>
            </ul>

            <button @click="addItem" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Ajouter un produit
            </button>
        </div>
        <div v-else>
            <p>Chargement des détails de la commande...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from '@/stores/orderStore';

const route = useRoute();
const orderStore = useOrderStore();
const order = ref(null);
const orderItems = ref([]);
const userName = ref('');

const fetchOrderDetails = async () => {
    order.value = await orderStore.fetchOrderById(route.params.id);
    orderItems.value = await orderStore.fetchOrderItems(order.value.id);
    userName.value = order.value.user?.name || 'Utilisateur inconnu';
};

const addItem = async () => {
    const newItem = {
        product_id: 1, // Remplacez par l'ID du produit à ajouter
        quantity: 1,
        price: 10.0,
    };
    await orderStore.addOrderItem(order.value.id, newItem);
    await fetchOrderDetails(); // Rechargez les détails de la commande
};

const removeItem = async (itemId) => {
    await orderStore.deleteOrderItem(itemId);
    await fetchOrderDetails(); // Rechargez les détails de la commande
};

onMounted(() => {
    fetchOrderDetails();
});
</script>