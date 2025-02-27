<template>
    <div>
        <h1>Détails du Produit</h1>
        <div v-if="!loading">
            <div v-if="product">
                <div v-if="isAdmin">
                    <!-- Champs d'édition pour les administrateurs -->
                    <div @dblclick="editField('name')">
                        <label for="name">Nom :</label>
                        <input v-if="editableField === 'name'" v-model="product.name" id="name" type="text"
                            @blur="saveField" />
                        <span v-else>{{ product.name }}</span>
                    </div>

                    <div @dblclick="editField('description')">
                        <label for="description">Description :</label>
                        <textarea v-if="editableField === 'description'" v-model="product.description" id="description"
                            @blur="saveField"></textarea>
                        <span v-else>{{ product.description }}</span>
                    </div>

                    <div @dblclick="editField('price')">
                        <label for="price">Prix :</label>
                        <input v-if="editableField === 'price'" v-model="product.price" id="price" type="number"
                            step="0.01" @blur="saveField" />
                        <span v-else>{{ product.price }}€</span>
                    </div>

                    <div @dblclick="editField('stock')">
                        <label for="stock">Stock :</label>
                        <input v-if="editableField === 'stock'" v-model="product.stock" id="stock" type="number"
                            @blur="saveField" />
                        <span v-else>{{ product.stock }}</span>
                    </div>

                    <div @dblclick="editField('category')">
                        <label for="category">Catégorie :</label>
                        <div v-if="editableField === 'category'">
                            <div>
                                <button v-for="category in categories" :key="category.id"
                                    @click="selectCategory(category.id)"
                                    :class="{ selected: product.category === category.id }">
                                    {{ category.name }}
                                </button>
                            </div>
                        </div>
                        <span v-else>{{ getCategoryName(product.category) || 'Non spécifiée' }}</span>
                    </div>

                    <div>
                        <img :src="getImageUrl(product)" alt="Image du produit" @click="triggerFileInput"
                            style="cursor: pointer;" />
                        <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;" />
                    </div>

                    <button @click="saveChanges">Enregistrer</button>
                </div>
                <div v-else>
                    <!-- Affichage des détails du produit pour les utilisateurs -->
                    <p>Nom : {{ product.name }}</p>
                    <p>Description : {{ product.description }}</p>
                    <p>Prix : {{ product.price }}€</p>
                    <p>Stock : {{ product.stock }}</p>
                    <p>Catégorie : {{ getCategoryName(product.category) || 'Non spécifiée' }}</p>
                    <img :src="getImageUrl(product)" alt="Image du produit" />

                    <!-- Champ de saisie pour la quantité et bouton d'ajout au panier -->
                    <div>
                        <label for="quantity">Quantité :</label>
                        <input v-model.number="quantity" id="quantity" type="number" min="1" />
                        <button @click="addToCart">Ajouter au panier</button>
                    </div>
                </div>
                <button @click="goBack">Retour à la liste des produits</button>
            </div>
            <p v-else>Produit introuvable</p>
        </div>
        <p v-else>Chargement...</p>
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

const router = useRouter();
const route = useRoute();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const userStore = useUserStore();
const cartStore = useCartStore();
const notificationStore = useNotificationStore();

const product = ref(null);
const categories = ref([]);
const isAdmin = computed(() => userStore.getRole() === 'admin');
const editableField = ref(null);
const imageFile = ref(null);
const fileInput = ref(null);
const loading = ref(true);
const quantity = ref(1); // Quantité par défaut

onMounted(async () => {
    try {
        await categoryStore.fetchCategories();
        categories.value = categoryStore.categories;
        product.value = await productStore.fetchProductById(route.params.id);
        product.value.category = product.value.expand?.category?.id || ''; // Assurez-vous que la catégorie est correctement définie
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
    } finally {
        loading.value = false;
    }
});

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

const selectCategory = (categoryId) => {
    product.value.category = categoryId;
    saveField();
};

const saveChanges = async () => {
    try {
        loading.value = true;
        let updatedProduct;
        if (imageFile.value) {
            const formData = new FormData();
            formData.append('name', product.value.name);
            formData.append('description', product.value.description);
            formData.append('price', product.value.price);
            formData.append('stock', product.value.stock);
            formData.append('category', product.value.category);
            formData.append('image', imageFile.value);
            updatedProduct = await productStore.updateProduct(product.value.id, formData);
        } else {
            updatedProduct = await productStore.updateProduct(product.value.id, product.value);
        }
        product.value = updatedProduct; // Mettre à jour l'état local du produit
        alert('Modifications enregistrées avec succès');
    } catch (error) {
        console.error('Erreur lors de l’enregistrement des modifications:', error);
    } finally {
        loading.value = false;
    }
};

const goBack = () => {
    router.push('/products');
};

const getImageUrl = (product) => {
    return productStore.getImageUrl(product);
};

const getCategoryName = (categoryId) => {
    const category = categories.value.find(cat => cat.id === categoryId);
    return category ? category.name : '';
};

const addToCart = () => {
    if (quantity.value <= 0) {
        notificationStore.notify({ type: 'error', message: 'La quantité doit être supérieure à 0.' });
        return;
    }
    if (quantity.value > product.value.stock) {
        notificationStore.notify({ type: 'error', message: 'Quantité demandée supérieure au stock disponible.' });
        return;
    }
    cartStore.addToCart({ ...product.value, quantity: quantity.value });
    notificationStore.notify({ type: 'success', message: 'Produit ajouté au panier.' });
};
</script>

<style scoped>
.selected {
    background-color: #007bff;
    color: white;
}
</style>