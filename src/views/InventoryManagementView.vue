<!-- TODO revoir le fonctionnement de l'inventaire penser a la pagination -->
<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Gestion de l'Inventaire</h1>
        <ul class="space-y-4">
            <li v-for="product in products" :key="product.id" class="bg-white p-4 rounded shadow-md">
                <p class="font-semibold">Nom : {{ product.name }}</p>
                <p>Stock : {{ product.stock }}</p>
                <label for="newStock" class="block mt-2">Nouveau Stock :</label>
                <input v-model.number="product.newStock" id="newStock" type="number" min="0"
                    class="border rounded px-2 py-1 w-full" />
                <button @click="updateStock(product)"
                    class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                    Mettre à jour le stock
                </button>
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

<style scoped>
/* Vous pouvez supprimer les styles existants car nous utilisons Tailwind CSS */
</style>