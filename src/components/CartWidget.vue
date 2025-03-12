<template>
    <div v-if="user" class="relative">
        <button @click="toggleCart"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
            Panier ({{ cart.length }})
        </button>
        <transition name="slide-fade">
            <div v-if="isCartOpen"
                class="absolute top-full right-0 bg-white border border-gray-300 p-4 w-64 mt-2 rounded shadow-lg max-h-64 overflow-y-auto">
                <ul v-if="!isLoading">
                    <li v-for="item in cart" :key="item.product_id" class="flex justify-between items-center mb-2">
                        <div v-if="getProductDetails(item.product_id)" class="flex items-center space-x-2">
                            <img :src="getImageUrl(getProductDetails(item.product_id))" alt="Image du produit"
                                class="w-12 h-12 object-cover rounded" />
                            <div>
                                <p>{{ getProductDetails(item.product_id).name }}</p>
                                <input type="number" v-model.number="item.quantity" min="1"
                                    class="border rounded px-2 py-1 w-16"
                                    @change="updateQuantity(item.product_id, item.quantity)" />
                            </div>
                        </div>
                        <button @click="removeFromCart(item.product_id)"
                            class="text-red-500 hover:text-red-700 transition duration-200">Retirer</button>
                    </li>
                </ul>
                <div v-else>Chargement...</div>
                <router-link to="/cart" class="text-blue-500 hover:text-blue-700 transition duration-200">Voir le
                    panier</router-link>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { useProductStore } from '@/stores/productStore';

const cartStore = useCartStore();
const userStore = useUserStore();
const productStore = useProductStore();
const cart = computed(() => cartStore.cart);
const isLoading = computed(() => cartStore.isLoading);
const isCartOpen = ref(false);
const user = computed(() => userStore.user);

const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value;
};

const removeFromCart = (productId) => {
    cartStore.removeFromCart(productId);
};

const getProductDetails = (productId) => {
    return cartStore.products.find(product => product.id === productId);
};

const getImageUrl = (product) => {
    return productStore.getImageUrl(product);
};

const updateQuantity = (productId, quantity) => {
    cartStore.updateQuantity(productId, quantity);
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
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}
</style>