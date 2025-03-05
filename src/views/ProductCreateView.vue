<template>
    <div>
        <h1>Création de Produit</h1>
        <form @submit.prevent="handleSubmit">
            <div>
                <label for="name">Nom du produit:</label>
                <input v-model="name" type="text" id="name" required />
            </div>
            <div>
                <label for="description">Description:</label>
                <textarea v-model="description" id="description" required></textarea>
            </div>
            <div>
                <label for="price">Prix:</label>
                <input v-model="price" type="number" id="price" min="0" max="100" step="0.01" required />
            </div>
            <div>
                <label for="stock">Stock:</label>
                <input v-model="stock" type="number" id="stock" />
            </div>
            <div>
                <label for="category-search">Rechercher une catégorie:</label>
                <input v-model="categorySearchQuery" id="category-search" type="text" @input="searchCategories"
                    placeholder="Rechercher une catégorie..." />
                <ul v-if="categorySearchQuery.length > 0 && filteredCategories.length > 0" class="search-results">
                    <li v-for="cat in filteredCategories" :key="cat.id" @dblclick="selectCategory(cat)">
                        {{ cat.name }}
                    </li>
                </ul>
                <div v-if="categorySearchQuery.length > 0 && filteredCategories.length === 0">
                    <button type="button" @click="createCategory">Créer la catégorie "{{ categorySearchQuery
                    }}"</button>
                </div>
            </div>
            <div>
                <label for="image">Image:</label>
                <input type="file" @change="handleFileUpload" id="image" />
            </div>
            <button type="submit">Créer</button>
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
    return categories.value.filter(cat => cat.name.toLowerCase().includes(categorySearchQuery.value.toLowerCase()));
});

onMounted(async () => {
    await categoryStore.fetchCategories();
    categories.value = categoryStore.categories;
});

const handleFileUpload = (event) => {
    imageFile.value = event.target.files[0];
};

const searchCategories = () => {
    // La recherche est déjà gérée par la computed property filteredCategories
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