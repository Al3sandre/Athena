<template>
    <div>
        <h1>Liste des Produits</h1>
        <div>
            <input v-model="searchQuery" type="text" placeholder="Rechercher un produit" />
            <select v-model="selectedCategory">
                <option value="">Toutes les catégories</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}
                </option>
            </select>
            <button v-if="isAdmin" @click="goToCreateProduct">Créer un produit</button>
        </div>
        <ul>
            <li v-for="product in filteredProducts" :key="product.id">
                <img :src="getImageUrl(product)" alt="Image du produit" />
                <div>
                    <h2>{{ product.name }}</h2>
                    <p>Catégorie: {{ product.expand?.category?.name }}</p>
                    <p>Prix: {{ product.price }}€</p>
                    <p>Quantité disponible: {{ product.stock }}</p>
                </div>
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

const products = computed(() => productStore.products);
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
    return productStore.getImageUrl(product)
};
onMounted(() => {
    productStore.fetchProducts();
    categoryStore.fetchCategories().then(() => {
        console.log(categories.value);
    });
});
</script>