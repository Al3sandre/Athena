<template>
    <div>
        <h1>Nouvel Arrivage</h1>
        <form @submit.prevent="confirmArrival">
            <div>
                <label for="product-search">Rechercher un produit :</label>
                <input v-model="searchQuery" id="product-search" type="text" @input="searchProducts"
                    placeholder="Rechercher un produit..." />
                <ul v-if="searchQuery.length > 0 && filteredProducts.length > 0" class="search-results">
                    <li v-for="product in filteredProducts" :key="product.id" @dblclick="selectProduct(product)">
                        {{ product.name }}
                    </li>
                </ul>
            </div>
            <div>
                <label for="quantity">Quantité :</label>
                <input v-model.number="quantity" id="quantity" type="number" min="1" required
                    @keyup.enter="addProductToArrival" />
            </div>
            <button type="button" @click="addProductToArrival">Ajouter au Arrivage</button>
            <ul>
                <li v-for="item in arrivalItems" :key="item.product_id">
                    <span @dblclick="enableEditing(item.product_id)">
                        {{ getProductDetails(item.product_id).name }} -
                        <span v-if="!isEditing(item.product_id)">
                            {{ item.quantity }}x
                        </span>
                        <input v-else type="number" v-model.number="item.quantity"
                            @blur="disableEditing(item.product_id)" min="1" />
                    </span>
                </li>
            </ul>
            <button type="submit">Confirmer l'Arrivage</button>
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