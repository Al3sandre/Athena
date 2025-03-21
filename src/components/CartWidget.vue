<template>
    <div v-if="user" class="relative">
        <!-- Bouton pour ouvrir/fermer le widget -->
        <button @click.stop="toggleCart"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
            Panier ({{ cartItems.length }})
        </button>

        <!-- Widget du panier -->
        <transition name="slide-fade">
            <div v-if="isCartOpen" ref="cartWidget" @click.stop
                class="absolute top-full right-0 bg-white border border-gray-300 p-4 w-64 mt-2 rounded shadow-lg max-h-64 overflow-y-auto">
                <!-- Liste des articles -->
                <ul v-if="!isLoading && cartItems.length > 0">
                    <li v-for="item in cartItems" :key="item.product_id" class="flex items-start mb-4">
                        <!-- Image du produit -->
                        <img :src="getImageUrl(item.product)" alt="Produit"
                            class="w-12 h-12 object-cover rounded mr-2" />

                        <!-- Nom, prix et quantité -->
                        <div class="flex-1">
                            <p class="font-semibold">{{ item.product?.name || 'Produit inconnu' }}</p>
                            <p class="text-sm text-gray-500">Prix : {{ formatCurrency(item.product?.price || 0) }}</p>
                            <div class="flex items-center mt-2">
                                <input type="number" v-model.number="item.quantity" min="1"
                                    class="border rounded px-2 py-1 w-16"
                                    @change="updateQuantity(item.id, item.quantity)" />
                                <button @click="removeFromCart(item.id)"
                                    class="ml-2 text-red-500 hover:text-red-700 transition duration-200">
                                    Retirer
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>

                <!-- Message si le panier est vide -->
                <div v-else-if="!isLoading && cartItems.length === 0" class="text-center text-gray-500">
                    Votre panier est vide.
                </div>

                <!-- Chargement -->
                <div v-else>Chargement...</div>

                <!-- Lien vers la page panier -->
                <router-link to="/cart" class="text-blue-500 hover:text-blue-700 transition duration-200 block mt-4">
                    Voir le panier
                </router-link>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
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

// Fonction pour obtenir l'URL de l'image
const getImageUrl = (product) => {
    return product?.image
        ? `${import.meta.env.VITE_BASE_IMAGE_URL}/storage/${product.image}`
        : '/placeholder-image.png';
};

// Fonction pour formater les prix
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
};

// Mettre à jour la quantité d'un article
const updateQuantity = (productId, quantity) => {
    cartStore.updateCartItem(productId, quantity);
};

// Supprimer un article du panier
const removeFromCart = (productId) => {
    if (confirm("Êtes-vous sûr de vouloir retirer cet article du panier ?")) {
        cartStore.removeFromCart(productId);
    }
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
    }
);

// Surveiller les changements dans isCartOpen
watch(
    () => isCartOpen.value,
    async (isOpen) => {
        if (isOpen) {
            await cartStore.syncCartItems(); // Synchronise les informations des produits
        }
    }
);

// Appeler fetchCart si l'utilisateur est déjà connecté au moment du montage
onMounted(async () => {
    if (userStore.user && route.name !== 'login') {
        if (!cartStore.cartId) {
            await cartStore.fetchCart();
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

.w-12 {
    width: 3rem;
}

.h-12 {
    height: 3rem;
}

.flex-1 {
    flex: 1;
}
</style>