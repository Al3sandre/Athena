<template>
    <div class="p-6 bg-gray-100 min-h-screen">
        <div class="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
            <h1 class="text-3xl font-bold mb-6 text-gray-800">Votre Panier</h1>

            <div v-if="cartItems.length > 0">
                <ul class="divide-y divide-gray-200">
                    <li v-for="item in cartItems" :key="item.id" class="py-4 flex items-center">
                        <!-- Image du produit -->
                        <img :src="getImageUrl(item.product)" alt="Produit"
                            class="w-16 h-16 object-cover rounded shadow-md mr-4" />

                        <!-- Détails du produit -->
                        <div class="flex-1">
                            <h2 class="text-lg font-semibold text-gray-800">{{ item.product?.name || 'Produit inconnu'
                                }}</h2>
                            <p class="text-sm text-gray-500">Prix unitaire : {{ formatCurrency(item.product?.price || 0)
                                }}</p>
                        </div>

                        <!-- Quantité et total -->
                        <div class="flex items-center space-x-4">
                            <input type="number" v-model.number="item.quantity" min="1"
                                class="w-16 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                @change="updateQuantity(item.id, item.quantity)" />
                            <p class="text-gray-800 font-semibold">
                                {{ formatCurrency(item.quantity * (item.product?.price || 0)) }}
                            </p>
                        </div>

                        <!-- Bouton retirer -->
                        <button @click="removeFromCart(item.id)"
                            class="ml-4 text-red-500 hover:text-red-700 transition duration-200">
                            Retirer
                        </button>
                    </li>
                </ul>

                <!-- Résumé du panier -->
                <div class="mt-6 border-t pt-4">
                    <div class="flex justify-between items-center">
                        <p class="text-lg font-semibold text-gray-800">Montant total :</p>
                        <p class="text-xl font-bold text-gray-900">{{ formatCurrency(totalCartAmount) }}</p>
                    </div>
                    <button @click="validateCart"
                        class="mt-4 w-full bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition duration-200">
                        Valider le panier
                    </button>
                </div>
            </div>

            <div v-else>
                <p class="text-center text-gray-500">Votre panier est vide.</p>
                <router-link to="/products"
                    class="mt-4 inline-block text-blue-500 hover:text-blue-700 transition duration-200">
                    Retourner à la boutique
                </router-link>
            </div>
        </div>
    </div>

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
import { useOrderStore } from '@/stores/orderStore';

const cartStore = useCartStore();
const userStore = useUserStore();
const orderStore = useOrderStore();
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

// Fonction pour obtenir l'URL de l'image
const getImageUrl = (product) => {
    if (!product?.image) {
        return '/placeholder-image.png'; // Image par défaut si aucune image n'est disponible
    }
    return `${import.meta.env.VITE_BASE_IMAGE_URL}/storage/${product.image}?t=${Date.now()}`;
};

// Surveiller les changements dans userStore.user
watch(
    () => userStore.user,
    async (newUser) => {
        if (newUser && route.name !== 'login') {
            if (!cartStore.cartId) {
                await cartStore.fetchCart();
            }
        }
    },
    { immediate: true } // Exécute immédiatement le watcher si userStore.user est déjà défini
);

// Surveiller les changements dans cartItems
watch(
    () => cartItems.value,
    (newItems) => {
        newItems.forEach(item => {
            item.product.image = item.product.image; // Force la réactivité
        });
    },
    { deep: true }
);

// Appeler fetchCart si l'utilisateur est déjà connecté au moment du montage
onMounted(async () => {
    if (userStore.user && route.name !== 'login') {
        if (!cartStore.cartId) {
            await cartStore.fetchCart();
        }
        await cartStore.syncCartItems(); // Synchronise les informations des produits
    }
});

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

const clearCart = () => {
    cartStore.clearCart();
};

const validateCart = async () => {
    try {
        const userId = userStore.user?.id; // Récupère l'ID de l'utilisateur connecté
        if (!userId) {
            throw new Error("Utilisateur non connecté.");
        }

        const orderData = {
            user_id: userId, // Utilise l'ID de l'utilisateur connecté
            total_amount: cartStore.cartItems.reduce(
                (total, item) => total + item.quantity * item.product.price,
                0
            ),
            status: 'en cours',
            items: cartStore.cartItems.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
            })),
        };

        await orderStore.createOrder(orderData);
        cartStore.clearCart(); // Vider le panier après validation
        alert('Commande validée avec succès !');
    } catch (error) {
        console.error('Erreur lors de la validation du panier:', error);
    }
};

const totalCartAmount = computed(() =>
    cartItems.value.reduce((total, item) => total + item.quantity * (item.product?.price || 0), 0)
);
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