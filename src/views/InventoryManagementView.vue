<template>
    <div>
        <h1>Gestion de l'Inventaire</h1>
        <ul>
            <li v-for="product in products" :key="product.id">
                <p>Nom : {{ product.name }}</p>
                <p>Stock : {{ product.stock }}</p>
                <label for="newStock">Nouveau Stock :</label>
                <input v-model.number="product.newStock" id="newStock" type="number" min="0" />
                <button @click="updateStock(product)">Mettre à jour le stock</button>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';

const productStore = useProductStore();
const products = computed(() => productStore.products);

const updateStock = async (product) => {
    await productStore.updateProduct(product.id, { stock: product.newStock });
    await productStore.fetchProducts();
};

onMounted(async () => {
    await productStore.fetchProducts();
});
</script>