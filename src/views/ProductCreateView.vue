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
                <label for="category">Catégorie:</label>
                <select v-model="category" id="category" required>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
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
import { ref, onMounted } from 'vue';
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

onMounted(async () => {
    await categoryStore.fetchCategories();
    categories.value = categoryStore.categories;
});

const handleFileUpload = (event) => {
    imageFile.value = event.target.files[0];
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

        console.log('Données du produit:', productData);

        if (imageFile.value) {
            const formData = new FormData();
            formData.append('image', imageFile.value);
            productData.image = formData;
        }

        await productStore.addProduct(productData);
        router.push('/products');
    } catch (error) {
        console.error('Erreur lors de la création du produit:', error);
    }
};
</script>