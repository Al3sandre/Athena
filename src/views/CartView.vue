<template>
    <div>
        <h1>Votre Panier</h1>
        <ul>
            <li v-for="item in cart" :key="item.product_id">
                <p v-if="getProductDetails(item.product_id)">
                    {{ getProductDetails(item.product_id).name }} -
                    <span v-if="!isEditing(item.product_id)" @dblclick="enableEditing(item.product_id)">
                        {{ item.quantity }}x
                    </span>
                    <input v-else type="number" v-model.number="item.quantity" @blur="disableEditing(item.product_id)"
                        min="1" />
                </p>
                <p v-else>Produit non trouvé</p>
                <button @click="removeFromCart(item.product_id)">Retirer</button>
            </li>
        </ul>
        <div v-if="cart.length > 0">
            <button @click="placeOrder">Passer la commande</button>
        </div>
        <div v-else>
            <p>Votre panier est vide.</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useCartStore } from '@/stores/cartStore';

const cartStore = useCartStore();
const cart = computed(() => cartStore.cart);
const editingItem = ref(null);

const getProductDetails = (productId) => {
    return cartStore.products.find(product => product.id === productId);

};

const updateQuantity = (productId, quantity) => {
    cartStore.updateQuantity(productId, quantity);
};

const removeFromCart = (productId) => {
    cartStore.removeFromCart(productId);
};

const placeOrder = () => {
    // Logique pour passer la commande
    console.log('Commande passée:', cart.value);
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
ul {
    list-style-type: none;
    padding: 0;
}

li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

input[type="number"] {
    width: 50px;
    margin-right: 10px;
}

button {
    margin-left: 10px;
}
</style>