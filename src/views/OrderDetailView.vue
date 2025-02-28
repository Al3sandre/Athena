<template>
    <div>
        <h1>Détails de la Commande</h1>
        <div v-if="order">
            <p>ID de la commande : {{ order.id }}</p>
            <p>Utilisateur : {{ userName }}</p>
            <p>Produits :</p>
            <ul>
                <li v-for="product in products" :key="product.id">
                    <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }">
                        <img :src="product.image" alt="Image du produit" width="50" height="50">
                        <span>{{ product.name }}</span>
                    </router-link>
                    <p>Quantité : {{ product.quantity }}</p>
                    <p>Tarif unitaire : {{ product.price.toFixed(2) }} €</p>
                    <p>Prix total : {{ (product.price * product.quantity).toFixed(2) }} €</p>
                </li>
            </ul>
            <p>Montant total de la commande : {{ totalOrderPrice.toFixed(2) }} €</p>
            <p>Statut : {{ order.status }}</p>
            <p>Créé le : {{ new Date(order.created).toLocaleString() }}</p>
            <p>Mis à jour le : {{ new Date(order.updated).toLocaleString() }}</p>
        </div>
        <div v-else>
            <p>Chargement des détails de la commande...</p>
        </div>
    </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useOrderStore } from '@/stores/orderStore';
import { useUserStore } from '@/stores/userStore';
import { useProductStore } from '@/stores/productStore';
import { ref, computed, onMounted } from 'vue';

const route = useRoute();
const orderStore = useOrderStore();
const userStore = useUserStore();
const productStore = useProductStore();
const order = ref(null);
const userName = ref('');
const products = ref([]);

const fetchOrder = async () => {
    order.value = await orderStore.fetchOrderById(route.params.id);
    if (order.value) {
        const user = await userStore.fetchUserById(order.value.user_id);
        userName.value = user ? user.name : 'Utilisateur inconnu';
        products.value = await Promise.all(order.value.product.map(async (product) => {
            const productDetails = await productStore.fetchProductById(product.product_id);
            return {
                ...productDetails,
                quantity: product.quantity,
                image: productStore.getImageUrl(productDetails)
            };
        }));
    }
};

const totalOrderPrice = computed(() => {
    return products.value.reduce((total, product) => {
        return total + (product.price * product.quantity);
    }, 0);
});

onMounted(() => {
    fetchOrder();
});
</script>