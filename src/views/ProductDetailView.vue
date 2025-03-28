<template>
    <div class="p-6 bg-gray-100 min-h-screen">
        <div class="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
            <h1 class="text-3xl font-bold mb-6 text-gray-800">Détails du Produit</h1>
            <div v-if="!loading">
                <div v-if="product">
                    <div v-if="isAdmin">
                        <!-- Champs d'édition pour les administrateurs -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label for="name" class="block text-sm font-medium text-gray-700">Nom :</label>
                                <div @dblclick="editField('name')" class="mt-1">
                                    <input v-if="editableField === 'name'" v-model="product.name" id="name" type="text"
                                        @blur="saveField"
                                        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <span v-else class="block text-gray-800">{{ product.name }}</span>
                                </div>
                            </div>

                            <div>
                                <label for="description" class="block text-sm font-medium text-gray-700">Description
                                    :</label>
                                <div @dblclick="editField('description')" class="mt-1">
                                    <textarea v-if="editableField === 'description'" v-model="product.description"
                                        id="description" @blur="saveField"
                                        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                    <span v-else class="block text-gray-800">{{ product.description }}</span>
                                </div>
                            </div>

                            <div>
                                <label for="price" class="block text-sm font-medium text-gray-700">Prix :</label>
                                <div @dblclick="editField('price')" class="mt-1">
                                    <input v-if="editableField === 'price'" v-model="product.price" id="price"
                                        type="number" step="0.01" @blur="saveField"
                                        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <span v-else class="block text-gray-800">{{ product.price }}€</span>
                                </div>
                            </div>

                            <div>
                                <label for="stock" class="block text-sm font-medium text-gray-700">Stock :</label>
                                <div @dblclick="editField('stock')" class="mt-1">
                                    <input v-if="editableField === 'stock'" v-model="product.stock" id="stock"
                                        type="number" @blur="saveField"
                                        class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <span v-else class="block text-gray-800">{{ product.stock }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="mt-6">
                            <label for="category" class="block text-sm font-medium text-gray-700">Catégories :</label>
                            <div v-if="editableField === 'category'" class="mt-2">
                                <div class="flex flex-wrap gap-2">
                                    <button v-for="category in categories" :key="category.id"
                                        @click="toggleCategorySelection(category.id)"
                                        :class="{ 'bg-blue-500 text-white': product.categories.includes(category.id) }"
                                        class="px-4 py-2 border rounded hover:bg-blue-100 transition">
                                        {{ category.name }}
                                    </button>
                                </div>
                            </div>
                            <span v-else class="block mt-2 text-gray-800">
                                {{ product.categories && product.categories.length > 0
                                    ? getSelectedCategoryNames(product.categories).join(', ')
                                    : 'Non spécifiées' }}
                            </span>
                        </div>

                        <div class="mt-6">
                            <label class="block text-sm font-medium text-gray-700">Image :</label>
                            <div class="mt-2">
                                <img :src="getImageUrl(product)" alt="Image du produit" @click="triggerFileInput"
                                    class="cursor-pointer w-32 h-32 object-cover rounded shadow-md" />
                                <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden" />
                            </div>
                        </div>

                        <div class="mt-6 flex justify-end gap-4">
                            <button @click="saveChanges"
                                class="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition duration-200">
                                Enregistrer
                            </button>
                            <button @click="goBack"
                                class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition duration-200">
                                Retour
                            </button>
                        </div>
                    </div>

                    <div v-else>
                        <!-- Affichage des détails du produit pour les utilisateurs -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <p><strong>Nom :</strong> {{ product.name }}</p>
                            <p><strong>Description :</strong> {{ product.description }}</p>
                            <p><strong>Prix :</strong> {{ product.price }}€</p>
                            <p><strong>Stock :</strong> {{ reactiveStock }}</p>
                            <p><strong>Catégories :</strong>
                                {{ product.categories && product.categories.length > 0
                                    ? getSelectedCategoryNames(product.categories).join(', ')
                                    : 'Non spécifiées' }}
                            </p>
                        </div>
                        <div class="mt-6">
                            <img :src="getImageUrl(product)" alt="Image du produit"
                                class="w-32 h-32 object-cover rounded shadow-md" />
                        </div>
                    </div>

                    <!-- Champ de saisie pour la quantité et bouton d'ajout au panier -->
                    <div class="mt-6">
                        <label for="quantity" class="block text-sm font-medium text-gray-700">Quantité :</label>
                        <input v-model.number="quantity" id="quantity" type="number" min="1"
                            class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button @click="addToCart"
                            class="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition duration-200">
                            Ajouter au panier
                        </button>
                    </div>
                </div>
                <p v-else class="text-gray-500">Produit introuvable</p>
            </div>
            <p v-else class="text-gray-500">Chargement...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useUserStore } from '@/stores/userStore';
import { useCartStore } from '@/stores/cartStore';
import { useNotificationStore } from '@/stores/notifications';
import { useStockStore } from '@/stores/stockstore';

const router = useRouter();
const route = useRoute();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const userStore = useUserStore();
const cartStore = useCartStore();
const notificationStore = useNotificationStore();
const stockStore = useStockStore();

const product = ref(null);
const categories = ref([]);
const isAdmin = computed(() => userStore.getRole() === 'admin');
const editableField = ref(null);
const imageFile = ref(null);
const fileInput = ref(null);
const loading = ref(true);
const quantity = ref(1); // Quantité par défaut
const reactiveStock = ref(0); // Définir une valeur initiale pour le stock

onMounted(async () => {
    try {
        await categoryStore.fetchCategories();
        categories.value = categoryStore.categories;
        product.value = await productStore.fetchProductById(route.params.id);
        product.value.categories = product.value.categories || []; // Assurez-vous que categories est un tableau

        const stock = await stockStore.fetchStockByProductId(product.value.id);
        reactiveStock.value = stock; // Mettre à jour la valeur du stock
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
    } finally {
        loading.value = false;
    }
});

const toggleCategorySelection = (categoryId) => {
    const index = product.value.categories.indexOf(categoryId);
    if (index === -1) {
        product.value.categories.push(categoryId); // Ajouter la catégorie si elle n'est pas sélectionnée
    } else {
        product.value.categories.splice(index, 1); // Retirer la catégorie si elle est déjà sélectionnée
    }
};

const getSelectedCategoryNames = (categories) => {
    if (!categories || !Array.isArray(categories)) {
        return []; // Retourne un tableau vide si categories est undefined ou non valide
    }
    return categories.map(category => category.name);
};

const editField = (field) => {
    editableField.value = field;
};

const saveField = () => {
    editableField.value = null;
};

const handleFileUpload = (event) => {
    imageFile.value = event.target.files[0];
};

const triggerFileInput = () => {
    fileInput.value.click();
};

const saveChanges = async () => {
    try {
        loading.value = true;

        const formData = new FormData();
        formData.append('name', product.value.name || ''); // Assurez-vous que le champ est défini
        formData.append('description', product.value.description || '');
        formData.append('price', parseFloat(product.value.price) || 0); // Convertir en nombre
        formData.append('stock', parseInt(product.value.stock, 10) || 0); // Convertir en entier

        // Ajouter les catégories comme des champs individuels
        const categoryIds = product.value.categories
            .filter(category => typeof category === 'number' || (category && category.id)) // Filtrer les catégories invalides
            .map(category => (typeof category === 'number' ? category : category.id)); // Extraire les IDs
        categoryIds.forEach(id => formData.append('categories[]', id)); // Ajouter chaque ID individuellement

        if (imageFile.value) {
            formData.append('image', imageFile.value); // Ajouter l'image si elle est présente
        }

        // Envoyer la requête de mise à jour
        await productStore.updateProduct(product.value.id, formData);

        // Rediriger vers la liste des produits après la mise à jour
        router.push('/products');
    } catch (error) {
        console.error('Erreur lors de la mise à jour du produit :', error.response?.data || error.message);
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    router.push('/products');
};

const getImageUrl = (product) => {
    if (!product.image) {
        return '/placeholder-image.png'; // Image par défaut si aucune image n'est disponible
    }
    return `${import.meta.env.VITE_BASE_IMAGE_URL}/storage/${product.image}`;
};

const addToCart = () => {
    if (quantity.value <= 0) {
        notificationStore.addNotification('La quantité doit être supérieure à 0.', 'error', 5000);
        return;
    }

    if (quantity.value > product.value.stock) {
        notificationStore.addNotification(
            `La quantité demandée (${quantity.value}) dépasse le stock disponible (${product.value.stock}).`,
            'error',
            5000
        );
        return;
    }

    cartStore.addToCart(product.value.id, quantity.value);
    notificationStore.addNotification('Produit ajouté au panier.', 'success', 5000);
};
</script>

<style scoped>
.selected {
    background-color: #007bff;
    color: white;
}
</style>