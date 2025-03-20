<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Votre Panier</h1>
        <ul class="space-y-4">
            <li v-for="item in cartItems" :key="item.id"
                class="flex items-center justify-between bg-white p-4 rounded shadow-md">
                <div>
                    <p>{{ getProductDetails(item.product_id)?.name || 'Produit inconnu' }}</p>
                    <input type="number" v-model.number="item.quantity" min="1" class="border rounded px-2 py-1 w-16"
                        @change="updateQuantity(item.id, item.quantity)" />
                </div>
                <button @click="removeFromCart(item.id)"
                    class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200">
                    Retirer
                </button>
            </li>
        </ul>
        <div v-if="cartItems.length > 0" class="mt-4">
            <button @click="clearCart"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                Vider le panier
            </button>
        </div>
        <div v-else class="mt-4">
            <p class="text-center">Votre panier est vide.</p>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useCartStore } from '@/stores/cartStore';

const cartStore = useCartStore();
const cartItems = computed(() => cartStore.cartItems);

const removeFromCart = (cartItemId) => {
    cartStore.removeFromCart(cartItemId);
};

const updateQuantity = (cartItemId, quantity) => {
    cartStore.updateCartItem(cartItemId, quantity);
};

const clearCart = () => {
    cartStore.clearCart();
};
</script>

<style scoped>
/* Vous pouvez supprimer les styles existants car nous utilisons Tailwind CSS */
</style>