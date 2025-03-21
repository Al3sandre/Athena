<template>
    <div v-if="user" class="relative">
        <button @click.stop="toggleCart"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
            Panier ({{ cartItems.length }})
        </button>
        <transition name="slide-fade">
            <div v-if="isCartOpen" ref="cartWidget" @click.stop
                class="absolute top-full right-0 bg-white border border-gray-300 p-4 w-64 mt-2 rounded shadow-lg max-h-64 overflow-y-auto">
                <ul v-if="!isLoading">
                    <li v-for="item in cartItems" :key="item.id" class="flex justify-between items-center mb-2">
                        <div>
                            <p>{{ item.product?.name || 'Produit inconnu' }}</p>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { useRoute } from 'vue-router';

const cartStore = useCartStore();
const userStore = useUserStore();
const isCartOpen = ref(false);
const route = useRoute();

const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value;
};

const cartItems = computed(() => cartStore.cartItems);
const isLoading = computed(() => cartStore.isLoading);
const user = computed(() => userStore.user);

const updateQuantity = (cartItemId, quantity) => {
    cartStore.updateCartItem(cartItemId, quantity);
};

const removeFromCart = (cartItemId) => {
    cartStore.removeFromCart(cartItemId);
};

// Surveiller les changements dans userStore.user
watch(
    () => userStore.user,
    async (newUser) => {
        if (newUser && route.name !== 'login') {
            if (!cartStore.cartId) {
                await cartStore.fetchCart();
                console.log('Cart fetched');
            }
        }
    }
);

// Appeler fetchCart si l'utilisateur est déjà connecté au moment du montage
onMounted(async () => {
    if (userStore.user && route.name !== 'login') {
        if (!cartStore.cartId) {
            await cartStore.fetchCart();
            console.log('Cart fetched');
        }
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