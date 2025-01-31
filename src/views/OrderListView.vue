<template>
    <div>
        <h1>Liste des Commandes</h1>
        <ul>
            <li v-for="order in orders" :key="order.id">
                Commande #{{ order.id }} - {{ order.status }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { useOrderStore } from '@/stores/orderStore';
import { computed } from 'vue';

const orderStore = useOrderStore();
const orders = computed(() => orderStore.orders);
</script>