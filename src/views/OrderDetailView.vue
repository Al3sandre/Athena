<template>
    <div>
        <h1>Détails de la Commande</h1>
        <div v-if="order">
            <p>ID de la commande : {{ order.id }}</p>
            <p>Utilisateur : {{ order.user_id }}</p>
            <p>Produit : {{ order.product }}</p>
            <p>Prix total : {{ order.total_price }}</p>
            <p>Statut : {{ order.status }}</p>
            <p>Créé le : {{ order.created }}</p>
            <p>Mis à jour le : {{ order.updated }}</p>
        </div>
        <div v-else>
            <p>Chargement des détails de la commande...</p>
        </div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useOrderStore } from '@/stores/orderStore';
import { ref, onMounted } from 'vue';

const route = useRoute();
const orderStore = useOrderStore();
const order = ref(null);

const fetchOrder = async () => {
    order.value = await orderStore.fetchOrderById(route.params.id);
};

onMounted(() => {
    fetchOrder();
});
</script>