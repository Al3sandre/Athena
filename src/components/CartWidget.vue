<template>
    <div v-if="user" class="relative">
        <button @click.stop="toggleCart"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
            Panier ({{ cartItems.length }})
        </button>
        <transition name="slide-fade">
            <div v-if="isCartOpen" ref="cartWidget"
                class="absolute top-full right-0 bg-white border border-gray-300 p-4 w-64 mt-2 rounded shadow-lg max-h-64 overflow-y-auto">
                <ul v-if="!isLoading">
                    <li v-for="item in cartItems" :key="item.id" class="flex justify-between items-center mb-2">
                        <div>
                            <p>{{ getProductDetails(item.product_id)?.name || 'Produit inconnu' }}</p>
                            <input type="number" v-model.number="item.quantity" min="1"
                                class="border rounded px-2 py-1 w-16"
                                @change="updateQuantity(item.id, item.quantity)" />
                        </div>
                        <button @click="removeFromCart(item.id)"
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
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { useProductStore } from '@/stores/productStore';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const userStore = useUserStore();
const productStore = useProductStore();
const router = useRouter();
const cartItems = computed(() => cartStore.cartItems);
const isLoading = computed(() => cartStore.isLoading);
const isCartOpen = ref(false);
const user = computed(() => userStore.user);
const cartWidget = ref(null);

const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value;
};

const removeFromCart = (cartItemId) => {
    cartStore.removeFromCart(cartItemId);
};

const getProductDetails = (productId) => {
    return cartStore.products.find(product => product.id === productId);
};

const updateQuantity = (cartItemId, quantity) => {
    cartStore.updateCartItem(cartItemId, quantity);
};

const fetchCartData = async () => {
    if (user.value) {
        await cartStore.fetchCart(user.value.id);
    }
};

const handleClickOutside = (event) => {
    if (cartWidget.value && !cartWidget.value.contains(event.target)) {
        isCartOpen.value = false;
    }
};

onMounted(() => {
    fetchCartData();
    document.addEventListener('click', handleClickOutside);
    router.afterEach(() => {
        isCartOpen.value = false;
    });
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});

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