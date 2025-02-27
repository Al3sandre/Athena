<template>
    <div v-if="user" class="cart-widget">
        <button @click="toggleCart">Panier ({{ cart.length }})</button>
        <div v-if="isCartOpen" class="cart-dropdown">
            <ul v-if="!isLoading">
                <li v-for="item in cart" :key="item.product_id">
                    <div v-if="getProductDetails(item.product_id)">
                        {{ getProductDetails(item.product_id).name }} - {{ item.quantity }}x
                        <button @click="removeFromCart(item.product_id)">Retirer</button>
                    </div>
                </li>
            </ul>
            <div v-else>Chargement...</div>
            <router-link to="/cart">Voir le panier</router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';

const cartStore = useCartStore();
const userStore = useUserStore();
const cart = computed(() => cartStore.cart); // Utilisez computed pour rendre réactif
const isLoading = computed(() => cartStore.isLoading); // Utilisez computed pour rendre réactif
const isCartOpen = ref(false);
const user = computed(() => userStore.user);

const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value;
};

const removeFromCart = (productId) => {
    cartStore.removeFromCart(userStore.user.id, productId);
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
.cart-widget {
    position: relative;
}

.cart-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #ccc;
    padding: 10px;
    width: 200px;
}

.cart-dropdown ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.cart-dropdown li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}
</style>