<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Liste des Produits</h1>
        <div class="mb-4 flex items-center space-x-4">
            <!-- Barre de recherche -->
            <input v-model="searchQuery" type="text" placeholder="Rechercher un produit"
                class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <!-- Filtre par catégorie -->
            <select v-model="selectedCategory"
                class="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Toutes les catégories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}
                </option>
            </select>
            <!-- Bouton pour créer un produit -->
            <button v-if="isAdmin" @click="goToCreateProduct"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                Créer un produit
            </button>
        </div>
        <!-- Liste des produits -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div v-for="product in filteredProducts" :key="product.id" class="bg-white p-4 rounded shadow-md relative">
                <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }"
                    class="flex flex-col items-center space-y-4">
                    <img :src="getImageUrl(product)" alt="Image du produit" class="w-32 h-32 object-cover rounded" />
                    <div class="text-center">
                        <h2 class="text-lg font-semibold">{{ product.name }}</h2>
                        <p class="text-sm text-gray-600">
                            Catégories :
                            <span v-if="product.categories && product.categories.length > 0">
                                {{product.categories.map(category => category.name).join(', ')}}
                            </span>
                            <span v-else>Non spécifiées</span>
                        </p>
                        <p class="text-sm text-gray-600">Prix: {{ product.price }}€</p>
                        <p class="text-sm text-gray-600">Quantité disponible: {{ product.stock }}</p>
                    </div>
                </router-link>
                <button v-if="isAdmin" @click="deleteProduct(product.id)"
                    class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-200">
                    Supprimer
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useProductStore } from '@/stores/productStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useUserStore } from '@/stores/userStore';
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const userStore = useUserStore();
const router = useRouter();
const searchQuery = ref('');
const selectedCategory = ref('');

const products = ref([]);

// Charger les produits et les catégories
onMounted(async () => {
    try {
        await productStore.fetchProducts(); // Recharge les produits depuis l'API
        products.value = productStore.products; // Met à jour la liste locale des produits
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
    }
    categoryStore.fetchCategories();
});

// Réinitialiser le filtre de catégorie si une recherche est effectuée
watch(searchQuery, (newValue) => {
    if (newValue) {
        selectedCategory.value = ''; // Réinitialise la catégorie sélectionnée
    }
});

const categories = computed(() => categoryStore.categories);
const isAdmin = computed(() => userStore.getRole() === 'admin');

// Logique de filtrage des produits
const filteredProducts = computed(() => {
    return products.value.filter(product => {
        const matchesSearchQuery = !searchQuery.value || product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesCategory = !selectedCategory.value || product.categories.some(category => category.id === selectedCategory.value);
        return matchesSearchQuery && matchesCategory;
    });
});

const goToCreateProduct = () => {
    router.push({ name: 'product-create' });
};

const getImageUrl = (product) => {
    if (!product.image) {
        return '/placeholder-image.png'; // Image par défaut si aucune image n'est disponible
    }
    return `${import.meta.env.VITE_BASE_IMAGE_URL}/storage/${product.image}`;
};

const deleteProduct = async (productId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        try {
            await productStore.deleteProduct(productId); // Supprime le produit via le store
            await productStore.fetchProducts(); // Recharge les produits après suppression
            products.value = productStore.products; // Met à jour la liste locale
        } catch (error) {
            console.error('Erreur lors de la suppression du produit:', error);
        }
    }
};
</script>

<style scoped>
.grid {
    display: grid;
    gap: 1rem;
}

.grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
}

.sm\:grid-cols-2 {
    @media (min-width: 640px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

.md\:grid-cols-3 {
    @media (min-width: 768px) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

.lg\:grid-cols-4 {
    @media (min-width: 1024px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

img {
    border-radius: 0.5rem;
}

button {
    cursor: pointer;
}
</style>