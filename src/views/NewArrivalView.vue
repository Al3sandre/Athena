<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Nouvel Arrivage</h1>
        <form @submit.prevent="confirmArrival" class="space-y-4">
            <div>
                <label for="product-search" class="block mb-2">Rechercher un produit :</label>
                <input v-model="searchQuery" id="product-search" type="text" @input="searchProducts"
                    placeholder="Rechercher un produit..."
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <ul v-if="searchQuery.length > 0 && filteredProducts.length > 0" class="search-results mt-2">
                    <li v-for="product in filteredProducts" :key="product.id" @dblclick="selectProduct(product)"
                        class="px-4 py-2 cursor-pointer hover:bg-gray-100">
                        {{ product.name }}
                    </li>
                </ul>
            </div>
            <div>
                <label for="quantity" class="block mb-2">Quantité :</label>
                <input v-model.number="quantity" id="quantity" type="number" min="1" required
                    @keyup.enter="addProductToArrival"
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="button" @click="addProductToArrival"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                Ajouter au Arrivage
            </button>
            <ul class="mt-4 space-y-2">
                <li v-for="item in arrivalItems" :key="item.product_id" class="flex items-center space-x-4">
                    <span @dblclick="enableEditing(item.product_id)" class="cursor-pointer">
                        {{ getProductDetails(item.product_id).name }} -
                        <span v-if="!isEditing(item.product_id)">
                            {{ item.quantity }}x
                        </span>
                        <input v-else type="number" v-model.number="item.quantity"
                            @blur="disableEditing(item.product_id)" min="1" class="border rounded px-2 py-1 w-16" />
                    </span>
                </li>
            </ul>
            <button type="submit"
                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200">
                Confirmer l'Arrivage
            </button>
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
const searchQuery = ref('');
const filteredProducts = computed(() => {
    return products.value.filter(product => product.name.toLowerCase().includes(searchQuery.value.toLowerCase()));
});
const selectedProduct = ref(null);
const quantity = ref(1);
const arrivalItems = ref([]);
const editingItem = ref(null);

const searchProducts = () => {
    // La recherche est déjà gérée par la computed property filteredProducts
};

const selectProduct = (product) => {
    selectedProduct.value = product.id;
    searchQuery.value = product.name;
};

const addProductToArrival = () => {
    if (selectedProduct.value && quantity.value > 0) {
        const existingItem = arrivalItems.value.find(item => item.product_id === selectedProduct.value);
        if (existingItem) {
            existingItem.quantity += quantity.value;
        } else {
            arrivalItems.value.push({
                product_id: selectedProduct.value,
                quantity: quantity.value
            });
        }
        selectedProduct.value = null;
        searchQuery.value = '';
        quantity.value = 1;
    }
};

const confirmArrival = async () => {
    try {
        // Créer un nouvel arrivage
        const newArrival = await arrivalStore.addArrival({
            amount: arrivalItems.value.reduce((total, item) => total + item.quantity, 0),
            status: 'en cours',
            arrival_product: []
        });

        // Ajouter les produits à l'arrivage
        const arrivalProductIds = [];
        for (const item of arrivalItems.value) {
            const arrivalProduct = await arrivalStore.addArrivalProduct({
                product: item.product_id,
                quantity: item.quantity
            });
            arrivalProductIds.push(arrivalProduct.id);
        }

        // Mettre à jour l'arrivage avec les produits
        await arrivalStore.updateArrival(newArrival.id, {
            arrival_product: arrivalProductIds
        });

        await productStore.fetchProducts();
        router.push({ name: 'ArrivalManagement' });
    } catch (error) {
        console.error('Erreur lors de la confirmation de l\'arrivage:', error);
    }
};

const getProductDetails = (productId) => {
    return products.value.find(product => product.id === productId);
};

const isEditing = (productId) => {
    return editingItem.value === productId;
};

const enableEditing = (productId) => {
    editingItem.value = productId;
};

const disableEditing = (productId) => {
    editingItem.value = null;
};

onMounted(async () => {
    await productStore.fetchProducts();
});
</script>

<style scoped>
.search-results {
    list-style-type: none;
    padding: 0;
    margin: 0;
    border: 1px solid #ccc;
    max-height: 200px;
    overflow-y: auto;
}

.search-results li {
    padding: 8px;
    cursor: pointer;
}

.search-results li:hover {
    background-color: #f0f0f0;
}
</style>