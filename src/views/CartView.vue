<template>
    <div>
        <h1>Votre Panier</h1>
        <ul>
            <li v-for="item in cart" :key="item.id">
                {{ item.name }} - {{ item.quantity }}x
            </li>
        </ul>
    </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cartStore';
import { computed } from 'vue';

const cartStore = useCartStore();
const cart = computed(() => cartStore.cart);
</script>