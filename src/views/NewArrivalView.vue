<template>
    <div>
        <h1>Nouvel Arrivage</h1>
        <form @submit.prevent="addArrival">
            <div>
                <label for="product">Produit :</label>
                <select v-model="selectedProduct" id="product" required>
                    <option v-for="product in products" :key="product.id" :value="product.id">
                        {{ product.name }}
                    </option>
                </select>
            </div>
            <div>
                <label for="quantity">Quantité :</label>
                <input v-model.number="quantity" id="quantity" type="number" min="1" required />
            </div>
            <button type="submit">Ajouter Arrivage</button>
        </form>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useArrivalStore } from '@/stores/arrivalStore';

const router = useRouter();
const productStore = useProductStore();
const arrivalStore = useArrivalStore();
const products = computed(() => productStore.products);
const selectedProduct = ref(null);
const quantity = ref(1);

const addArrival = async () => {
    await arrivalStore.addArrival({
        product_id: selectedProduct.value,
        quantity: quantity.value,
        date: new Date().toISOString()
    });
    await productStore.fetchProducts();
    router.push({ name: 'ArrivalManagement' });
};

onMounted(async () => {
    await productStore.fetchProducts();
});
</script>