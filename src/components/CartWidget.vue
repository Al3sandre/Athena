<template>
    <div v-if="user" class="relative">
        <button @click="toggleCart"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
            Panier ({{ cart.length }})
        </button>
        <div v-if="isCartOpen"
            class="absolute top-full right-0 bg-white border border-gray-300 p-4 w-64 mt-2 rounded shadow-lg">
            <ul v-if="!isLoading">
                <li v-for="item in cart" :key="item.product_id" class="flex justify-between items-center mb-2">
                    <div v-if="getProductDetails(item.product_id)">
                        {{ getProductDetails(item.product_id).name }} - {{ item.quantity }}x
                        <button @click="removeFromCart(item.product_id)"
                            class="text-red-500 hover:text-red-700 transition duration-200">Retirer</button>
                    </div>
                </li>
            </ul>
            <div v-else>Chargement...</div>
            <router-link to="/cart" class="text-blue-500 hover:text-blue-700 transition duration-200">Voir le
                panier</router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';

const cartStore = useCartStore();
const userStore = useUserStore();
const cart = computed(() => cartStore.cart);
const isLoading = computed(() => cartStore.isLoading);
const isCartOpen = ref(false);
const user = computed(() => userStore.user);

const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value;
};

const removeFromCart = (productId) => {
    console.log('Retirer du panier:', productId); // Log de débogage
    cartStore.removeFromCart(productId);
};

const getProductDetails = (productId) => {
    return cartStore.products.find(product => product.id === productId);
};

const fetchCartData = async () => {
    if (user.value) {
        await cartStore.fetchCart(user.value.id);
    }
};

onMounted(fetchCartData);

watch(user, async (newUser) => {
    if (newUser) {
        await fetchCartData();
    }
});
</script>

<style scoped>
/* Vous pouvez supprimer les styles existants car nous utilisons Tailwind CSS */
</style>