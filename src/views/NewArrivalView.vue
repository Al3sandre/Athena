<template>
    <div class="p-6 bg-gray-100 min-h-screen">
        <h1 class="text-3xl font-bold text-center mb-6 text-gray-800">Créer un Nouvel Arrivage</h1>
        <div class="bg-white p-6 rounded-lg shadow-md">
            <!-- Recherche de produit -->
            <div class="mb-6">
                <label for="product-search" class="block text-sm font-medium text-gray-700">Rechercher un produit
                    :</label>
                <input v-model="searchQuery" id="product-search" type="text" placeholder="Rechercher un produit..."
                    class="w-full mt-2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <ul v-if="searchQuery.length > 0 && filteredProducts.length > 0"
                    class="mt-2 border rounded bg-white shadow-md max-h-48 overflow-y-auto">
                    <li v-for="product in filteredProducts" :key="product.id" @click="selectProduct(product)"
                        class="px-4 py-2 cursor-pointer hover:bg-gray-100">
                        {{ product.name }}
                    </li>
                </ul>
            </div>

            <!-- Quantité -->
            <div class="mb-6">
                <label for="quantity" class="block text-sm font-medium text-gray-700">Quantité :</label>
                <input v-model.number="quantity" id="quantity" type="number" min="1"
                    class="w-full mt-2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <!-- Coût unitaire -->
            <div class="mb-6">
                <label for="unit-cost" class="block text-sm font-medium text-gray-700">Coût unitaire :</label>
                <input v-model.number="amount" id="unit-cost" type="number" min="0"
                    class="w-full mt-2 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <!-- Ajouter au tableau -->
            <button type="button" @click="addProductToArrival"
                class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                Ajouter au tableau
            </button>

            <!-- Liste des produits ajoutés -->
            <div v-if="arrivalItems.length > 0" class="mt-6">
                <h2 class="text-xl font-semibold mb-4">Produits ajoutés</h2>
                <ul class="space-y-4">
                    <li v-for="item in arrivalItems" :key="item.product_id"
                        class="flex items-center justify-between bg-gray-50 p-4 rounded shadow-md">
                        <div>
                            <p class="font-semibold">{{ getProductDetails(item.product_id).name }}</p>
                            <p class="text-sm text-gray-500">Quantité : {{ item.quantity }}</p>
                            <p class="text-sm text-gray-500">Coût unitaire : {{ item.amount }} €</p>
                            <p class="text-sm text-gray-500 font-bold">Montant total : {{ item.quantity * item.amount
                            }} €</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            <input v-if="isEditing(item.product_id)" type="number" v-model.number="item.quantity"
                                min="1"
                                class="w-16 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                @blur="disableEditing(item.product_id)" />
                            <button v-else @click="enableEditing(item.product_id)"
                                class="text-blue-500 hover:text-blue-700">
                                Modifier
                            </button>
                            <button @click="removeProductFromArrival(item.product_id)"
                                class="text-red-500 hover:text-red-700">
                                Supprimer
                            </button>
                        </div>
                    </li>
                </ul>
                <div class="mt-4 text-right font-bold text-lg">
                    Montant total global : {{ totalAmount }} €
                </div>
            </div>

            <!-- Bouton de confirmation -->
            <button :disabled="isSubmitting" @click="confirmArrival" class="btn btn-primary">
                Valider l'arrivage
            </button>
        </div>
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
    return products.value.filter(product =>
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});
const selectedProduct = ref(null);
const quantity = ref(1);
const amount = ref(0); // Nouveau champ pour le coût unitaire
const arrivalItems = ref([]);
const editingItem = ref(null);
const isSubmitting = ref(false);

const selectProduct = (product) => {
    selectedProduct.value = product.id;
    searchQuery.value = product.name;
};

const addProductToArrival = () => {
    if (selectedProduct.value && quantity.value > 0 && amount.value > 0) {
        const existingItem = arrivalItems.value.find(item => item.product_id === selectedProduct.value);
        if (existingItem) {
            existingItem.quantity += quantity.value;
        } else {
            arrivalItems.value.push({
                product_id: selectedProduct.value,
                quantity: quantity.value,
                amount: amount.value, // Ajout du coût unitaire
            });
        }
        selectedProduct.value = null;
        searchQuery.value = '';
        quantity.value = 1;
        amount.value = 0;
    }
};

const removeProductFromArrival = (productId) => {
    arrivalItems.value = arrivalItems.value.filter(item => item.product_id !== productId);
};

const confirmArrival = async () => {
    if (isSubmitting.value) return; // Empêche les appels multiples
    isSubmitting.value = true;

    try {
        const newArrival = await arrivalStore.addArrival({
            amount: arrivalItems.value.reduce((total, item) => total + item.quantity * item.amount, 0),
            status: 'en cours',
        });

        for (const item of arrivalItems.value) {
            await arrivalStore.addArrivalProduct({
                arrival_id: newArrival.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.amount,
            });
        }

        router.push({ name: 'ArrivalManagement' });
    } catch (error) {
        console.error('Erreur lors de la confirmation de l\'arrivage:', error);
    } finally {
        isSubmitting.value = false; // Réactive le bouton après la soumission
    }
};

const getProductDetails = (productId) => {
    return products.value.find(product => product.id === productId) || {};
};

const isEditing = (productId) => editingItem.value === productId;

const enableEditing = (productId) => {
    editingItem.value = productId;
};

const disableEditing = () => {
    editingItem.value = null;
};

const totalAmount = computed(() => {
    return arrivalItems.value.reduce((total, item) => total + item.quantity * item.amount, 0);
});

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