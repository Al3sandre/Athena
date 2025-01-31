<template>
    <div>
        <h1>Liste des Produits</h1>
        <ul>
            <li v-for="product in products" :key="product.id">
                {{ product.name }} - {{ product.price }}€
            </li>
        </ul>
    </div>
</template>

<script setup>
import { useProductStore } from '@/stores/productStore';
import { computed } from 'vue';

const productStore = useProductStore();
const products = computed(() => productStore.products);
</script>