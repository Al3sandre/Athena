<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">Création de Produit</h1>
        <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
                <label for="name" class="block mb-2">Nom du produit:</label>
                <input v-model="name" type="text" id="name" required
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label for="description" class="block mb-2">Description:</label>
                <textarea v-model="description" id="description" required
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <div>
                <label for="price" class="block mb-2">Prix:</label>
                <input v-model="price" type="number" id="price" min="0" step="0.01" required
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label for="stock" class="block mb-2">Stock:</label>
                <input v-model="stock" type="number" id="stock"
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label for="category-search" class="block mb-2">Rechercher une catégorie:</label>
                <input v-model="categorySearchQuery" id="category-search" type="text"
                    placeholder="Rechercher une catégorie..."
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <ul v-if="categorySearchQuery && filteredCategories.length > 0" class="search-results mt-2">
                    <li v-for="cat in filteredCategories" :key="cat.id" @click="toggleCategory(cat)"
                        class="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center">
                        <span>{{ cat.name }}</span>
                        <span v-if="selectedCategories.includes(cat.id)" class="text-green-500 font-bold">✔</span>
                    </li>
                </ul>
                <div v-if="categorySearchQuery && filteredCategories.length === 0" class="mt-2">
                    <button type="button" @click="createCategory"
                        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200">
                        Créer la catégorie "{{ categorySearchQuery }}"
                    </button>
                </div>
                <div v-if="categoryCreationMessage" class="mt-2 text-green-600">
                    {{ categoryCreationMessage }}
                </div>
            </div>
            <div class="mt-4">
                <h2 class="text-lg font-bold mb-2">Catégories sélectionnées :</h2>
                <ul>
                    <li v-for="catId in selectedCategories" :key="catId" class="flex justify-between items-center">
                        <span>{{ getCategoryName(catId) }}</span>
                        <button @click="removeCategory(catId)" class="text-red-500 hover:underline">Retirer</button>
                    </li>
                </ul>
            </div>
            <div>
                <label for="image" class="block mb-2">Image:</label>
                <input type="file" @change="handleFileUpload" id="image"
                    class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button type="submit"
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">
                Créer
            </button>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useCategoryStore } from '@/stores/categoryStore';

const router = useRouter();
const productStore = useProductStore();
const categoryStore = useCategoryStore();

const name = ref('');
const description = ref('');
const price = ref(0);
const stock = ref(0);
const imageFile = ref(null);

const categories = ref([]);
const categorySearchQuery = ref('');
const selectedCategories = ref([]); // Tableau pour stocker les IDs des catégories sélectionnées
const categoryCreationMessage = ref(''); // Message de confirmation pour la création de catégorie

const filteredCategories = computed(() => {
    if (!Array.isArray(categories.value)) {
        return [];
    }
    return categories.value.filter(cat =>
        cat && cat.name && cat.name.toLowerCase().includes(categorySearchQuery.value.toLowerCase())
    );
});

onMounted(async () => {
    try {
        await categoryStore.fetchCategories();
        categories.value = categoryStore.categories;
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
    }
});

const handleFileUpload = (event) => {
    imageFile.value = event.target.files[0];
};

const toggleCategory = (cat) => {
    const index = selectedCategories.value.indexOf(cat.id);
    if (index === -1) {
        selectedCategories.value.push(cat.id); // Ajouter la catégorie si elle n'est pas déjà sélectionnée
    } else {
        selectedCategories.value.splice(index, 1); // Supprimer la catégorie si elle est déjà sélectionnée
    }
};

const createCategory = async () => {
    try {
        const response = await categoryStore.addCategory({ name: categorySearchQuery.value });
        const newCategory = response.category; // Accéder à la catégorie via la clé `category`

        if (newCategory && newCategory.id && newCategory.name) {
            categories.value.push(newCategory); // Ajouter la nouvelle catégorie à la liste locale
            selectedCategories.value.push(newCategory.id); // Sélectionner automatiquement la nouvelle catégorie
            categorySearchQuery.value = ''; // Réinitialiser le champ de recherche

            // Afficher un message de confirmation
            categoryCreationMessage.value = `Catégorie "${newCategory.name}" créée et sélectionnée.`;
        } else {
            console.error('La catégorie créée est invalide:', newCategory);
            categoryCreationMessage.value = 'Erreur : la catégorie créée est invalide.';
        }

        setTimeout(() => {
            categoryCreationMessage.value = ''; // Effacer le message après 3 secondes
        }, 3000);
    } catch (error) {
        console.error('Erreur lors de la création de la catégorie:', error);
        categoryCreationMessage.value = 'Erreur lors de la création de la catégorie.';
    }
};

const getCategoryName = (id) => {
    const category = categories.value.find(cat => cat.id === id);
    return category ? category.name : 'Catégorie inconnue';
};

const removeCategory = (id) => {
    const index = selectedCategories.value.indexOf(id);
    if (index !== -1) {
        selectedCategories.value.splice(index, 1); // Retirer la catégorie de la liste des catégories sélectionnées
    }
};

const handleSubmit = async () => {
    try {
        const formData = new FormData();
        formData.append('name', name.value);
        formData.append('description', description.value);
        formData.append('price', price.value);
        formData.append('stock', parseInt(stock.value, 10)); // Convertir en entier

        // Ajouter les catégories sélectionnées comme des champs individuels
        selectedCategories.value.forEach((categoryId, index) => {
            formData.append(`categories[${index}]`, categoryId);
        });

        if (imageFile.value) {
            formData.append('image', imageFile.value);
        }

        await productStore.addProduct(formData);

        router.push('/products');
    } catch (error) {
        console.error('Erreur lors de la création du produit:', error);
    }
};
</script>

<style scoped>
.search-results {
    list-style-type: none;
    padding: 0;
    margin: 0;
    border: 1px solid #ccc;
    max-height: 200px;
    overflow-y: auto;
}

.search-results li {
    padding: 8px;
    cursor: pointer;
}

.search-results li:hover {
    background-color: #f0f0f0;
}
</style>