<template>
    <div class="p-4 relative">
        <h1 class="text-2xl font-bold mb-4">Votre Panier</h1>
        <ul class="space-y-4">
            <li v-for="item in cart" :key="item.product_id"
                class="flex items-center justify-between bg-white p-4 rounded shadow-md">
                <div>
                    <p v-if="getProductDetails(item.product_id)">
                        {{ getProductDetails(item.product_id).name }} -
                        <span v-if="!isEditing(item.product_id)" @dblclick="enableEditing(item.product_id)"
                            class="cursor-pointer">
                            {{ item.quantity }}g
                        </span>
                        <input v-else type="number" v-model.number="item.quantity"
                            @blur="disableEditing(item.product_id)" min="1" class="border rounded px-2 py-1 w-16" />
                    </p>
                    <p v-else>Produit non trouvé</p>
                </div>
                <button @click="removeFromCart(item.product_id)"
                    class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200">
                    Retirer
                </button>
            </li>
        </ul>
        <div v-if="cart.length > 0" class="mt-4">
            <button @click="placeOrder"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                Passer la commande
            </button>
        </div>
        <div v-else class="mt-4">
            <p class="text-center">Votre panier est vide.</p>
        </div>
        <div v-if="showNotification" class="fixed inset-0 flex items-center justify-center z-50">
            <div class="bg-green-500 text-white px-4 py-2 rounded shadow-md">
                <p class="text-center">Commande passée avec succès.</p>
                <router-link to="/orders" class="text-white underline">
                    Voir mes commandes
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useOrderStore } from '@/stores/orderStore';
import { useNotificationStore } from '@/stores/notifications';

const cartStore = useCartStore();
const orderStore = useOrderStore();
const notificationStore = useNotificationStore();
const cart = computed(() => cartStore.cart);
const editingItem = ref(null);
const showNotification = ref(false);

const getProductDetails = (productId) => {
    return cartStore.products.find(product => product.id === productId);
};

const updateQuantity = (productId, quantity) => {
    cartStore.updateQuantity(productId, quantity);
};

const removeFromCart = (productId) => {
    cartStore.removeFromCart(productId);
};

const placeOrder = async () => {
    try {
        await orderStore.placeOrder();
        showNotification.value = true;
        setTimeout(() => {
            showNotification.value = false;
        }, 5000);
    } catch (error) {
        console.error('Erreur lors de la validation de la commande:', error);
        notificationStore.addNotification('Erreur lors de la validation de la commande.', 'error', 5000);
    }
};

const isEditing = (productId) => {
    return editingItem.value === productId;
};

const enableEditing = (productId) => {
    editingItem.value = productId;
};

const disableEditing = (productId) => {
    updateQuantity(productId, cart.value.find(item => item.product_id === productId).quantity);
    editingItem.value = null;
};
</script>

<style scoped>
/* Vous pouvez supprimer les styles existants car nous utilisons Tailwind CSS */
</style>