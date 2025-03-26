<!-- TODO revoir le fonctionnement de l'inventaire penser a la pagination -->
<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Gestion de l'Inventaire</h1>
        <ul class="space-y-4">
            <li v-for="product in products" :key="product.id" class="bg-white p-4 rounded shadow-md">
                <p class="font-semibold">Nom : {{ product.name }}</p>
                <p>Stock : {{ product.stock }}</p>
                <label for="newStock" class="block mt-2">Nouveau Stock :</label>
                <input v-model.number="product.newStock" id="newStock" type="number" min="0"
                    class="border rounded px-2 py-1 w-full" />
                <button @click="updateStock(product)"
                    class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                    Mettre à jour le stock
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';

const productStore = useProductStore();
const products = computed(() => productStore.products);

const updateStock = async (product) => {
    try {
        // Demander confirmation avant de procéder
        const confirmation = window.confirm(
            `Êtes-vous sûr de vouloir modifier le stock de "${product.name}" à ${product.newStock} ?`
        );

        if (!confirmation) {
            return; // Annuler l'action si l'utilisateur refuse
        }

        // Récupérer les informations complètes du produit
        const fullProduct = await productStore.fetchProductById(product.id);

        // Inclure tous les champs requis dans la requête de mise à jour
        await productStore.updateProduct(product.id, {
            stock: product.newStock,
            name: fullProduct.name,
            price: fullProduct.price, // Inclure le tarif du produit
        });

        // Rafraîchir la liste des produits
        await productStore.fetchProducts();

        // Afficher un message de succès
        alert(`Le stock de "${product.name}" a été mis à jour avec succès.`);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du stock :', error);
        alert('Une erreur est survenue lors de la mise à jour du stock.');
    }
};

onMounted(async () => {
    await productStore.fetchProducts();
});
</script>

<style scoped>
/* Vous pouvez supprimer les styles existants car nous utilisons Tailwind CSS */
</style>