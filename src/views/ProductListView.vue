<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Liste des Produits</h1>
        <div class="mb-4 flex items-center space-x-4">
            <input v-model="searchQuery" type="text" placeholder="Rechercher un produit"
                class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select v-model="selectedCategory"
                class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Toutes les catégories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}
                </option>
            </select>
            <button v-if="isAdmin" @click="goToCreateProduct"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                Créer un produit
            </button>
        </div>
        <ul class="space-y-4">
            <li v-for="product in filteredProducts" :key="product.id" class="bg-white p-4 rounded shadow-md">
                <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }"
                    class="flex items-center space-x-4">
                    <img :src="getImageUrl(product)" alt="Image du produit" class="w-16 h-16 object-cover rounded" />
                    <div>
                        <h2 class="text-xl font-semibold">{{ product.name }}</h2>
                        <p>Catégorie: {{ product.expand?.category?.name || 'Non spécifiée' }}</p>
                        <p>Prix: {{ product.price }}€</p>
                        <p>Quantité disponible: {{ product.stock }}</p>
                    </div>
                </router-link>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { useProductStore } from '@/stores/productStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useUserStore } from '@/stores/userStore';
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const userStore = useUserStore();
const router = useRouter();
const searchQuery = ref('');
const selectedCategory = ref('');

const products = ref([]);

onMounted(async () => {
    try {
        await productStore.fetchProducts(); // Recharge les produits depuis l'API
        products.value = productStore.products; // Met à jour la liste locale des produits
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
    }
});

const categories = computed(() => categoryStore.categories);
const isAdmin = computed(() => userStore.getRole() === 'admin');

const filteredProducts = computed(() => {
    return products.value.filter(product => {
        return (
            (!searchQuery.value || product.name.toLowerCase().includes(searchQuery.value.toLowerCase())) &&
            (!selectedCategory.value || product.expand.category.id === selectedCategory.value)
        );
    });
});

const goToCreateProduct = () => {
    router.push({ name: 'product-create' });
};
const getImageUrl = (product) => {
    return productStore.getImageUrl(product);
};

onMounted(() => {
    categoryStore.fetchCategories();
});
</script>