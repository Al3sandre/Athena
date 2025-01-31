<template>
    <div>
        <h1>Liste des Produits</h1>
        <ul>
            <li v-for="product in products" :key="product.id">
                {{ product.name }} - {{ product.price }}€ - Stock: {{ product.stock }}
                <button @click="deleteProduct(product.id)">🗑️ Supprimer</button>
            </li>
        </ul>
        <button @click="addMockProduct">➕ Ajouter un produit</button>
    </div>
</template>

<script setup>
import { useProductStore } from '../stores/productStore.js';

const productStore = useProductStore();
const { products, addProduct, deleteProduct } = productStore;

const addMockProduct = () => {
    addProduct({ name: "Nouveau Produit", category: "Catégorie X", price: 120, stock: 3 });
};
</script>