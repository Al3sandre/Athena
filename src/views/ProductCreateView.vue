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
                    <li v-for="cat in filteredCategories" :key="cat.id" @click="selectCategory(cat)"
                        class="px-4 py-2 cursor-pointer hover:bg-gray-100">
                        {{ cat.name }}
                    </li>
                </ul>
                <div v-if="categorySearchQuery && filteredCategories.length === 0" class="mt-2">
                    <button type="button" @click="createCategory"
                        class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200">
                        Créer la catégorie "{{ categorySearchQuery }}"
                    </button>
                </div>
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
const category = ref('');
const imageFile = ref(null);

const categories = ref([]);
const categorySearchQuery = ref('');
const filteredCategories = computed(() => {
    if (!Array.isArray(categories.value)) {
        return [];
    }
    return categories.value.filter(cat =>
        cat.name.toLowerCase().includes(categorySearchQuery.value.toLowerCase())
    );
});

onMounted(async () => {
    try {
        await categoryStore.fetchCategories();
        categories.value = categoryStore.categories;
        console.log('Catégories chargées :', categories.value); // Log pour vérifier les données
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
    }
});

const handleFileUpload = (event) => {
    imageFile.value = event.target.files[0];
};

const selectCategory = (cat) => {
    category.value = cat.id;
    categorySearchQuery.value = cat.name;
};

const createCategory = async () => {
    try {
        const newCategory = await categoryStore.addCategory({ name: categorySearchQuery.value });
        category.value = newCategory.id;
        categorySearchQuery.value = newCategory.name;
        categories.value.push(newCategory);
    } catch (error) {
        console.error('Erreur lors de la création de la catégorie:', error);
    }
};

const handleSubmit = async () => {
    try {
        const productData = {
            name: name.value,
            description: description.value,
            price: price.value,
            stock: stock.value,
            category: category.value
        };

        if (imageFile.value) {
            const formData = new FormData();
            formData.append('name', name.value);
            formData.append('description', description.value);
            formData.append('price', price.value);
            formData.append('stock', stock.value);
            formData.append('category', category.value);
            formData.append('image', imageFile.value);

            await productStore.addProduct(formData);
        } else {
            await productStore.addProduct(productData);
        }

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